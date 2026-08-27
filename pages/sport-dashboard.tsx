import { MiniMapWidget } from '@/components/miniMapWidget';
import { IndicatorLight } from '@/components/ui/indicatorLight';
import { RpmGaugeCard } from '@/components/ui/rpmGauge';
import { RpmTempGaugeCard } from '@/components/ui/tempGauge';
// Importe o componente que criamos anteriormente
import COLORS from '@/constants/global-styles';
import { useReception } from '@/hooks/useReception';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Componente auxiliar para preencher espaço com dados
function TelemetryBox({ label, value, unit }: { label: string, value: string | number, unit: string }) {
    return (
        <View style={styles.telemetryBox}>
            <Text style={styles.telemetryLabel}>{label}</Text>
            <View style={styles.telemetryValueContainer}>
                <Text style={styles.telemetryValue}>{value}</Text>
                <Text style={styles.telemetryUnit}>{unit}</Text>
            </View>
        </View>
    );
}

export function SportDashboard() {
    const { data } = useReception();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>



            {/* PAINEL CENTRAL ORIGINAL MANTIDO (Sobreposição) */}
            <View style={styles.dashboard}>
                {/* Velocímetro/RPM (Fundo) */}
                <View style={styles.rpmGaugeContainer}>
                    <RpmGaugeCard
                        speed={data.speed}
                        rpm={data.rpm}
                        maxRpm={data.rpmMax}
                        gear={data.gear || 'N'}
                        showShiftLight={data.rpm > 6500}
                        n2oLevel={data.n2o || 75}
                        maxN2o={data.n2oMax}
                    />
                </View>

                {/* Temperatura (Frente, canto inferior esquerdo) */}
                <View style={styles.tempGaugeContainer}>
                    <RpmTempGaugeCard
                        temperature={data.ect}
                        maxTemp={data.ectMax || 110}
                    />
                </View>

                <View style={styles.miniMapWrapper}>
                    <MiniMapWidget />
                </View>



                {/* NOVO: Barra de Luzes de Alerta (Flexbox Topo) */}
                <View style={styles.telltaleCluster}>
                    <IndicatorLight
                        iconName="car-battery"
                        isActive={true} // Ative se a voltagem cair
                        color="#ff3333"
                    />
                    <IndicatorLight
                        iconName="engine"
                        isActive={!data.speed && !data.rpm} // Exemplo: Acende se não houver dados vitais
                        color="#ffcc00"
                    />
                    <IndicatorLight
                        iconName="oil"
                        isActive={true}
                        color="#ff3333"
                    />
                    <IndicatorLight
                        iconName="car-connected"
                        isActive={true} // Acende quando OBD
                        color="#2a9df4"
                    />
                    <IndicatorLight
                        iconName="bluetooth-connect"
                        isActive={true} // Acende quando LED conectado
                        color="#2a9df4"
                    />
                </View>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.darkBase,
    },
    contentContainer: {
        padding: 16,
    },
    telltaleCluster: {
        position: 'absolute',     // Torna o painel flutuante, igual aos gauges
        right: '5%',              // Fixa no canto direito da tela de forma segura
        top: '15%',               // Alinha verticalmente com o painel central
        height: 280,              // CRÍTICO: Define o limite vertical. Quando os ícones baterem aqui, vão para a coluna 2
        flexDirection: 'column',  // Mantém a ordem de cima para baixo
        flexWrap: 'wrap',         // Habilita a criação de novas colunas automaticamente
        justifyContent: 'space-evenly',
        alignContent: 'center',   // Centraliza as múltiplas colunas geradas
        gap: 12,                  // Espaçamento entre as colunas e linhas
    },
    telemetryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
        gap: 10,
    },
    telemetryBox: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: 'rgba(10, 15, 20, 0.6)',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.overlay.cyan.veryLow,
        alignItems: 'center',
    },
    telemetryLabel: {
        fontSize: 10,
        color: COLORS.text.secondary,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1,
    },
    telemetryValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    telemetryValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
    },
    telemetryUnit: {
        fontSize: 12,
        color: '#aaa',
        marginLeft: 2,
    },
    // --- ESTILOS ORIGINAIS (MANTIDOS INTACTOS) ---
    dashboard: {
        width: '100%',
        height: '100%',
        alignSelf: 'center',
        marginVertical: 40,
    },
    rpmGaugeContainer: {
        position: 'absolute',
        right: '40%',
        top: '-60%',
        zIndex: 1,
    },
    tempGaugeContainer: {
        position: 'absolute',
        left: '8%',
        top: '120%',
        zIndex: 1,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.overlay.cyan.veryLow,
        marginTop: 20,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ledIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusLabel: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    miniMapWrapper: {
        position: 'absolute',
        left: '55%',  // Posiciona logo à direita do RPM
        top: '90%',   // Alinha verticalmente com o topo
        width: 220,   // Largura retangular do mapa
        height: 220,  // Altura do mapa
        zIndex: 0,    // Fica atrás dos relógios caso se sobreponham
        opacity: 0.9,
    },
});