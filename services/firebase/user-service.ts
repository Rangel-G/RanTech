import { onValue, ref, remove, set } from "firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  GearSettings,
  LedSettings,
  ObdSettings,
} from "../storage/settings-storage";
import { db, rtdb } from "./firebase";
import { RouteData, RoutePayload } from "./group-service";

export interface UserSettingsDoc {
  profile: {
    pilotName: string;
    pointerColor: string;
    activeGroup: string | null;
  };
  obd: ObdSettings;
  led: LedSettings;
  gear: GearSettings;
}

export interface PrivateRouteData extends RouteData {
  isPrivate: true;
}

export const UserService = {
  /**
   * Busca todas as configurações salvas do usuário no Firestore[cite: 4]
   */
  async loadUserSettings(
    uid: string,
  ): Promise<Partial<UserSettingsDoc> | null> {
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      return snap.exists() ? (snap.data() as UserSettingsDoc) : null;
    } catch (error) {
      console.error("Erro ao carregar dados do usuário do Firestore:", error);
      return null;
    }
  },

  /**
   * Salva ou atualiza campos específicos no documento do usuário (usando merge)[cite: 4]
   */
  async saveUserSettings(
    uid: string,
    data: Partial<UserSettingsDoc>,
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      // { merge: true } garante que se você salvar só 'led', ele não apaga o 'obd'[cite: 4]
      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar no Firestore:", error);
      throw error;
    }
  },

  /**
   * Salva ou atualiza uma rota privada no nó pessoal do usuário no Realtime Database
   */
  async savePrivateRoute(
    userId: string,
    routeId: string,
    routePayload: RoutePayload,
  ): Promise<void> {
    const routeRef = ref(rtdb, `users/${userId}/privateRoutes/${routeId}`);
    await set(routeRef, {
      ...routePayload,
      routeId,
      isPrivate: true,
      status: "active",
      completedUsers: { [userId]: false },
      updatedAt: Date.now(),
    });
  },

  /**
   * Escuta em tempo real todas as rotas privadas do usuário
   */
  subscribeToPrivateRoutes(
    userId: string,
    onRoutesUpdate: (routes: RouteData[]) => void,
  ): () => void {
    const routesRef = ref(rtdb, `users/${userId}/privateRoutes`);

    const unsubscribe = onValue(routesRef, (snapshot) => {
      if (!snapshot.exists()) {
        onRoutesUpdate([]);
        return;
      }

      const rawData = snapshot.val();
      const routesList: RouteData[] = Object.keys(rawData).map((id) => ({
        ...rawData[id],
        routeId: id,
        isPrivate: true,
      }));

      onRoutesUpdate(routesList);
    });

    return unsubscribe;
  },

  /**
   * Remove uma rota privada específica
   */
  async removePrivateRoute(userId: string, routeId: string): Promise<void> {
    const routeRef = ref(rtdb, `users/${userId}/privateRoutes/${routeId}`);
    await remove(routeRef);
  },

  /**
   * Limpa todas as rotas privadas do usuário
   */
  async clearPrivateRoutes(userId: string): Promise<void> {
    const routesRef = ref(rtdb, `users/${userId}/privateRoutes`);
    await remove(routesRef);
  },
};
