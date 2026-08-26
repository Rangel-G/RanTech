import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface IndicatorLightProps {
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
    isActive: boolean;
    color?: string;
    size?: number;
}

export function IndicatorLight({
    iconName,
    isActive,
    color = '#ff3333',
    size = 28
}: IndicatorLightProps) {

    // Animação suave entre aceso e apagado
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isActive ? 1 : 0.15, { duration: 300 }),
            transform: [{ scale: withTiming(isActive ? 1.1 : 1, { duration: 200 }) }]
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[animatedStyle, {
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isActive ? 0.8 : 0,
                shadowRadius: 10,
                elevation: isActive ? 10 : 0, // Para Android
            }]}>
                <MaterialCommunityIcons
                    name={iconName}
                    size={size}
                    color={isActive ? color : '#333'}
                    style={{
                        textShadowColor: color,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: isActive ? 10 : 0,
                    }}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }
});