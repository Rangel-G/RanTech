import { RealTimeMap } from '@/components/realTimeMaps'; // Ajuste o path
import { useGroup } from '@/contexts/group-context';
import { useReception } from '@/hooks/useReception';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function MiniMapWidget() {
    const { data } = useReception();
    const { pointerColor } = useGroup();
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        async function startTracking() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

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
        return () => { if (subscription) subscription.remove(); };
    }, []);

    if (!userLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00ffff" />
            </View>
        );
    }

    return (
        <View style={styles.mapContainer}>
            <RealTimeMap
                latitude={userLocation.latitude}
                longitude={userLocation.longitude}
                heading={data.heading ?? 0}
                userColor={pointerColor}
                members={[]} // Vazio para focar só em você
                latitudeDelta={0.002} // Zoom bem próximo (rua)
                longitudeDelta={0.002}
            />
            {/* Overlay para não deixar o usuário arrastar o mini-mapa acidentalmente e dar um visual HUD */}
            <View style={styles.overlay} pointerEvents="none" />
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(0, 255, 255, 0.3)',
        backgroundColor: '#020810',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 8, 16, 0.6)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(0, 255, 255, 0.1)',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Escurece levemente
        borderTopWidth: 2,
        borderTopColor: 'rgba(255, 255, 255, 0.2)', // Reflexo de luz
    }
});