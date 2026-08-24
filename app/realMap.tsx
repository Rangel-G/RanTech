import { RealTimeMap } from '@/components/realTimeMaps';
import { GroupMember, GroupService } from '@/services/group-service';
import { useReception } from '@/services/reception';
import { SettingsStorage } from '@/services/storage/settings-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function RealMapScreen() {
    const { data } = useReception();
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [members, setMembers] = useState<GroupMember[]>([]);
    const [groupKey, setGroupKey] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [pointerColor, setPointerColor] = useState<string>('#00ffff');

    // 1. Carrega dados de configuração (Grupo Ativo, ID do Usuário e Cor)
    useEffect(() => {
        async function loadContext() {
            // Exemplo de busca dos dados de configuração persistidos
            const obdSettings = await SettingsStorage.getObdSettings();
            
            // Defina ou recupere a chave do grupo e o ID do usuário local
            // (Ajuste conforme onde armazena o grupo ativo)
            setGroupKey("nome_do_grupo_ativo"); 
            setUserId("user_id_unico_dispositivo"); 
            setPointerColor("#00ffff");
        }
        loadContext();
    }, []);

    // 2. Escuta os membros do grupo em tempo real
    useEffect(() => {
        if (!groupKey) return;

        // Nome de método corrigido para subscribeToMembers e repasse do groupKey
        const unsubscribe = GroupService.subscribeToMembers(groupKey, (updatedMembers) => {
            // Filtra o próprio usuário da lista de membros do grupo
            const otherMembers = updatedMembers.filter((m) => m.userId !== userId);
            setMembers(otherMembers);
        });

        return () => unsubscribe();
    }, [groupKey, userId]);

    // 3. Rastreamento e transmissão da localização local
    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        async function startTracking() {
            if (!groupKey || !userId) return;

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
                        heading: data.heading ?? 0,
                    };

                    setUserLocation(coords);

                    // Nome de método corrigido para updateLocation + passagem de payload completo
                    GroupService.updateLocation(groupKey, userId, {
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        heading: coords.heading,
                        pointerColor: pointerColor,
                        name: "Piloto 1", // Pode vir do storage/configuração
                    });
                }
            );
        }

        startTracking();

        return () => {
            if (subscription) subscription.remove();
        };
    }, [groupKey, userId, pointerColor, data.heading]);

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
            members={members}
        />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#020810',
    },
});