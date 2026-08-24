import { RealTimeMap } from '@/components/realTimeMaps';
import { useReception } from '@/services/reception';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function RealMapScreen() {
    const { data } = useReception();
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        async function startTracking() {
            // Solicita permissão de localização
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permissão de localização negada');
                return;
            }

            // Inicia o rastreamento em tempo real
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 5,
                },
                (location) => {
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            );
        }

        startTracking();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    if (!userLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#34b9f6" />
            </View>
        );
    }

    return (
        <RealTimeMap
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            heading={data.heading ?? 0}
        />
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});