import { ChannelBox } from '@/components/ui/channel-box';
import { GEAR_OPTIONS } from '@/constants/gear-options';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export function DailyDashboard() {
    const [data, setData] = useState({
        speed: 0,
        gear: 'N',
        temp: 0,
        battery: 13.2,
        fault: 'OK',
    });

    // Simulate data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setData((prev) => ({
                ...prev,
                speed: Math.max(0, prev.speed + Math.random() * 20 - 5),
                temp: Math.max(20, Math.min(120, prev.temp + Math.random() * 4 - 2)),
                gear: GEAR_OPTIONS[Math.floor(Math.random() * GEAR_OPTIONS.length)],
                battery: 12.5 + Math.random() * 2,
            }));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            {/* Main Grid Layout replicating HTML structure */}
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
                                value={Math.round(data.temp)}
                                unit="°C"
                                size="small"
                                theme={data.temp > 95 ? 'warning' : 'default'}
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
});

export default DailyDashboard;