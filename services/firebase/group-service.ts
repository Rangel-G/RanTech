// services/firebase/group-service.ts
import { get, onValue, ref, remove, set, update } from "firebase/database";
import { rtdb } from "./firebase";

export interface GroupMember {
  userId: string;
  latitude: number;
  longitude: number;
  heading: number;
  pointerColor: string;
  updatedAt: number;
  name: string;
  pushToken?: string;
  statusBadge?: "active" | "fuel" | "flat_tire" | "food" | "stopped";
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  heading: number;
  pointerColor: string;
  name?: string;
  pushToken?: string;
  statusBadge?: "active" | "fuel" | "flat_tire" | "food" | "stopped";
}

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface RouteData {
  routeId: string;
  creatorId: string;
  creatorName: string;
  color: string;
  status: "active" | "completed";
  origin: RouteCoordinate;
  destination: RouteCoordinate & { address?: string };
  coordinates: RouteCoordinate[];
  completedUsers: Record<string, boolean>;
  updatedAt: number;
  isPrivate?: boolean;
}

export interface RoutePayload {
  creatorId: string;
  creatorName: string;
  color: string;
  origin: RouteCoordinate;
  destination: RouteCoordinate & { address?: string };
  coordinates: RouteCoordinate[];
  isPrivate?: boolean;
}

export interface MeetingData {
  meetingId: string;
  creatorId: string;
  creatorName: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: number;
  expiresAt: number;
  status: "active" | "completed" | "expired";
  responses?: Record<string, "accepted" | "declined">;
}

export interface TripReport {
  tripId: string;
  userId: string;
  userName: string;
  distanceKm: number;
  durationFormatted: string;
  maxSpeedKmH: number;
  avgSpeedKmH: number;
  destinationAddress: string;
  timestamp: number;
}

