import { get, onValue, ref, remove, set, update } from 'firebase/database';
import { rtdb } from './firebase';

export interface GroupMember {
    userId: string;
    latitude: number;
    longitude: number;
    heading: number;
    pointerColor: string;
    updatedAt: number;
    name: string;
}

export interface LocationPayload {
    latitude: number;
    longitude: number;
    heading: number;
    pointerColor: string;
    name?: string;
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
    status: 'active' | 'completed';
    origin: RouteCoordinate;
    destination: RouteCoordinate & { address?: string };
    coordinates: RouteCoordinate[];
    completedUsers: Record<string, boolean>;
    updatedAt: number;
}

export interface RoutePayload {
    creatorId: string;
    creatorName: string;
    color: string;
    origin: RouteCoordinate;
    destination: RouteCoordinate & { address?: string };
    coordinates: RouteCoordinate[];
}

// Limpa caracteres inválidos para chaves do Firebase Realtime DB
const sanitizeGroupName = (name: string) =>
    name.trim().toLowerCase().replace(/[.#$/\[\]]/g, '_');

export const GroupService = {
    /**
     * Cria um novo grupo no Realtime Database
     */
    async createGroup(groupName: string, password: string): Promise<string> {
        const groupKey = sanitizeGroupName(groupName);
        const groupRef = ref(rtdb, `groups/${groupKey}`);

        const snapshot = await get(groupRef);
        if (snapshot.exists()) {
            throw new Error('Um grupo com este nome já existe.');
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
            throw new Error('Grupo não encontrado.');
        }

        const groupData = snapshot.val();
        if (groupData.password !== password.trim()) {
            throw new Error('Senha do grupo incorreta.');
        }

        return groupKey;
    },

    /**
     * Envia/Atualiza a localização do usuário no grupo
     */
    async updateLocation(
        groupKey: string,
        userId: string,
        location: LocationPayload
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
        onMembersUpdate: (members: GroupMember[]) => void
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
        routePayload: RoutePayload
    ): Promise<void> {
        const routeRef = ref(rtdb, `groups/${groupKey}/routes/${routeId}`);
        await set(routeRef, {
            ...routePayload,
            routeId,
            status: 'active',
            completedUsers: {},
            updatedAt: Date.now(),
        });
    },

    /**
     * Escuta em tempo real todas as rotas ativas do grupo
     */
    subscribeToRoutes(
        groupKey: string,
        onRoutesUpdate: (routes: RouteData[]) => void
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
        userId: string
    ): Promise<void> {
        const userCompletedRef = ref(rtdb, `groups/${groupKey}/routes/${routeId}/completedUsers/${userId}`);
        await set(userCompletedRef, true);
    },

    /**
     * Remove uma rota específica do grupo
     */
    async removeRoute(groupKey: string, routeId: string): Promise<void> {
        const routeRef = ref(rtdb, `groups/${groupKey}/routes/${routeId}`);
        await remove(routeRef);
    }
};