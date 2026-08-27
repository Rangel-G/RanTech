import { ChannelBox } from '@/components/ui/channel-box';
import { RpmRamp } from '@/components/ui/rpmRamp';
import { useCalculatedGear } from '@/hooks/useCalculateGear';
import { useCarData } from '@/hooks/useCarData';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function TrackDashboard() {

    const { rpm, speed, engineLoad, rpmMax, coolantTemp, map } = useCarData();
    const currentGear = useCalculatedGear(rpm, speed);

    return (
        <View style={styles.container}>
            <View style={styles.rpmContainer}>
                <RpmRamp rpm={rpm} rpmMax={rpmMax} />
            </View>


            {/* 3-column grid for middle row */}
            <View style={styles.threeColumnRow}>
                <View style={styles.boxWrapper}>
                    <ChannelBox
                        label="Temp. Motor"
                        value={Math.round(coolantTemp)}
                        unit="°C"
                        size="small"
                        theme={coolantTemp > 95 ? 'warning' : 'default'}
                    />
                </View>
                <View style={styles.boxWrapper}>
                    <ChannelBox
                        label="Pressão MAP"
                        value={map.toFixed(2)}
                        unit="BAR"
                        size="small"
                        theme="default"
                    />
                </View>
                <View style={styles.boxWrapper}>
                    <ChannelBox
                        label="Marcha"
                        value={currentGear}
                        unit="GEAR"
                        size="small"
                        theme="default"
                    />
                </View>
            </View>

            {/* Bottom row - Speed (1 col), Power (2 cols) */}
            <View style={styles.twoRowBottom}>
                <View style={[styles.boxWrapper, { flex: 1 }]}>
                    <ChannelBox
                        label="Velocidade"
                        value={Math.round(speed)}
                        unit="KM/H"
                        size="small"
                        theme="default"
                    />
                </View>
                <View style={[styles.boxWrapper, { flex: 2 }]}>
                    <ChannelBox
                        label="Carga do Motor"
                        value={`${Math.round(engineLoad)}%`}
                        unit="LOAD"
                        size="small"
                        theme="default"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(2, 8, 16, 0.96)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 255, 255, 0.12)',
    },
    fullWidthBox: {
        width: '100%',
        marginBottom: 12,
    },
    threeColumnRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    boxWrapper: {
        flex: 1,
    },
    twoRowBottom: {
        flexDirection: 'row',
        gap: 12,
    },
    rpmContainer: {
        width: '100%',
        marginBottom: 16,
    },
});
