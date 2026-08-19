import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
    label: string;
    value: string | number;
    percentage: number;
    baseColor?: string;
    isWarning?: boolean;
}

export function ProgressBar({
    label,
    value,
    percentage,
    baseColor = '#00ff66',
    isWarning = false
}: ProgressBarProps) {
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    const flashAnim = useRef(new Animated.Value(0)).current;

    // Usamos uma referência para guardar a duração atual para que 
    // ela não cause re-renderizações desnecessárias ao diminuir
    const durationRef = useRef(200);

    const COLOR_CRITICAL_RED = '#ff3333';
    const COLOR_CRITICAL_WHITE = '#ffffff';

    useEffect(() => {
        let isAnimating = true;

        const startBlinking = () => {
            // Se o aviso foi desligado no meio tempo, não iniciamos um novo ciclo
            if (!isAnimating) return;

            Animated.sequence([
                Animated.timing(flashAnim, {
                    toValue: 1,
                    duration: durationRef.current,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(flashAnim, {
                    toValue: 0,
                    duration: durationRef.current,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ]).start(({ finished }) => {
                // finished garante que a animação não foi interrompida
                if (finished && isAnimating) {
                    // Reduz a duração em 10% (multiplica por 0.9)
                    // Colocamos um limite mínimo de 50ms para não virar um borrão na tela
                    durationRef.current = Math.max(50, durationRef.current * 0.9);

                    // Chama a animação novamente com o novo tempo (Recursividade)
                    startBlinking();
                }
            });
        };

        if (isWarning) {
            isAnimating = true;
            durationRef.current = 300; // Reseta para 300ms sempre que o aviso começa
            startBlinking();
        } else {
            // Quando sai da zona de perigo, paramos tudo e resetamos
            isAnimating = false;
            flashAnim.stopAnimation(); // Para qualquer animação rodando
            flashAnim.setValue(0); // Força a voltar pra cor sólida
            durationRef.current = 300; // Prepara para a próxima vez
        }

        // Cleanup quando o componente for desmontado
        return () => {
            isAnimating = false;
            flashAnim.stopAnimation();
        };
    }, [isWarning, flashAnim]);

    const flashingColor = flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLOR_CRITICAL_RED, COLOR_CRITICAL_WHITE],
    });

    const finalColor = isWarning ? flashingColor : baseColor;

    return (
        <View style={styles.container}>
            <View style={styles.info}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>

            <Animated.View style={[styles.barBackground, { borderColor: finalColor }]}>
                <Animated.View
                    style={[
                        styles.barFill,
                        {
                            width: `${clampedPercentage}%`,
                            backgroundColor: finalColor,
                        },
                    ]}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    info: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        color: '#8be8ff',
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 13,
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    barBackground: {
        height: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 4,
        borderWidth: 1,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
        shadowColor: '#ffffff',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
});