import { useGroup } from "@/contexts/group-context";
import { GroupService } from "@/services/firebase/group-service";
import { UserService } from "@/services/firebase/user-service";
import { calculateDistanceInMeters } from "@/utils/distance";
import { useEffect } from "react";

export function useRouteArrival(currentLat?: number, currentLng?: number) {
  const { activeGroup, userId, routes, members } = useGroup();

  useEffect(() => {
    if (!userId || !currentLat || !currentLng || routes.length === 0) return;

    routes.forEach(async (route) => {
      // Se o usuário já concluiu esta rota, ignora
      if (route.completedUsers && route.completedUsers[userId]) return;

      if (route.destination) {
        const distance = calculateDistanceInMeters(
          currentLat,
          currentLng,
          route.destination.latitude,
          route.destination.longitude,
        );

        // Proximidade de 30 metros do destino
        if (distance <= 30) {
          try {
            if (route.isPrivate) {
              // ROTA PRIVADA: Remove diretamente do nó do usuário no Firebase
              await UserService.removePrivateRoute(userId, route.routeId);
            } else if (activeGroup) {
              // ROTA PÚBLICA: Aplica a regra de conclusão em grupo
              await GroupService.markRouteCompleted(
                activeGroup,
                route.routeId,
                userId,
              );

              const totalMembersCount = members.length + 1;
              const completedCount =
                Object.keys(route.completedUsers || {}).length + 1;

              // Se todos os membros ativos concluíram, remove do grupo
              if (completedCount >= totalMembersCount) {
                await GroupService.removeRoute(activeGroup, route.routeId);
              }
            }
          } catch (error) {
            console.error("Erro ao processar chegada ao destino:", error);
          }
        }
      }
    });
  }, [currentLat, currentLng, routes, activeGroup, userId, members]);
}
