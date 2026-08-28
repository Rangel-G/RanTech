// components/RouteSearchBar.tsx
import { RouteCoordinate } from '@/services/firebase/group-service';
import { GeocodingService } from '@/services/google/geodecodingService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface RouteSearchBarProps {
    onDestinationSelected: (location: RouteCoordinate, address: string) => void;
}

export function RouteSearchBar({ onDestinationSelected }: RouteSearchBarProps) {
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchText.trim()) return;
        try {
            setLoading(true);
            const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''; // Substitua pela sua chave ou variável de ambiente
            const result = await GeocodingService.getCoordinatesFromAddress(searchText, apiKey);

            onDestinationSelected(result.location, result.formattedAddress);
            setSearchText('');
        } catch (error: any) {
            console.error('Erro ao buscar endereço:', error);
            alert(error.message || 'Endereço não encontrado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name="magnify" size={20} color="#aaa" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder="Pesquisar destino (ex: Av. Paulista, 1000)..."
                placeholderTextColor="#666"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
            />
            {loading ? (
                <ActivityIndicator size="small" color="#00ffff" style={styles.loader} />
            ) : (
                <TouchableOpacity onPress={handleSearch} style={styles.button}>
                    <Text style={styles.buttonText}>IR</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        height: 48,
        backgroundColor: 'rgba(2, 8, 16, 0.9)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 10,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
    },
    loader: {
        marginLeft: 8,
    },
    button: {
        backgroundColor: '#00ffff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 8,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
});