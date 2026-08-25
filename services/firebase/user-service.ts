// services/firebase/user-service.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GearSettings, LedSettings, ObdSettings } from '../storage/settings-storage';
import { db } from './firebase';

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

export const UserService = {
    /**
     * Busca todas as configurações salvas do usuário no Firestore
     */
    async loadUserSettings(uid: string): Promise<Partial<UserSettingsDoc> | null> {
        try {
            const userRef = doc(db, 'users', uid);
            const snap = await getDoc(userRef);
            return snap.exists() ? (snap.data() as UserSettingsDoc) : null;
        } catch (error) {
            console.error('Erro ao carregar dados do usuário do Firestore:', error);
            return null;
        }
    },

    /**
     * Salva ou atualiza campos específicos no documento do usuário (usando merge)
     */
    async saveUserSettings(uid: string, data: Partial<UserSettingsDoc>): Promise<void> {
        try {
            const userRef = doc(db, 'users', uid);
            // { merge: true } garante que se você salvar só 'led', ele não apaga o 'obd'
            await setDoc(userRef, data, { merge: true });
        } catch (error) {
            console.error('Erro ao salvar no Firestore:', error);
            throw error;
        }
    },
};