// Limpa caracteres inválidos para chaves do Firebase Realtime DB
const sanitizeGroupName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[.#$/\[\]]/g, "_");

export const GroupService = {
  /**
   * Cria um novo grupo no Realtime Database
   */
  async createGroup(groupName: string, password: string): Promise<string> {
    const groupKey = sanitizeGroupName(groupName);
    const groupRef = ref(rtdb, `groups/${groupKey}`);

    const snapshot = await get(groupRef);
    if (snapshot.exists()) {
      throw new Error("Um grupo com este nome já existe.");
    }

    await set(groupRef, {
      displayName: groupName,
      password: password.trim(),
      createdAt: Date.now(),
      members: {},
    });

    return groupKey;
  },

  /**
   * Valida a existência e senha para entrar no grupo
   */
  async joinGroup(groupName: string, password: string): Promise<string> {
    const groupKey = sanitizeGroupName(groupName);
    const groupRef = ref(rtdb, `groups/${groupKey}`);

    const snapshot = await get(groupRef);
    if (!snapshot.exists()) {
      throw new Error("Grupo não encontrado.");
    }

    const groupData = snapshot.val();
    if (groupData.password !== password.trim()) {
      throw new Error("Senha do grupo incorreta.");
    }

    return groupKey;
  },

  /**
   * Envia/Atualiza a localização do usuário no grupo
   */
  async updateLocation(
    groupKey: string,
    userId: string,
    location: LocationPayload,
  ): Promise<void> {
    const memberRef = ref(rtdb, `groups/${groupKey}/members/${userId}`);
    await update(memberRef, {
      ...location,
      updatedAt: Date.now(),
    });
  },

  /**
   * Remove o marcador do usuário e limpa as rotas criadas por ele ao sair do grupo
   */
  async leaveGroup(groupKey: string, userId: string): Promise<void> {
    // 1. Remove o membro
    const memberRef = ref(rtdb, `groups/${groupKey}/members/${userId}`);
    await remove(memberRef);

    // 2. Busca e remove as rotas criadas por este usuário
    const routesRef = ref(rtdb, `groups/${groupKey}/routes`);
    const snapshot = await get(routesRef);

    if (snapshot.exists()) {
      const routesData = snapshot.val();
      const updates: Record<string, null> = {};

      Object.keys(routesData).forEach((routeId) => {
        if (routesData[routeId].creatorId === userId) {
          updates[`groups/${groupKey}/routes/${routeId}`] = null;
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(ref(rtdb), updates);
      }
    }
  },

  /**
   * Escuta em tempo real os membros conectados ao grupo
   */
  subscribeToMembers(
    groupKey: string,
    onMembersUpdate: (members: GroupMember[]) => void,
  ): () => void {
    const membersRef = ref(rtdb, `groups/${groupKey}/members`);

    const unsubscribe = onValue(membersRef, (snapshot) => {
      if (!snapshot.exists()) {
        onMembersUpdate([]);
        return;
      }

      const rawData = snapshot.val();
      const membersList: GroupMember[] = Object.keys(rawData).map((id) => ({
        userId: id,
        ...rawData[id],
      }));

      onMembersUpdate(membersList);
    });

    return unsubscribe;
  },

  /**
   * Salva ou adiciona uma nova rota no grupo
   */
  async saveRoute(
    groupKey: string,
    routeId: string,
    routePayload: RoutePayload,
  ): Promise<void> {
    const routeRef = ref(rtdb, `groups/${groupKey}/routes/${routeId}`);
    await set(routeRef, {
      ...routePayload,
      routeId,
      status: "active",
      completedUsers: {},
      updatedAt: Date.now(),
    });
  },

  /**
   * Escuta em tempo real todas as rotas ativas do grupo
   */
  subscribeToRoutes(
    groupKey: string,
    onRoutesUpdate: (routes: RouteData[]) => void,
  ): () => void {
    const routesRef = ref(rtdb, `groups/${groupKey}/routes`);

    const unsubscribe = onValue(routesRef, (snapshot) => {
      if (!snapshot.exists()) {
        onRoutesUpdate([]);
        return;
      }

      const rawData = snapshot.val();
      const routesList: RouteData[] = Object.keys(rawData).map((id) => ({
        ...rawData[id],
        routeId: id,
      }));

      onRoutesUpdate(routesList);
    });

    return unsubscribe;
  },

  /**
   * Marca que um usuário concluiu uma rota específica
   */
  async markRouteCompleted(
    groupKey: string,
    routeId: string,
    userId: string,
  ): Promise<void> {
    const userCompletedRef = ref(
      rtdb,
      `groups/${groupKey}/routes/${routeId}/completedUsers/${userId}`,
    );
    await set(userCompletedRef, true);
  },

  /**
   * Remove uma rota específica do grupo
   */
  async removeRoute(groupKey: string, routeId: string): Promise<void> {
    const routeRef = ref(rtdb, `groups/${groupKey}/routes/${routeId}`);
    await remove(routeRef);
  },

  /**
   * Remove todas as rotas ativas de um grupo
   */
  async clearRoutes(groupKey: string): Promise<void> {
    const routesRef = ref(rtdb, `groups/${groupKey}/routes`);
    await remove(routesRef);
  },

  /**
   * Remove apenas as rotas públicas criadas pelo usuário atual
   */
  async clearMyGroupRoutes(groupKey: string, userId: string): Promise<void> {
    const routesRef = ref(rtdb, `groups/${groupKey}/routes`);
    const snapshot = await get(routesRef);

    if (snapshot.exists()) {
      const routesData = snapshot.val();
      const updates: Record<string, null> = {};

      Object.keys(routesData).forEach((routeId) => {
        if (routesData[routeId].creatorId === userId) {
          updates[`groups/${groupKey}/routes/${routeId}`] = null;
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(ref(rtdb), updates);
      }
    }
  },

  /**
   * Cria um novo convite de encontro no grupo
   */
  async createMeeting(groupKey: string, payload: MeetingData): Promise<void> {
    const meetingRef = ref(
      rtdb,
      `groups/${groupKey}/meetings/${payload.meetingId}`,
    );
    await set(meetingRef, payload);
  },

  /**
   * Escuta o encontro mais recente que ainda está ativo e dentro do prazo de 90s
   */
  subscribeToActiveMeeting(
    groupKey: string,
    callback: (meeting: MeetingData | null) => void,
  ) {
    const meetingsRef = ref(rtdb, `groups/${groupKey}/meetings`);
    return onValue(meetingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const meetings = snapshot.val();
        const now = Date.now();

        // Filtra os encontros ativos e não expirados
        const activeMeetings = Object.values(meetings)
          .filter((m: any) => m.status === "active" && m.expiresAt > now)
          .sort((a: any, b: any) => b.createdAt - a.createdAt);

        if (activeMeetings.length > 0) {
          callback(activeMeetings[0] as MeetingData);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  /**
   * Registra a resposta do usuário (aceitou ou recusou)
   */
  async respondToMeeting(
    groupKey: string,
    meetingId: string,
    userId: string,
    response: "accepted" | "declined",
  ) {
    const responseRef = ref(
      rtdb,
      `groups/${groupKey}/meetings/${meetingId}/responses/${userId}`,
    );
    await set(responseRef, response);
  },

  /**
   * Atualiza o status do encontro (completed ou expired)
   */
  async updateMeetingStatus(
    groupKey: string,
    meetingId: string,
    status: "completed" | "expired",
  ) {
    const statusRef = ref(
      rtdb,
      `groups/${groupKey}/meetings/${meetingId}/status`,
    );
    await set(statusRef, status);
  },

  /**
   * Atualiza o status visual do usuário no mapa
   */
  async updateUserStatus(
    groupKey: string,
    userId: string,
    statusBadge: "active" | "fuel" | "flat_tire" | "food" | "stopped",
  ) {
    const statusRef = ref(
      rtdb,
      `groups/${groupKey}/members/${userId}/statusBadge`,
    );
    await set(statusRef, statusBadge);
  },

  // Dentro do GroupService:
  async saveGroupTrip(groupKey: string, tripData: TripReport) {
    const tripRef = ref(rtdb, `groups/${groupKey}/trips/${tripData.tripId}`);
    await set(tripRef, tripData);
  },
};
