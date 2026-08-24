// Exemplo estrutural para React Native Maps / Mapbox
import { GroupMember } from '@/services/group-service';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface RealTimeMapProps {
    latitude: number;
    longitude: number;
    heading: number;
    members?: GroupMember[];
}

export function RealTimeMap({ latitude, longitude, heading, members = [] }: RealTimeMapProps) {
    return (
        <MapView
            style={styles.map}
            initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
        >
            {/* Marker do Usuário Atual */}
            <Marker
                coordinate={{ latitude, longitude }}
                flat
                rotation={heading}
                anchor={{ x: 0.5, y: 0.5 }}
                title="Você"
            />

            {/* Markers dos Outros Membros */}
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
                    {/* Renderização customizada (Ícone + Nome do Piloto) */}
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
    map: {
        flex: 1,
    },
    memberMarkerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerPointer: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#000',
        borderWidth: 3,
    },
    memberNameTag: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    memberNameText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});