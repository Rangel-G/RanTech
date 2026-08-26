import { RealTimeMap } from '@/components/realTimeMaps';
import { useGroup } from '@/contexts/group-context';
import { useReception } from '@/hooks/useReception';
import { GroupMember, GroupService } from '@/services/firebase/group-service';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RealMapScreen() {
    const { data } = useReception();
    const { activeGroup, userId, userName, pointerColor } = useGroup();

    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [members, setMembers] = useState<GroupMember[]>([]);

    // 1. Escuta membros do grupo em tempo real
    useEffect(() => {
        if (!activeGroup || !userId) {
            setMembers([]);
            return;
        }

        const unsubscribe = GroupService.subscribeToMembers(activeGroup, (updatedMembers) => {
            const otherMembers = updatedMembers.filter((m) => m.userId !== userId);
            setMembers(otherMembers);
        });

        return () => unsubscribe();
    }, [activeGroup, userId]);

    // 2. Rastreia e transmite a posição no grupo
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
                    const coords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };

                    setUserLocation(coords);

                    if (activeGroup && userId) {
                        GroupService.updateLocation(activeGroup, userId, {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            heading: data.heading ?? 0,
                            pointerColor,
                            name: userName,
                        });
                    }
                }
            );
        }

        startTracking();

        return () => {
            if (subscription) subscription.remove();
        };
    }, [activeGroup, userId, userName, pointerColor, data.heading]);

    if (!userLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#34b9f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Botão de Voltar Flutuante */}
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>← Voltar</Text>
            </Pressable>

            <RealTimeMap
                latitude={userLocation.latitude}
                longitude={userLocation.longitude}
                heading={data.heading ?? 0}
                userColor={pointerColor} // Repassa a cor configurada para o seu ponteiro
                members={members}
            />




        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020810',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#020810',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 16,
        zIndex: 10,
        backgroundColor: 'rgba(2, 8, 16, 0.85)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.3)',
    },
    backButtonText: {
        color: '#8be8ff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    rpmGauge: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 20,
    },
});