// components/RouteDecisionModal.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RouteDecisionModalProps {
    visible: boolean;
    hasExistingRoute: boolean;
    destinationName?: string;
    onReplace: () => void;
    onNextStop: () => void;
    onCancel: () => void;
}

export function RouteDecisionModal({
    visible,
    hasExistingRoute,
    destinationName,
    onReplace,
    onNextStop,
    onCancel,
}: RouteDecisionModalProps) {
    if (!hasExistingRoute) {
        // Se não há rota ativa, não precisa de modal de conflito, a rota pode ser criada direto.
        return null;
    }

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="map-marker-path" size={28} color="#00ffff" />
                        <Text style={styles.title}>Destino Selecionado</Text>
                    </View>

                    {destinationName ? (
                        <Text style={styles.subtitle} numberOfLines={2}>
                            Destino: <Text style={styles.highlight}>{destinationName}</Text>
                        </Text>
                    ) : null}

                    <Text style={styles.description}>
                        Já existe uma rota ativa no grupo. Como você deseja proceder com este novo destino?
                    </Text>

                    <View style={styles.buttonContainer}>
                        {/* Opção 1: Próxima Parada */}
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onNextStop}>
                            <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#000" />
                            <Text style={styles.primaryButtonText}>Adicionar como Próxima Parada</Text>
                        </TouchableOpacity>

                        {/* Opção 2: Substituir */}
                        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onReplace}>
                            <MaterialCommunityIcons name="swap-horizontal" size={20} color="#00ffff" />
                            <Text style={styles.secondaryButtonText}>Substituir Rota Atual</Text>
                        </TouchableOpacity>

                        {/* Opção 3: Cancelar */}
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#020810',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.3)',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 13,
        color: '#aaa',
        marginBottom: 8,
    },
    highlight: {
        color: '#fff',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 20,
        lineHeight: 20,
    },
    buttonContainer: {
        gap: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#00ffff',
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    secondaryButton: {
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: '#00ffff',
    },
    secondaryButtonText: {
        color: '#00ffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 4,
    },
    cancelButtonText: {
        color: '#888',
        fontWeight: '600',
        fontSize: 14,
    },
});