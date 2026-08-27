import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import Svg, {
    Circle,
    ClipPath,
    Defs,
    Ellipse,
    G,
    Path,
    RadialGradient,
    Stop,
} from 'react-native-svg';

// Componente G animável pelo Reanimated
const AnimatedG = Animated.createAnimatedComponent(G);

interface TempGaugeProps {
    temperature?: number;
    maxTemp?: number;
}

export function RpmTempGaugeCard({
    temperature = 50,
    maxTemp = 120
}: TempGaugeProps) {
    const minAngle = -170;
    const maxAngle = 50;

    // Valor compartilhado para rotação
    const needleRotation = useSharedValue(minAngle);

    useEffect(() => {
        const percentage = Math.min(Math.max(temperature / maxTemp, 0), 1);
        const targetAngle = minAngle + percentage * (maxAngle - minAngle);

        needleRotation.value = withSpring(targetAngle, {
            damping: 15,
            stiffness: 90,
        });
    }, [temperature, maxTemp, needleRotation]);

    // Rotação pura com coordenadas de centro do SVG (25.797, 25.797)
    const animatedNeedleProps = useAnimatedProps(() => ({
        transform: [
            { translateX: 25.797 },
            { translateY: 25.797 },
            { rotate: `${needleRotation.value}deg` },
            { translateX: -25.797 },
            { translateY: -25.797 },
        ],
    }));

    return (
        <View style={styles.container}>
            <View style={styles.svgWrapper}>
                <Svg viewBox="0 0 52.917 52.917" style={styles.svg}>
                    <Defs>
                        <RadialGradient
                            id="accel-radialGradient211"
                            cx="52.917"
                            cy="52.917"
                            r="52.917"
                            gradientTransform="matrix(.5125 0 0 .5125 -1.3229 -1.3229)"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop stopOpacity="0" offset="0.7483" />
                            <Stop offset="1" stopColor="#000" />
                        </RadialGradient>

                        <ClipPath id="accel-clipPath24">
                            <Circle cx="25.797" cy="25.797" r="26.458" fill="none" stroke="#000" strokeWidth="1.3229" />
                        </ClipPath>
                    </Defs>

                    <G transform="matrix(.97561 0 0 .97561 1.2906 1.2907)">
                        <Circle cx="25.797" cy="25.797" r="26.458" opacity="0.1" stroke="#000" strokeWidth="1.3229" />
                        <G clipPath="url(#accel-clipPath24)" fill="#b4b4b4" stroke="#000" strokeLinecap="round">
                            <Ellipse cx="18.28" cy="39.395" rx="16.272" ry="15.636" strokeWidth="1.0848" />
                            <Circle cx="41.739" cy="35.8" r="6.2184" strokeWidth="1.1231" />
                            <Circle cx="35.772" cy="22.783" r="6.7159" strokeWidth="1.2129" />
                            <Circle cx="22.619" cy="16.003" r="6.7159" strokeWidth="1.2129" />
                            <Circle cx="8.6527" cy="18.172" r="6.2184" strokeWidth="1.1231" />
                        </G>

                        <Path
                            transform="rotate(178)"
                            d="m-21.945-50.19a26.458 26.458 0 0 1 12.884 5.9276"
                            fill="none"
                            stroke="#f63434"
                            strokeWidth="4.068"
                        />
                        <Path
                            d="m28.733 2.2726a26.458 26.458 0 0 1 12.884 5.9276"
                            fill="none"
                            stroke="#f63434"
                            strokeWidth="4.068"
                        />

                        <Circle cx="25.797" cy="25.797" r="27.12" fill="url(#accel-radialGradient211)" />
                        <Circle transform="rotate(255.38)" cx="-31.474" cy="18.449" r="0.13229" fill="#e31ce0" />

                        {/* ---> INÍCIO DA MÁSCARA ESCURA <--- */}
                        <Path
                            d="M 24 32 Q 36 35 50 15 A 26.458 26.458 0 0 1 24 55 Z"
                            fill="#000"
                            fillOpacity="0.75"
                            strokeWidth="0"
                        />
                        {/* ---> FIM DA MÁSCARA ESCURA <--- */}


                        <G fill="#fff" strokeWidth="0">
                            <Path transform="matrix(-.5275 -.091294 .091294 -.5275 43.603 76.128)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(-.41118 -.34281 .34281 -.41118 16.054 78.288)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(-.18469 -.50248 .50248 -.18469 -8.8837 66.384)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.091294 -.5275 .5275 .091294 -24.529 43.606)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.34281 -.41118 .41118 .34281 -26.689 16.057)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.50248 -.18469 .18469 .50248 -14.785 -8.8809)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.5275 .091294 -.091294 .5275 7.9933 -24.526)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.41118 .34281 -.34281 .41118 35.542 -26.686)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                        </G>

                        {/* Agulha Rotativa Animada */}
                        <AnimatedG animatedProps={animatedNeedleProps}>
                            <Path
                                d="m23.797 4.3315-1.9999 2.9999 1.9999 3.0001 2.0001 4 2.0001-4 1.9999-3.0001-1.9999-2.9999zm0.60007 0.84667 2.8-1e-6 1e-6 4.2001-2.8 1e-6z"
                                fill="#ffffff"
                                strokeWidth="0"
                            />
                        </AnimatedG>
                    </G>
                </Svg>

                {/* Display da Temperatura */}
                <View style={styles.tempPanel}>
                    <Text style={styles.tempValue}>{Math.round(temperature)}</Text>
                    <Text style={styles.tempUnit}>°C</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    svgWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    svg: {
        width: '100%',
        height: '100%',
    },
    tempPanel: {
        position: 'absolute',
        top: '55%',
        right: '12%',
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    tempValue: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    tempUnit: {
        color: '#aaa',
        fontSize: 20,
        marginLeft: 2,
    },
});