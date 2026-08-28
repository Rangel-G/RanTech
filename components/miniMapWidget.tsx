import { RealTimeMap } from '@/components/realTimeMaps';
import { useGroup } from '@/contexts/group-context';
import { useReception } from '@/hooks/useReception';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function MiniMapWidget() {
    const { data } = useReception();
    const { members, pointerColor, routes } = useGroup();
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const MAP_DELTA = 0.002;

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;
        let isMounted = true;

        async function startTracking() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const lastKnown = await Location.getLastKnownPositionAsync({});
            if (lastKnown && isMounted) {
                setUserLocation({
                    latitude: lastKnown.coords.latitude,
                    longitude: lastKnown.coords.longitude,
                });
            }

            const sub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 2000,
                    distanceInterval: 5,
                },
                (location) => {
                    if (isMounted) {
                        setUserLocation({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        });
                    }
                }
            );

            if (isMounted) {
                subscription = sub;
            } else {
                sub.remove();
            }
        }

        startTracking();
        return () => {
            isMounted = false;
            if (subscription) subscription.remove();
        };
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
                members={members}
                routes={routes}
                latitudeDelta={MAP_DELTA}
                longitudeDelta={MAP_DELTA}
            />
            <View style={styles.overlay} pointerEvents="none" />
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 110,
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
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderTopWidth: 2,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    }
});