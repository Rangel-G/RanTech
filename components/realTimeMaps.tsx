import { GroupMember, RouteCoordinate } from '@/services/firebase/group-service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface RealTimeMapProps {
    latitude: number;
    longitude: number;
    heading: number;
    userColor?: string;
    members?: GroupMember[];
    latitudeDelta?: number;
    longitudeDelta?: number;
    temporaryDestination?: RouteCoordinate | null;
    onLongPressMap?: (coordinate: RouteCoordinate) => void;
}

export function RealTimeMap({
    latitude,
    longitude,
    heading,
    userColor = '#00ffff',
    members = [],
    latitudeDelta = 0.01,
    longitudeDelta = 0.01,
    temporaryDestination,
    onLongPressMap,
}: RealTimeMapProps) {
    const mapRef = useRef<MapView>(null);

    // Refs de Controle Absoluto
    const timeoutRef = useRef<NodeJS.Timeout | number | null>(null);
    const isFollowing = useRef(true); // Diz se o mapa deve seguir o usuário
    const isProgrammaticMove = useRef(false); // Diz se quem está mexendo no mapa é o código (GPS) ou o dedo do usuário

    // Refs de Estado Físico
    const latestCoords = useRef({ latitude, longitude });
    const currentZoom = useRef({ latitudeDelta, longitudeDelta });

    // 1. Ouve as atualizações do GPS em segundo plano
    useEffect(() => {
        latestCoords.current = { latitude, longitude };

        // Só puxa o mapa se estivermos na flag "seguindo". Se você tocou na tela, ele ignora.
        if (isFollowing.current && mapRef.current) {
            isProgrammaticMove.current = true; // Avisa que foi o código que moveu a câmera
            mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: currentZoom.current.latitudeDelta,
                longitudeDelta: currentZoom.current.longitudeDelta,
            }, 500);
        }
    }, [latitude, longitude]);

    // Defesa Camada 1: Quebra o rastreio no exato instante que o dedo encosta ou arrasta
    const handleUserTouch = () => {
        isFollowing.current = false;
        isProgrammaticMove.current = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    return (
        <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
                latitude,
                longitude,
                latitudeDelta,
                longitudeDelta,
            }}
            onTouchStart={handleUserTouch}
            onPanDrag={handleUserTouch}

            // Defesa Camada 2: Proteção extra para o Zoom (Pinça)
            onRegionChange={(region, details) => {
                // Se a câmera se mexeu e NÃO foi o nosso GPS que mandou, o usuário interagiu.
                if (!isProgrammaticMove.current || details?.isGesture) {
                    isFollowing.current = false;
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }
            }}

            // Defesa Camada 3: Só aciona os 3 segundos quando a tela PARAR de se mexer completamente
            onRegionChangeComplete={(region, details) => {
                // Guarda o zoom que o usuário escolheu para não dar "zoom in" indesejado ao voltar
                currentZoom.current = {
                    latitudeDelta: region.latitudeDelta,
                    longitudeDelta: region.longitudeDelta,
                };

                if (isProgrammaticMove.current && !details?.isGesture) {
                    // A câmera parou porque a animação do nosso GPS terminou. Apenas desliga a flag.
                    isProgrammaticMove.current = false;
                } else {
                    // A câmera parou porque VOCÊ soltou o dedo da tela. Aqui iniciamos os 3 segundos.
                    isFollowing.current = false;
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);

                    timeoutRef.current = setTimeout(() => {
                        isFollowing.current = true;
                        isProgrammaticMove.current = true; // Avisa que será um movimento de código

                        // Faz a viagem de volta para o usuário
                        mapRef.current?.animateToRegion({
                            latitude: latestCoords.current.latitude,
                            longitude: latestCoords.current.longitude,
                            latitudeDelta: currentZoom.current.latitudeDelta,
                            longitudeDelta: currentZoom.current.longitudeDelta,
                        }, 1000); // 1 segundo de transição suave de volta
                    }, 3000);
                }
            }}

            onLongPress={(e) => {
                if (onLongPressMap) {
                    onLongPressMap(e.nativeEvent.coordinate);
                }
            }}
        >

            {/* Marcador Provisório de Destino Selecionado */}
            {temporaryDestination && (
                <Marker coordinate={temporaryDestination}>
                    <View style={styles.destMarkerContainer}>
                        <MaterialCommunityIcons name="flag-checkered" size={24} color="#ffcc00" />
                    </View>
                </Marker>
            )}

            <Marker
                coordinate={{ latitude, longitude }}
                flat
                rotation={heading}
                anchor={{ x: 0.5, y: 0.5 }}
            >
                <View style={styles.memberMarkerContainer}>
                    <View style={[styles.markerPointer, { borderColor: userColor }]} />
                    <View style={styles.memberNameTag}>
                        <Text style={styles.memberNameText}>Você</Text>
                    </View>
                </View>
            </Marker>

            {members.map((member) => (
                <Marker
                    key={member.userId}
                    coordinate={{
                        latitude: member.latitude,
                        longitude: member.longitude,
                    }}
                    flat
                    rotation={member.heading ?? 0}
                    anchor={{ x: 0.5, y: 0.5 }}
                >
                    <View style={styles.memberMarkerContainer}>
                        <View style={[styles.markerPointer, { borderColor: member.pointerColor || '#00ffff' }]} />
                        <View style={styles.memberNameTag}>
                            <Text style={styles.memberNameText}>{member.name}</Text>
                        </View>
                    </View>
                </Marker>
            ))}
        </MapView>
    );
}

const styles = StyleSheet.create({
    map: { flex: 1 },
    memberMarkerContainer: { alignItems: 'center', justifyContent: 'center' },
    markerPointer: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#000', borderWidth: 3 },
    memberNameTag: { backgroundColor: 'rgba(0, 0, 0, 0.75)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    memberNameText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    destMarkerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: '#ffcc00'
    },
});