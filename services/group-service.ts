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
     * Remove o marcador do usuário do grupo ao sair
     */
    async leaveGroup(groupKey: string, userId: string): Promise<void> {
        const memberRef = ref(rtdb, `groups/${groupKey}/members/${userId}`);
        await remove(memberRef);
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
};