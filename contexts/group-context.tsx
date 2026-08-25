// contexts/group-context.tsx
import { auth } from '@/services/firebase/firebase';
import { GroupService } from '@/services/firebase/group-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signOut,
    User,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface GroupContextType {
    user: User | null;
    userId: string | null;
    activeGroup: string | null;
    userName: string;
    pointerColor: string;
    isAuthenticating: boolean;
    promptGoogleLogin: () => Promise<void>;
    logout: () => Promise<void>;
    saveMapSettings: (color: string, name: string) => Promise<void>;
    createGroup: (groupName: string, password: string) => Promise<void>;
    joinGroup: (groupName: string, password: string) => Promise<void>;
    leaveGroup: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType>({} as GroupContextType);

// IMPORTANTE: webClientId = OAuth Client ID tipo "Web application" do Google Cloud Console
// (o mesmo vinculado ao projeto Firebase). NÃO é o Web App do Firebase.
GoogleSignin.configure({
    webClientId: '4155845801-6lu7s8nhlu1ec34jremb3vm100kh7l58.apps.googleusercontent.com',
    offlineAccess: false,
});

export function GroupProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('Piloto');
    const [pointerColor, setPointerColor] = useState<string>('#00ffff');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

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

    const promptGoogleLogin = async () => {
        setIsAuthenticating(true);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const response = await GoogleSignin.signIn();

            if (!isSuccessResponse(response)) {
                // Usuário cancelou o fluxo
                return;
            }

            const { idToken } = response.data;
            if (!idToken) {
                throw new Error('Google não retornou idToken.');
            }

            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        break;
                    case statusCodes.IN_PROGRESS:
                        console.warn('Login Google já em andamento.');
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        console.warn('Google Play Services indisponível.');
                        break;
                    default:
                        console.error('Erro Google Sign-In:', error.code, error.message);
                }
            } else {
                console.error('Erro inesperado no login Google:', error);
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    const logout = async () => {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.warn('Erro ao deslogar do Google Sign-In:', error);
        }
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
                isAuthenticating,
                promptGoogleLogin,
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