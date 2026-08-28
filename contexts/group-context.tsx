// contexts/group-context.tsx
import { auth } from "@/services/firebase/firebase";
import {
    GroupMember,
    GroupService,
    RouteData,
    RoutePayload,
} from "@/services/firebase/group-service";
import { UserService } from "@/services/firebase/user-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signOut,
    User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

interface GroupContextType {
  user: User | null;
  userId: string | null;
  activeGroup: string | null;
  userName: string;
  pointerColor: string;
  isAuthenticating: boolean;
  members: GroupMember[];
  routes: RouteData[];
  promptGoogleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  saveMapSettings: (color: string, name: string) => Promise<void>;
  createGroup: (groupName: string, password: string) => Promise<void>;
  joinGroup: (groupName: string, password: string) => Promise<void>;
  leaveGroup: () => Promise<void>;
  saveRoute: (
    routeId: string,
    payload: RoutePayload,
    isPrivate?: boolean,
  ) => Promise<void>; // <-- ATUALIZADO
  removeRoute: (routeId: string, isPrivate?: boolean) => Promise<void>; // <-- ATUALIZADO
}

const GroupContext = createContext<GroupContextType>({} as GroupContextType);

GoogleSignin.configure({
  webClientId:
    "4155845801-6lu7s8nhlu1ec34jremb3vm100kh7l58.apps.googleusercontent.com",
  offlineAccess: false,
});

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Piloto");
  const [pointerColor, setPointerColor] = useState<string>("#00ffff");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);

  const [publicRoutes, setPublicRoutes] = useState<RouteData[]>([]);
  const [privateRoutes, setPrivateRoutes] = useState<RouteData[]>([]);

  // 1º UseEffect: Gerencia a autenticação e carrega os dados locais
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const savedColor = await AsyncStorage.getItem(
          `@color_${currentUser.uid}`,
        );
        const savedName = await AsyncStorage.getItem(
          `@name_${currentUser.uid}`,
        );
        const savedGroup = await AsyncStorage.getItem(
          `@group_${currentUser.uid}`,
        );

        setUserName(savedName || currentUser.displayName || "Piloto");
        if (savedColor) setPointerColor(savedColor);
        if (savedGroup) setActiveGroup(savedGroup);
      } else {
        setActiveGroup(null);
        setUserName("Piloto");
        setPointerColor("#00ffff");
      }
    });

    return () => unsubscribe();
  }, []);

  // 2º UseEffect: Conecta no Firebase para escutar os membros em tempo real
  useEffect(() => {
    let unsubscribeGroup: (() => void) | undefined;

    if (activeGroup) {
      unsubscribeGroup = GroupService.subscribeToMembers(
        activeGroup,
        (updatedMembers) => {
          const otherMembers = updatedMembers.filter(
            (m) => m.userId !== user?.uid,
          );
          setMembers(otherMembers);
        },
      );
    } else {
      setMembers([]);
    }

    return () => {
      if (unsubscribeGroup) unsubscribeGroup();
    };
  }, [activeGroup, user?.uid]);

  // 3º UseEffect: Escuta as rotas públicas do grupo em tempo real
  useEffect(() => {
    let unsubscribeRoutes: (() => void) | undefined;

    if (activeGroup) {
      unsubscribeRoutes = GroupService.subscribeToRoutes(
        activeGroup,
        (updatedRoutes) => {
          setPublicRoutes(updatedRoutes);
        },
      );
    } else {
      setPublicRoutes([]);
    }

    return () => {
      if (unsubscribeRoutes) unsubscribeRoutes();
    };
  }, [activeGroup]);

  // 4º UseEffect: Escuta as rotas privadas do usuário em tempo real
  useEffect(() => {
    let unsubscribePrivateRoutes: (() => void) | undefined;

    if (user?.uid) {
      unsubscribePrivateRoutes = UserService.subscribeToPrivateRoutes(
        user.uid,
        (updatedRoutes) => {
          setPrivateRoutes(updatedRoutes);
        },
      );
    } else {
      setPrivateRoutes([]);
    }

    return () => {
      if (unsubscribePrivateRoutes) unsubscribePrivateRoutes();
    };
  }, [user?.uid]);

  // Unifica rotas públicas do grupo com as rotas particulares do usuário
  const routes = [...publicRoutes, ...privateRoutes];

  const promptGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return;
      }

      const { idToken } = response.data;
      if (!idToken) {
        throw new Error("Google não retornou idToken.");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            break;
          case statusCodes.IN_PROGRESS:
            console.warn("Login Google já em andamento.");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.warn("Google Play Services indisponível.");
            break;
          default:
            console.error("Erro Google Sign-In:", error.code, error.message);
        }
      } else {
        console.error("Erro inesperado no login Google:", error);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.warn("Erro ao deslogar do Google Sign-In:", error);
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

  // Funções de gerenciamento de rotas (Públicas vs Privadas)
  const saveRoute = async (
    routeId: string,
    payload: RoutePayload,
    isPrivate: boolean = false,
  ) => {
    if (isPrivate) {
      if (!user) throw new Error("Usuário não autenticado.");
      await UserService.savePrivateRoute(user.uid, routeId, payload);
    } else {
      if (!activeGroup) throw new Error("Nenhum grupo ativo.");
      await GroupService.saveRoute(activeGroup, routeId, payload);
    }
  };

  const removeRoute = async (routeId: string, isPrivate: boolean = false) => {
    if (isPrivate) {
      if (!user) throw new Error("Usuário não autenticado.");
      await UserService.removePrivateRoute(user.uid, routeId);
    } else {
      if (!activeGroup) throw new Error("Nenhum grupo ativo.");
      await GroupService.removeRoute(activeGroup, routeId);
    }
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
        members,
        promptGoogleLogin,
        logout,
        saveMapSettings,
        createGroup,
        joinGroup,
        leaveGroup,
        routes,
        saveRoute,
        removeRoute,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export const useGroup = () => useContext(GroupContext);
