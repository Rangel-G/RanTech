import { useReception } from '@/services/reception';
import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import Svg, {
    ClipPath,
    Defs,
    G,
    LinearGradient,
    Path,
    Rect,
    Stop
} from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface RpmRampProps {
    rpm: number;
    rpmMax?: number; // Mantido para compatibilidade, mas ignoramos variações inválidas
    style?: StyleProp<ViewStyle>;
}

export function RpmRamp({ rpm = 0, style }: RpmRampProps) {
    const data = useReception(); // Hook para obter dados de telemetria

    // FIXO: Escala fixa de 8000 RPM para evitar disparos se a ECU/Hook enviar rpmMax errado
    const ABSOLUTE_MAX_RPM = data.rpmMax;

    // Normalização segura: garante que o valor seja numérico e limitado entre 0 e 8000
    const rawRpm = typeof rpm === 'number' && !isNaN(rpm) ? rpm : 0;
    const safeRpm = Math.min(Math.max(rawRpm, 0), ABSOLUTE_MAX_RPM);

    // Mapeamento exato de 0 a 1000px na ViewBox
    // 800 RPM  -> 100px  (10% - Verde)
    // 3000 RPM -> 375px  (37.5% - Verde)
    // 6000 RPM -> 750px  (75% - Amarelo/Laranja)
    // 8000 RPM -> 1000px (100% - Vermelho)
    const targetWidth = (safeRpm / ABSOLUTE_MAX_RPM) * 1000;

    const animatedWidth = useSharedValue(0);

    useEffect(() => {
        animatedWidth.value = withTiming(targetWidth, {
            duration: 150, // Resposta mais rápida para telemetria
            easing: Easing.linear,
        });
    }, [targetWidth]);

    const animatedRectProps = useAnimatedProps(() => {
        return {
            width: animatedWidth.value,
        };
    });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.svgContainer}>
                <Svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={styles.svg}>
                    <Defs>
                        <LinearGradient
                            id="fuelTechRampGrad"
                            x1="0" y1="0" x2="1000" y2="0"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#00ff66" />
                            <Stop offset="55%" stopColor="#00ff66" />
                            <Stop offset="75%" stopColor="#ffcc00" />
                            <Stop offset="100%" stopColor="#ff3b30" />
                        </LinearGradient>

                        <ClipPath id="rampShapeClip">
                            <Path d="M 0,100 L 0,60 L 400,60 Q 650,60 1000,5 L 1000,100 Z" />
                        </ClipPath>
                    </Defs>

                    {/* Fundo Escuro da Rampa */}
                    <Path
                        d="M 0,100 L 0,60 L 400,60 Q 650,60 1000,5 L 1000,100 Z"
                        fill="#252528"
                    />

                    {/* Barra Animada */}
                    <G clipPath="url(#rampShapeClip)">
                        <AnimatedRect
                            x="0"
                            y="0"
                            height="100"
                            fill="url(#fuelTechRampGrad)"
                            animatedProps={animatedRectProps}
                        />
                    </G>
                </Svg>
            </View>

            {/* Valor de RPM no Texto */}
            <View style={styles.textOverlay}>
                <Text style={styles.rpmVal}>{Math.round(safeRpm)}</Text>
                <Text style={styles.rpmUnit}>RPM</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 80,
        position: 'relative',
        marginBottom: 12,
    },
    svgContainer: {
        width: '100%',
        height: '100%',
    },
    svg: {
        width: '100%',
        height: '100%',
    },
    textOverlay: {
        position: 'absolute',
        top: 0,
        left: 16,
        bottom: 25,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    rpmVal: {
        color: '#ffffff',
        fontSize: 36,
        fontWeight: '900',
        fontStyle: 'italic',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        fontVariant: ['tabular-nums'],
    },
    rpmUnit: {
        color: '#aaaaaa',
        fontSize: 14,
        fontWeight: '700',
        fontStyle: 'italic',
        marginLeft: 6,
        marginBottom: 6,
    }
});