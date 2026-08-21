import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
    Circle,
    ClipPath,
    Defs,
    Ellipse,
    FeColorMatrix,
    FeComposite,
    FeFlood,
    FeGaussianBlur,
    FeOffset,
    Filter,
    G,
    Path,
    RadialGradient,
    Stop,
} from 'react-native-svg';

interface SpeedGaugeProps {
    speed: number;
    maxSpeed?: number;
    gear?: string;
    showShiftLight?: boolean;
}

export function SpeedGaugeCard({
    speed = 0,
    maxSpeed = 240,
    gear = 'N',
    showShiftLight = false,
}: SpeedGaugeProps) {
    // Cálculo da rotação da agulha (-170 deg no zero até ~50 deg no máximo)
    const minAngle = -170;
    const maxAngle = 50;
    const percentage = Math.min(Math.max(speed / maxSpeed, 0), 1);
    const needleRotation = minAngle + percentage * (maxAngle - minAngle);

    return (
        <View style={styles.container}>
            <View style={styles.svgWrapper}>
                <Svg viewBox="0 0 105.83 105.83" style={styles.svg}>
                    <Defs>
                        <Filter id="filter208" x="-0.3" y="-0.24" width="1.6" height="1.48">
                            <FeFlood floodColor="rgb(0,0,0)" in="SourceGraphic" result="flood" />
                            <FeGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
                            <FeOffset dx="0" dy="0" in="blur" result="offset" />
                            <FeComposite in="flood" in2="offset" operator="in" result="comp1" />
                            <FeComposite in="SourceGraphic" in2="comp1" result="fbSourceGraphic" />
                            <FeColorMatrix
                                in="fbSourceGraphic"
                                result="fbSourceGraphicAlpha"
                                values="0 0 0 -1 0 0 0 0 -1 0 0 0 0 -1 0 0 0 0 1 0"
                            />
                            <FeFlood floodColor="rgb(0,0,0)" in="fbSourceGraphic" result="flood" />
                            <FeGaussianBlur in="fbSourceGraphic" stdDeviation="0.5" result="blur" />
                            <FeOffset dx="0" dy="0" in="blur" result="offset" />
                            <FeComposite in="flood" in2="offset" operator="in" result="comp1" />
                            <FeComposite in="fbSourceGraphic" in2="comp1" result="comp2" />
                        </Filter>

                        <RadialGradient
                            id="radialGradient211"
                            cx="52.917"
                            cy="52.917"
                            r="52.917"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop stopOpacity="0" offset="0.80744" />
                            <Stop offset="0.99344" stopColor="#000" />
                        </RadialGradient>

                        <Filter id="filter229" x="-0.23601" y="-0.2058" width="1.472" height="1.4116">
                            <FeGaussianBlur stdDeviation="0.54728426" />
                        </Filter>

                        <Filter id="filter230" x="-0.23601" y="-0.2058" width="1.472" height="1.4116">
                            <FeGaussianBlur stdDeviation="0.54728426" />
                        </Filter>

                        <ClipPath id="clipPath247">
                            <Circle cx="52.917" cy="52.917" r="52.917" fill="#edf672" stroke="#edf672" strokeWidth="2.6458" />
                        </ClipPath>
                    </Defs>

                    <G transform="matrix(.97561 0 0 .97561 1.2906 1.2907)">
                        <G clipPath="url(#clipPath247)">
                            <G stroke="#000">
                                <Path
                                    d="m70.529 27.135c10.073-8.4644 29.044-1.7842 29.044-1.7842s-4.7122 13.33-18.146 22.637"
                                    fill="#b4b4b4"
                                    strokeWidth="2.092"
                                />
                                <Path
                                    d="m73.623 28.854c7.5596-6.0523 21.796-1.2757 21.796-1.2757s-3.5363 9.5316-13.618 16.186"
                                    fill="#fff"
                                    strokeWidth=".96185"
                                />
                            </G>
                            <Ellipse
                                transform="matrix(.99885 .047893 -.21438 -.97675 0 0)"
                                cx="16.851"
                                cy="-46.945"
                                rx="55.886"
                                ry="47.882"
                                fill="#b4b4b4"
                                stroke="#000"
                                strokeWidth="2.1543"
                            />
                            <G fill="none" stroke="#000" strokeLinecap="round">
                                <Path
                                    transform="matrix(.9168 .39934 -.43679 .89956 0 0)"
                                    d="m90.582 47.374a20.708 20.408 0 0 1 16.601 10.474"
                                    strokeWidth="2.1176"
                                />
                                <Path
                                    transform="matrix(.98632 .16487 -.17375 .98479 0 0)"
                                    d="m80.75 60.324a18.956 20.456 0 0 1 15.197 10.499"
                                    strokeWidth="2.1167"
                                />
                                <Path
                                    transform="matrix(.99772 -.06752 .016586 .99986 0 0)"
                                    d="m71.995 71.03a18.534 20.59 0 0 1 14.859 10.568"
                                    strokeWidth="2.118"
                                />
                            </G>
                            <Ellipse
                                transform="matrix(.94132 .33753 -.3469 .9379 0 0)"
                                cx="69.147"
                                cy="32.723"
                                rx="6.653"
                                ry="7.6297"
                            />
                            <Ellipse
                                transform="matrix(.94132 .33753 -.3469 .9379 0 0)"
                                cx="67.317"
                                cy="30.79"
                                rx="2.7826"
                                ry="3.1911"
                                fill="#fff"
                                filter="url(#filter230)"
                            />
                            <Path
                                d="m57.229 30.413a16.412 15.657 0 0 1 13.157 8.0359"
                                fill="none"
                                stroke="#000"
                                strokeLinecap="round"
                                strokeWidth="1.7211"
                            />
                            <Ellipse
                                transform="matrix(.61554 .78811 -.74507 .66699 0 0)"
                                cx="35.311"
                                cy="14.5"
                                rx="5.9922"
                                ry="7.5313"
                            />
                            <Ellipse
                                transform="matrix(.94132 .33753 -.3469 .9379 0 0)"
                                cx="25.563"
                                cy="29.655"
                                rx="2.7826"
                                ry="3.1911"
                                fill="#fff"
                                filter="url(#filter229)"
                            />
                            <Path
                                transform="rotate(-5.0211)"
                                d="m9.6503 12.624a16.412 15.657 0 0 1 13.157 8.0359"
                                fill="none"
                                stroke="#000"
                                strokeLinecap="round"
                                strokeWidth="1.7211"
                            />
                            <Path
                                d="m19.007 66.135-4.763-0.12126c-1.0491 2.4535-0.50191 5.2167 1.428 7.2105 1.93 1.9938 4.9366 2.9021 7.8458 2.3702 2.9093-0.53177 5.2599-2.4194 6.134-4.9258-0.47062-0.58118-4.3966-2.9058-5.4108-6.8038-0.04773-0.18343-1.2239 0.51639-2.4544 1.3282-1.1972 0.78992-2.7797 0.9419-2.7797 0.9419z"
                                fill="#fff"
                                stroke="#000"
                                strokeLinecap="round"
                                strokeWidth="2.2944"
                            />
                            <Path d="m23.084 65.294-1.4742 4.1702 2.5938-3.9357 1.7982 0.35584-1.8662-2.4554-3.3701 2.0239z" />
                            <G stroke="#000">
                                <Path
                                    d="m39.655 67.1a8 9.1901 0 0 1-10.617 2.8831 8 9.1901 0 0 1-3.2477-11.965"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeWidth="2.1167"
                                />
                                <Path
                                    d="m25.466 58.541a7.5625 9.1901 0 0 1-8.478 7.4053 7.5625 9.1901 0 0 1-6.4852-9.9436"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeWidth="2.1167"
                                />
                                <Path
                                    d="m20.939 53.95s4.3823 0.26736 6.9796 1.5563c2.2823 1.1326 5.4705 3.537 5.4705 3.537l-8.1114 1.3205z"
                                    strokeWidth="2.6458"
                                />
                            </G>
                        </G>

                        <Circle cx="52.917" cy="52.917" r="52.917" fill="url(#radialGradient211)" />
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

                        {/* Marcadores em Arco */}
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

                        {/* Agulha Rotativa do Velocímetro */}
                        <G transform={`rotate(${needleRotation} 52.917 52.917)`}>
                            <Path
                                d="m50.917 8.2021-1.9999 2.9999 1.9999 3.0001 2.0001 4 2.0001-4 1.9999-3.0001-1.9999-2.9999zm0.60007 0.84667 2.8-1e-6 1e-6 4.2001-2.8 1e-6z"
                                fill="#fff"
                                filter="url(#filter208)"
                                strokeWidth="0"
                            />
                        </G>

                        <Path
                            d="m83.729 31.587s-8.9603 14.846-15.269 19.865c-2.1952 1.7466-15.544 1.8297-15.544 1.8297v41.188h35.055c11.358-10.437 17.862-25.434 17.862-41.188-7e-5 -8.2433-0.87365-14.382-4.3095-21.812z"
                            fillOpacity=".75"
                        />
                        <Circle cx="52.917" cy="52.917" r="52.917" fill="none" stroke="#000" strokeWidth="2.6458" />
                    </G>
                </Svg>

                {/* Display Digital Sobreposto */}
                <View style={styles.digitalPanel}>
                    <View style={styles.gearRow}>
                        {showShiftLight && <View style={styles.shiftLightTriangle} />}
                        <Text style={styles.gearText}>{gear}</Text>
                    </View>
                    <Text style={styles.speedText}>{Math.round(speed)}</Text>
                    <Text style={styles.kmhText}>KM/H</Text>
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
    },
    svg: {
        width: '100%',
        height: '100%',
    },
    digitalPanel: {
        position: 'absolute',
        top: '45%',
        left: 0,
        right: '15%',
        alignItems: 'flex-end',
        justifyContent: 'center'
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
    speedText: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '900',
        lineHeight: 52,
    },
    kmhText: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
});