import { RealTimeMap } from '@/components/realTimeMaps';
import { useGroup } from '@/contexts/group-context';
import { useReception } from '@/hooks/useReception';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Função auxiliar para calcular distância e ângulo plano (Aproximação Euclidiana para pequenas distâncias)
const calculateOutOFRange = (userLat: number, userLng: number, targetLat: number, targetLng: number, visibleDelta: number) => {
    const dy = targetLat - userLat;
    const dx = (targetLng - userLng) * Math.cos(userLat * (Math.PI / 180));
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Se estiver dentro da área visível (aprox metade do delta), não precisa de ponteiro na borda
    if (distance < visibleDelta / 2) return null;

    // O eixo Y geográfico cresce para o norte (cima), mas na tela o Y cresce para baixo. Invertemos o dy.
    const angleRad = Math.atan2(-dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);

    return angleDeg;
};

export function MiniMapWidget() {
    const { data } = useReception();
    const { members, pointerColor } = useGroup();
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const MAP_DELTA = 0.002;

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;
        let isMounted = true; // Protege contra vazamento de memória

        async function startTracking() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            // 1. Tira o usuário do Loading instantaneamente com a última localização salva
            const lastKnown = await Location.getLastKnownPositionAsync({});
            if (lastKnown && isMounted) {
                setUserLocation({
                    latitude: lastKnown.coords.latitude,
                    longitude: lastKnown.coords.longitude,
                });
            }

            // 2. Inicia o rastreio contínuo
            const sub = await Location.watchPositionAsync(
                {
                    // Reduzir de BestForNavigation para Highest/High evita o travamento do módulo
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

            // 3. Garante que se o componente for desmontado, o listener seja destruído
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

    if (!userLocation) return <ActivityIndicator color="#00ffff" />;

    return (
        <View style={styles.mapContainer}>
            <RealTimeMap
                latitude={userLocation.latitude}
                longitude={userLocation.longitude}
                heading={data.heading ?? 0}
                userColor={pointerColor}
                members={members}
                latitudeDelta={MAP_DELTA}
                longitudeDelta={MAP_DELTA}
            />

            {/* Overlay Escuro Original */}
            <View style={styles.overlay} pointerEvents="none" />

            {/* Camada Matemática para os Ponteiros de Borda */}
            <View style={styles.edgeIndicatorsContainer} pointerEvents="none">
                {members.map(member => {
                    const angle = calculateOutOFRange(
                        userLocation.latitude,
                        userLocation.longitude,
                        member.latitude,
                        member.longitude,
                        MAP_DELTA
                    );

                    if (angle === null) return null; // Membro está dentro do mapa, o Marker nativo já resolve

                    return (
                        <View
                            key={`edge-${member.userId}`}
                            style={[
                                styles.edgePointerAnchor,
                                { transform: [{ rotate: `${angle}deg` }, { translateX: 100 }] } // 100 é o raio (110) menos uma margem de segurança
                            ]}
                        >
                            {/* Rotaciona o ícone de volta para não ficar de cabeça para baixo dependendo da borda */}
                            <MaterialCommunityIcons
                                name="navigation"
                                size={24}
                                color={member.pointerColor || "#ffcc00"}
                                style={{ transform: [{ rotate: '90deg' }] }}
                            />
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 110, // Para garantir que seja um círculo perfeito baseado no 220x220 do wrapper original
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(0, 255, 255, 0.3)',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    edgeIndicatorsContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    edgePointerAnchor: {
        position: 'absolute',
        // O container ancora no centro exato. O translateX no estilo inline empurra ele para a borda.
        alignItems: 'center',
        justifyContent: 'center',
    }
});