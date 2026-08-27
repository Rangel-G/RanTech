import { useReception } from '@/hooks/useReception';
import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
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
    rpmMax?: number;
    style?: StyleProp<ViewStyle>;
}

export function RpmRamp({ rpm = 0, style }: RpmRampProps) {
    const data = useReception();

    const ABSOLUTE_MAX_RPM = data.rpmMax || 8000;

    const rawRpm = typeof rpm === 'number' && !isNaN(rpm) ? rpm : 0;
    const safeRpm = Math.min(Math.max(rawRpm, 0), ABSOLUTE_MAX_RPM);

    const targetWidth = (safeRpm / ABSOLUTE_MAX_RPM) * 1000;

    const animatedWidth = useSharedValue(0);
    const alertOpacity = useSharedValue(0);
    const alertScale = useSharedValue(1);

    const isWarningThreshold = safeRpm >= ABSOLUTE_MAX_RPM * 0.55;

   
    // Controle Visual e Sonoro
    useEffect(() => {
        animatedWidth.value = withTiming(targetWidth, {
            duration: 150,
            easing: Easing.linear,
        });

        if (isWarningThreshold) {
            // Animação visual piscando
            alertOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 100 }),
                    withTiming(0.2, { duration: 100 })
                ),
                -1,
                true
            );
            alertScale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                ),
                -1,
                true
            );
        } else {
            alertOpacity.value = withTiming(0, { duration: 100 });
            alertScale.value = withTiming(1, { duration: 100 });
        }
    }, [targetWidth, isWarningThreshold]);

    const animatedRectProps = useAnimatedProps(() => ({
        width: animatedWidth.value,
    }));

    const alertStyle = useAnimatedStyle(() => ({
        opacity: alertOpacity.value,
        transform: [{ scale: alertScale.value }],
    }));

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
                            <Stop offset="35%" stopColor="#00ff66" />
                            <Stop offset="55%" stopColor="#ffcc00" />
                            <Stop offset="100%" stopColor="#ff3b30" />
                        </LinearGradient>

                        <ClipPath id="rampShapeClip">
                            <Path d="M 0,100 L 0,60 L 400,60 Q 650,60 1000,5 L 1000,100 Z" />
                        </ClipPath>
                    </Defs>

                    <Path
                        d="M 0,100 L 0,60 L 400,60 Q 650,60 1000,5 L 1000,100 Z"
                        fill="#252528"
                    />

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

            <View style={styles.textOverlay}>
                <Text style={styles.rpmVal}>{Math.round(safeRpm)}</Text>
                <Text style={styles.rpmUnit}>RPM</Text>
            </View>

            <Animated.View style={[styles.warningContainer, alertStyle]} pointerEvents="none">
                <Text style={styles.warningText}>SHIFT</Text>
            </Animated.View>
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
    },
    warningContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningText: {
        color: '#ffcc00',
        fontSize: 42,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 6,
    },
});