import { ChannelBox } from '@/components/ui/channel-box';
import { RpmRamp } from '@/components/ui/rpmRamp';
import { useReception } from '@/services/reception';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function DailyDashboard() {


    const {data} = useReception()

    // Simulate data updates


    return (
        <View style={styles.container}>
            {/* Main Grid Layout replicating HTML structure */}

            <View style={styles.rpmContainer}>
                <RpmRamp rpm={data.rpm} rpmMax={data.rpmMax} />
            </View>

            <View style={styles.gridContainer}>


                {/* Left Column: Velocidade VSS (Takes full height) */}
                <View style={styles.leftColumn}>
                    <ChannelBox
                        label="Velocidade VSS"
                        value={Math.round(data.speed)}
                        unit="KM/H"
                        size="large"
                        theme="default"
                    />
                </View>

                {/* Right Section: 2x2 Grid for smaller cards */}
                <View style={styles.rightSection}>
                    {/* Top Row: Marcha & Temp. Motor */}
                    <View style={styles.row}>
                        <View style={styles.cell}>
                            <ChannelBox
                                label="Marcha"
                                value={data.gear}
                                unit="GEAR"
                                size="small"
                                theme="default"
                            />
                        </View>
                        <View style={styles.cell}>
                            <ChannelBox
                                label="Temp. Motor"
                                value={Math.round(data.ect)}
                                unit="°C"
                                size="small"
                                theme={data.ect > 95 ? 'warning' : 'default'}
                            />
                        </View>
                    </View>

                    {/* Bottom Row: Bateria & Diagnóstico */}
                    <View style={styles.row}>
                        <View style={styles.cell}>
                            <ChannelBox
                                label="Bateria"
                                value={data.battery.toFixed(1)}
                                unit="VOLTS"
                                size="small"
                                theme={data.battery < 12 ? 'error' : 'default'}
                            />
                        </View>
                        <View style={styles.cell}>
                            <ChannelBox
                                label="Diagnóstico"
                                value={data.fault}
                                unit="STATUS ECU"
                                size="small"
                                theme={data.fault === 'OK' ? 'success' : 'error'}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#05070a',
        padding: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    leftColumn: {
        flex: 1.2, // Slightly wider for large speed display
    },
    rightSection: {
        flex: 2,
        flexDirection: 'column',
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    cell: {
        flex: 1,
    },
    rpmContainer: {
        width: '100%',
        marginBottom: 16,
    },
});

export default DailyDashboard;