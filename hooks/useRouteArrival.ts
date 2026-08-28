import { useGroup } from '@/contexts/group-context';
import { GroupService } from '@/services/firebase/group-service';
import { calculateDistanceInMeters } from '@/utils/distance';
import { useEffect } from 'react';

export function useRouteArrival(currentLat?: number, currentLng?: number) {
    const { activeGroup, userId, routes } = useGroup();

    useEffect(() => {
        if (!activeGroup || !userId || !currentLat || !currentLng || routes.length === 0) return;

        routes.forEach(async (route) => {
            // Se o usuário já concluiu esta rota, ignora
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
                        await GroupService.markRouteCompleted(activeGroup, route.routeId, userId);
                        
                        // Opcional: Verificar se todos os membros ativos concluíram a rota para removê-la
                        // (Pode ser verificado se o número de conclusões atinge o total de membros)
                    } catch (error) {
                        console.error('Erro ao marcar rota como concluída:', error);
                    }
                }
            }
        });
    }, [currentLat, currentLng, routes, activeGroup, userId]);
}