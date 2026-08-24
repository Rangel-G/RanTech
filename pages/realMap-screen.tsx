import { RealTimeMap } from '@/components/realTimeMaps';
import { useReception } from '@/services/reception';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function DashboardPage() {
    const { data } = useReception();

    return (
        <View style={styles.page}>
            {/* Exemplo de exibição na página */}
            <RealTimeMap
                latitude={data.latitude || -23.55052}
                longitude={data.longitude || -46.633308}
                heading={data.heading || 0}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        padding: 16,
    },
});