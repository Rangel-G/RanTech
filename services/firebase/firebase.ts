import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';

// Ignora o aviso do TypeScript, a função existe no código compilado
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// Substitua com as suas credenciais do Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBmEQT25kaltxHIJfD5FNL3WcsyyKhuCUs",
    authDomain: "rantech-mobile-b649d.firebaseapp.com",
    databaseURL: "https://rantech-mobile-b649d-default-rtdb.firebaseio.com",
    projectId: "rantech-mobile-b649d",
    storageBucket: "rantech-mobile-b649d.firebasestorage.app",
    messagingSenderId: "4155845801",
    appId: "1:4155845801:web:f0b03d114a149b601d4db8",
    measurementId: "G-95B4W4F7BM"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const rtdb = getDatabase(app);
export const db = getFirestore(app);

// REMOVA: export const auth = getAuth(app);
// ADICIONE ESTA INICIALIZAÇÃO:
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});