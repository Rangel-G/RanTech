import { ChannelBox } from '@/components/ui/channel-box';
import { RpmRamp } from '@/components/ui/rpmRamp';
import { useCalculatedGear } from '@/hooks/useCalculateGear';
import { useCarData } from '@/hooks/useCarData';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function DailyDashboard() {

    const { rpm, speed, coolantTemp, throttlePos, battery, engineLoad } = useCarData();
    const currentGear = useCalculatedGear(rpm, speed);

    return (
        <View style={styles.container}>
            {/* Main Grid Layout replicating HTML structure */}

            <View style={styles.rpmContainer}>
                <RpmRamp rpm={rpm} rpmMax={8000} />
            </View>

            <View style={styles.gridContainer}>


                {/* Left Column: Velocidade VSS (Takes full height) */}
                <View style={styles.leftColumn}>
                    <ChannelBox
                        label="Velocidade"
                        value={Math.round(speed)}
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
                                value={currentGear}
                                unit="GEAR"
                                size="small"
                                theme="default"
                            />
                        </View>
                        <View style={styles.cell}>
                            <ChannelBox
                                label="Temp. Motor"
                                value={Math.round(coolantTemp)}
                                unit="°C"
                                size="small"
                                theme={coolantTemp > 95 ? 'warning' : 'default'}
                            />
                        </View>
                    </View>

                    {/* Bottom Row: Bateria & Diagnóstico */}
                    <View style={styles.row}>
                        <View style={styles.cell}>
                            <ChannelBox
                                label="Bateria"
                                value={battery.toFixed(1)}
                                unit="VOLTS"
                                size="small"
                                theme={battery < 12 ? 'error' : 'default'}
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