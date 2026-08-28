import { useGroup } from '@/contexts/group-context';
import { GroupService } from '@/services/firebase/group-service';
import { calculateDistanceInMeters } from '@/utils/distance';
import { useEffect } from 'react';

export function useRouteArrival(currentLat?: number, currentLng?: number) {
    const { activeGroup, userId, routes, members } = useGroup();

    useEffect(() => {
        if (!activeGroup || !userId || !currentLat || !currentLng || routes.length === 0) return;

        routes.forEach(async (route) => {
            if (route.completedUsers && route.completedUsers[userId]) return;

            if (route.destination) {
                const distance = calculateDistanceInMeters(
                    currentLat,
                    currentLng,
                    route.destination.latitude,
                    route.destination.longitude
                );

                // Se estiver a menos de 30 metros do destino
                if (distance <= 30) {
                    try {
                        // 1. Marca como concluído para o usuário atual
                        await GroupService.markRouteCompleted(activeGroup, route.routeId, userId);

                        // 2. Verifica se todos os membros concluíram a rota
                        const totalMembersCount = members.length + 1; // Membros ativos + usuário atual
                        const completedCount = Object.keys(route.completedUsers || {}).length + 1;

                        if (completedCount >= totalMembersCount) {
                            // Se todos chegaram, remove a rota do banco de dados
                            await GroupService.removeRoute(activeGroup, route.routeId);
                        }
                    } catch (error) {
                        console.error('Erro ao processar chegada na rota:', error);
                    }
                }
            }
        });
    }, [currentLat, currentLng, routes, activeGroup, userId, members]);
}