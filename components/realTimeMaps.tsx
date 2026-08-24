import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface RealTimeMapProps {
    latitude: number;
    longitude: number;
    heading?: number;
}

export const RealTimeMap: React.FC<RealTimeMapProps> = ({
    latitude,
    longitude,
    heading = 0,
}) => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
            >
                <Marker
                    coordinate={{ latitude, longitude }}
                    rotation={heading}
                    flat={true}
                    anchor={{ x: 0.5, y: 0.5 }}
                    title="Veículo"
                    pinColor="#34b9f6"
                />
            </MapView>

            {/* Botão de Voltar Flutuante */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/(tabs)');
                    }
                }}
                activeOpacity={0.8}
            >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});