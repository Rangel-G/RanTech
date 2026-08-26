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
    FeGaussianBlur,
    Filter,
    G,
    Path,
    RadialGradient,
    Stop,
    Text as SvgText
} from 'react-native-svg';

// Componentes animados para o Reanimated
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path); // <--- Adicionado para a barra de N2O

interface RpmGaugeCardProps {
    speed: number;
    rpm: number;
    maxRpm?: number;
    gear?: string;
    showShiftLight?: boolean;
    n2oLevel?: number; // <--- Nova Prop
    maxN2o?: number;   // <--- Nova Prop
}

export function RpmGaugeCard({
    speed = 0,
    rpm = 0,
    maxRpm = 8000,
    gear = 'N',
    showShiftLight = false,
    n2oLevel = 0,      // <--- Valor default (0 a maxN2o)
    maxN2o = 100,      // <--- Máximo da barra
}: RpmGaugeCardProps) {
    // --- LÓGICA DO RPM (Agulha) ---
    const minAngle = -170;
    const maxAngle = 50;
    const percentage = Math.min(Math.max(rpm / maxRpm, 0), 1);
    const targetAngle = minAngle + percentage * (maxAngle - minAngle);

    const needleRotation = useSharedValue(minAngle);

    useEffect(() => {
        needleRotation.value = withSpring(targetAngle, {
            mass: 0.8,
            damping: 12,
            stiffness: 100,
        });
    }, [targetAngle, needleRotation]);

    const animatedNeedleProps = useAnimatedProps(() => ({
        transform: [
            { translateX: 52.917 },
            { translateY: 52.917 },
            { rotate: `${needleRotation.value}deg` },
            { translateX: -52.917 },
            { translateY: -52.917 },
        ],
    }));

    // --- LÓGICA DO N2O (Preenchimento da Barra) ---
    const PATH_LENGTH = 142; // Comprimento exato do arco SVG do N2O
    const n2oPercentage = Math.min(Math.max(n2oLevel / maxN2o, 0), 1);
    const n2oProgress = useSharedValue(0);

    useEffect(() => {
        n2oProgress.value = withSpring(n2oPercentage, {
            damping: 15,
            stiffness: 90,
        });
    }, [n2oPercentage, n2oProgress]);

    const animatedN2oProps = useAnimatedProps(() => ({
        // Quando progress = 0, offset = 142 (Vazio). Quando progress = 1, offset = 0 (Cheio).
        strokeDashoffset: PATH_LENGTH - (PATH_LENGTH * n2oProgress.value),
    }));

    return (
        <View style={styles.container}>
            <View style={styles.svgWrapper}>
                <Svg viewBox="-10 -10 125.83 125.83" style={styles.svg}>
                    <Defs>
                        {/* Filtros e Gradient mantidos */}
                        <Filter id="filter229" x="-0.23601" y="-0.2058" width="1.472" height="1.4116">
                            <FeGaussianBlur stdDeviation="0.54728426" />
                        </Filter>
                        <Filter id="filter230" x="-0.23601" y="-0.2058" width="1.472" height="1.4116">
                            <FeGaussianBlur stdDeviation="0.54728426" />
                        </Filter>
                        <RadialGradient id="radialGradient211" cx="52.917" cy="52.917" r="52.917" gradientUnits="userSpaceOnUse">
                            <Stop stopOpacity="0" offset="0.80744" />
                            <Stop offset="0.99344" stopColor="#000" />
                        </RadialGradient>
                        <ClipPath id="clipPath247">
                            <Circle cx="52.917" cy="52.917" r="52.917" fill="#edf672" stroke="#edf672" strokeWidth="2.6458" />
                        </ClipPath>
                    </Defs>

                    <G transform="matrix(.97561 0 0 .97561 1.2906 1.2907)">

                        {/* ---> INÍCIO DA BORDA N2O ANIMADA <--- */}
                        <G id="n2o-bar">
                            {/* 1. Borda externa escura (Fundo da barra) */}
                            <Path d="M -2.15 62.72 A 56 56 0 0 1 92.6 13.4" fill="none" stroke="#121212" strokeWidth="16" />

                            {/* 2. Preenchimento azul NOS (Barra Animada) */}
                            <AnimatedPath
                                d="M -2.15 62.72 A 56 56 0 0 1 92.6 13.4"
                                fill="none"
                                stroke="#2a9df4"
                                strokeWidth="10"
                                strokeDasharray={`${PATH_LENGTH} ${PATH_LENGTH}`}
                                animatedProps={animatedN2oProps}
                            />

                            {/* 3. Ticks (marcações pretas vazadas por cima da barra azul) */}
                            <Path d="M -2.15 62.72 A 56 56 0 0 1 92.6 13.4" fill="none" stroke="#121212" strokeWidth="11" strokeDasharray="4, 18" />

                            {/* 4. Texto N2O */}
                            <SvgText x="94" y="14" fill="#2a9df4" fontSize="13" fontWeight="900" transform="rotate(35, 87, 14)">
                                N2O
                            </SvgText>
                        </G>
                        {/* ---> FIM DA BORDA N2O <--- */}

                        {/* 1. CAMADA DE FUNDO (Gato e Olhos) */}
                        <G clipPath="url(#clipPath247)">
                            {/* ORELHA */}
                            <G stroke="#000">
                                <Path d="m70.529 27.135c10.073-8.4644 29.044-1.7842 29.044-1.7842s-4.7122 13.33-18.146 22.637" fill="#b4b4b4" strokeWidth="2.092" />
                                <Path d="m73.623 28.854c7.5596-6.0523 21.796-1.2757 21.796-1.2757s-3.5363 9.5316-13.618 16.186" fill="#fff" strokeWidth=".96185" />
                            </G>
                            {/* ROSTO */}
                            <Ellipse transform="matrix(.99885 .047893 -.21438 -.97675 0 0)" cx="16.851" cy="-46.945" rx="55.886" ry="47.882" fill="#b4b4b4" stroke="#000" strokeWidth="2.1543" />

                            {/* BIGODES */}
                            <G fill="none" stroke="#000" strokeLinecap="round">
                                <Path transform="matrix(.9168 .39934 -.43679 .89956 0 0)" d="m90.582 47.374a20.708 20.408 0 0 1 16.601 10.474" strokeWidth="2.1176" />
                                <Path transform="matrix(.98632 .16487 -.17375 .98479 0 0)" d="m80.75 60.324a18.956 20.456 0 0 1 15.197 10.499" strokeWidth="2.1167" />
                                <Path transform="matrix(.99772 -.06752 .016586 .99986 0 0)" d="m71.995 71.03a18.534 20.59 0 0 1 14.859 10.568" strokeWidth="2.118" />
                            </G>

                            {/* OLHO DIREITA PRETO */}
                            <Ellipse transform="matrix(.94132 .33753 -.3469 .9379 0 0)" cx="69.147" cy="32.723" rx="6.653" ry="7.6297" />

                            {/* OLHO DIREITA BRANCO */}
                            <Ellipse transform="matrix(.94132 .33753 -.3469 .9379 0 0)" cx="67.317" cy="30.79" rx="2.7826" ry="3.1911" fill="#fff" />
                            <Path d="m57.229 30.413a16.412 15.657 0 0 1 13.157 8.0359" fill="none" stroke="#000" strokeLinecap="round" strokeWidth="1.7211" />
                            <Ellipse transform="matrix(.61554 .78811 -.74507 .66699 0 0)" cx="35.311" cy="14.5" rx="5.9922" ry="7.5313" />
                            <Ellipse transform="matrix(.94132 .33753 -.3469 .9379 0 0)" cx="25.563" cy="29.655" rx="2.7826" ry="3.1911" fill="#fff" />
                            <Path transform="rotate(-5.0211)" d="m9.6503 12.624a16.412 15.657 0 0 1 13.157 8.0359" fill="none" stroke="#000" strokeLinecap="round" strokeWidth="1.7211" />
                            <Path d="m19.007 66.135-4.763-0.12126c-1.0491 2.4535-0.50191 5.2167 1.428 7.2105 1.93 1.9938 4.9366 2.9021 7.8458 2.3702 2.9093-0.53177 5.2599-2.4194 6.134-4.9258-0.47062-0.58118-4.3966-2.9058-5.4108-6.8038-0.04773-0.18343-1.2239 0.51639-2.4544 1.3282-1.1972 0.78992-2.7797 0.9419-2.7797 0.9419z" fill="#fff" stroke="#000" strokeLinecap="round" strokeWidth="2.2944" />
                            <Path d="m23.084 65.294-1.4742 4.1702 2.5938-3.9357 1.7982 0.35584-1.8662-2.4554-3.3701 2.0239z" />
                            <G stroke="#000">
                                <Path d="m39.655 67.1a8 9.1901 0 0 1-10.617 2.8831 8 9.1901 0 0 1-3.2477-11.965" fill="none" strokeLinecap="round" strokeWidth="2.1167" />
                                <Path d="m25.466 58.541a7.5625 9.1901 0 0 1-8.478 7.4053 7.5625 9.1901 0 0 1-6.4852-9.9436" fill="none" strokeLinecap="round" strokeWidth="2.1167" />
                                <Path d="m20.939 53.95s4.3823 0.26736 6.9796 1.5563c2.2823 1.1326 5.4705 3.537 5.4705 3.537l-8.1114 1.3205z" strokeWidth="2.6458" />
                            </G>
                        </G>

                        {/* 2. GRADIENTE CIRCULAR */}
                        <Circle cx="52.917" cy="52.917" r="52.917" fill="url(#radialGradient211)" />

                        {/* 3. MÁSCARA ESCURA DIREITA */}
                        <Path
                            d="m83.729 31.587s-8.9603 14.846-15.269 19.865c-2.1952 1.7466-15.544 1.8297-15.544 1.8297v41.188h35.055c11.358-10.437 17.862-25.434 17.862-41.188-7e-5 -8.2433-0.87365-14.382-4.3095-21.812z"
                            fillOpacity=".75"
                        />

                        {/* 4. ELEMENTOS DO GAUGE (Arco e Marcadores) */}
                        <Path
                            transform="matrix(1 -.0016963 0 1 0 0)"
                            d="m52.917 103.34a50.336 50.335 0 0 1-43.592-25.168 50.336 50.335 0 0 1-2e-7 -50.335 50.336 50.335 0 0 1 43.592-25.168"
                            fillOpacity="0"
                            stroke="#fff"
                            strokeWidth="2.6458"
                        />
                        <Path
                            d="m66.843 4.9201a49.976 49.976 0 0 1 27.455 19.976"
                            fillOpacity="0"
                            stroke="#f90000"
                            strokeWidth="3.2353"
                        />

                        <G transform="rotate(196.36 52.917 52.917)" fill="#fff" strokeWidth="0">
                            <Path transform="matrix(-.46581 -.26384 .26384 -.46581 38.95 125.28)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.50444 -.17924 .17924 .50444 7.3774 -5.0267)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.52127 .12193 -.12193 .52127 45.933 -20.449)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.3726 .38439 -.38439 .3726 86.706 -12.578)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(.10563 .52482 -.52482 .10563 116.75 16.086)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(-.19487 .49861 -.49861 -.19487 126.53 56.444)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(-.4335 .31411 -.31411 -.4335 112.94 95.682)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                            <Path transform="matrix(-.53451 .029878 -.029878 -.53451 80.289 121.34)" d="m48.937 46.794-3.6952-6.439 7.424 0.01933z" />
                        </G>

                        {/* 5. AGULHA ANIMADA (Otimizada e Fluida) */}
                        <AnimatedG animatedProps={animatedNeedleProps}>
                            <Path
                                d="m50.917 8.2021-1.9999 2.9999 1.9999 3.0001 2.0001 4 2.0001-4 1.9999-3.0001-1.9999-2.9999zm0.60007 0.84667 2.8-1e-6 1e-6 4.2001-2.8 1e-6z"
                                fill="#fff"
                                strokeWidth="0"
                            />
                        </AnimatedG>

                        {/* 6. CÍRCULO FINAL (Contorno preto) */}
                        <Circle cx="52.917" cy="52.917" r="52.917" fill="none" stroke="#000" strokeWidth="2.6458" />
                    </G>
                </Svg>

                {/* Display Digital Sobreposto */}
                <View style={styles.digitalPanel}>
                    <View style={styles.gearRow}>
                        {showShiftLight && <View style={styles.shiftLightTriangle} />}
                        <Text style={styles.gearText}>{gear}</Text>
                    </View>
                    <Text style={styles.rpmValueText} adjustsFontSizeToFit numberOfLines={1}>
                        {Math.round(speed)}
                    </Text>
                    <Text style={styles.rpmLabelText}>KM/H</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 260,
        height: 260,
        justifyContent: 'center',
        alignItems: 'center',
    },
    svgWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
    },
    svg: {
        width: '100%',
        height: '100%',
        overflow: 'visible',
    },
    digitalPanel: {
        position: 'absolute',
        top: '45%',
        left: 0,
        right: '15%',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    gearRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    shiftLightTriangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#f90000',
    },
    gearText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
    },
    rpmValueText: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '900',
        lineHeight: 52,
    },
    rpmLabelText: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
});