import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
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
    rpmMax?: number;
    style?: StyleProp<ViewStyle>;
}

export function RpmRamp({ rpm, rpmMax = 8000, style }: RpmRampProps) {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const targetWidth = Math.min(Math.max((rpm / rpmMax) * 1000, 0), 1000);

        Animated.timing(animatedWidth, {
            toValue: targetWidth,
            duration: 350,
            useNativeDriver: false,
        }).start();
    }, [rpm, rpmMax]);

    const widthInterpolation = animatedWidth.interpolate({
        inputRange: [0, 1000],
        outputRange: ['0', '1000']
    });

    return (
        /* Mesclamos o styles.container interno com a prop style recebida */
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

                    {/* Fundo Escuro */}
                    <Path
                        d="M 0,100 L 0,60 L 400,60 Q 650,60 1000,5 L 1000,100 Z"
                        fill="#252528"
                    />

                    {/* Retângulo Animado com Gradiente */}
                    <G clipPath="url(#rampShapeClip)">
                        <AnimatedRect
                            x="0"
                            y="0"
                            height="100"
                            fill="url(#fuelTechRampGrad)"
                            width={widthInterpolation}
                        />
                    </G>
                </Svg>
            </View>

            {/* Texto Sobreposto Alinhado dinamicamente */}
            <View style={styles.textOverlay}>
                <Text style={styles.rpmVal}>{Math.round(rpm)}</Text>
                <Text style={styles.rpmUnit}>RPM</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%', // Preenche a largura por padrão
        height: 80,
        position: 'relative',
        marginBottom: 12, // Margem inferior padrão
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
        position: 'absolute', // Garante que o texto fique por cima do SVG
        top: 0,
        left: 16, // Fixa uma margem esquerda responsiva
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