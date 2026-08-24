import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface RealTimeMapProps {
    latitude: number;
    longitude: number;
    heading?: number;
}

export function RealTimeMap({ latitude, longitude, heading = 0 }: RealTimeMapProps) {
    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.005, // Zoom
                    longitudeDelta: 0.005,
                }}
            >
                <Marker
                    coordinate={{ latitude, longitude }}
                    rotation={heading}
                    flat={true}
                    anchor={{ x: 0.5, y: 0.5 }}
                    title="Veículo"
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 10,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});