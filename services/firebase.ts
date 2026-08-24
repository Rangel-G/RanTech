import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

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

// Evita reinicializar o app durante Hot Reloading do React Native
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Instância do Realtime Database
export const rtdb = getDatabase(app);
export const auth = getAuth(app);