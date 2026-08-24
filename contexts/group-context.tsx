import { auth } from '@/services/firebase';
import { GroupService } from '@/services/group-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signOut,
    User,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Necessário para fechar o navegador web de autenticação corretamente
WebBrowser.maybeCompleteAuthSession();

interface GroupContextType {
    user: User | null;
    userId: string | null;
    activeGroup: string | null;
    userName: string;
    pointerColor: string;
    promptGoogleLogin: () => void;
    logout: () => Promise<void>;
    saveMapSettings: (color: string, name: string) => Promise<void>;
    createGroup: (groupName: string, password: string) => Promise<void>;
    joinGroup: (groupName: string, password: string) => Promise<void>;
    leaveGroup: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType>({} as GroupContextType);

export function GroupProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('Piloto');
    const [pointerColor, setPointerColor] = useState<string>('#00ffff');

    // Configuração do provedor Google para Expo Go
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: '4155845801-6lu7s8nhlu1ec34jremb3vm100kh7l58.apps.googleusercontent.com',
    });

    // Escuta o retorno do login no navegador
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential).catch((err) => {
                console.error('Erro ao autenticar no Firebase com ID Token:', err);
            });
        }
    }, [response]);

    // Monitora sessão ativa no Firebase Auth
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const savedColor = await AsyncStorage.getItem(`@color_${currentUser.uid}`);
                const savedName = await AsyncStorage.getItem(`@name_${currentUser.uid}`);
                const savedGroup = await AsyncStorage.getItem(`@group_${currentUser.uid}`);

                setUserName(savedName || currentUser.displayName || 'Piloto');
                if (savedColor) setPointerColor(savedColor);
                if (savedGroup) setActiveGroup(savedGroup);
            } else {
                setActiveGroup(null);
                setUserName('Piloto');
                setPointerColor('#00ffff');
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setActiveGroup(null);
    };

    const saveMapSettings = async (color: string, name: string) => {
        setPointerColor(color);
        setUserName(name);

        if (user) {
            await AsyncStorage.setItem(`@color_${user.uid}`, color);
            await AsyncStorage.setItem(`@name_${user.uid}`, name);
        }
    };

    const createGroup = async (groupName: string, password: string) => {
        const groupKey = await GroupService.createGroup(groupName, password);
        setActiveGroup(groupKey);
        if (user) await AsyncStorage.setItem(`@group_${user.uid}`, groupKey);
    };

    const joinGroup = async (groupName: string, password: string) => {
        const groupKey = await GroupService.joinGroup(groupName, password);
        setActiveGroup(groupKey);
        if (user) await AsyncStorage.setItem(`@group_${user.uid}`, groupKey);
    };

    const leaveGroup = async () => {
        if (activeGroup && user) {
            await GroupService.leaveGroup(activeGroup, user.uid);
            await AsyncStorage.removeItem(`@group_${user.uid}`);
        }
        setActiveGroup(null);
    };

    return (
        <GroupContext.Provider
            value={{
                user,
                userId: user?.uid ?? null,
                activeGroup,
                userName,
                pointerColor,
                promptGoogleLogin: () => promptAsync(),
                logout,
                saveMapSettings,
                createGroup,
                joinGroup,
                leaveGroup,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
}

export const useGroup = () => useContext(GroupContext);