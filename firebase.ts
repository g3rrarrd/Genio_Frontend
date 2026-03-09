
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { User } from './types';

// CONFIGURACIÓN DE FIREBASE
// Debes reemplazar estos valores con los de tu proyecto en la consola de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Guarda la puntuación de un jugador en la colección 'rankings'
 */
export const saveScoreToCloud = async (user: User, score: number) => {
  try {
    const docRef = await addDoc(collection(db, "rankings"), {
      userName: user.name,
      email: user.email,
      score: Math.floor(score),
      avatarIcon: user.avatarIcon || 'person',
      avatarColor: user.avatarColor || '#13ec5b',
      timestamp: serverTimestamp(),
      platform: 'web-genio'
    });
    console.log("Puntuación guardada con ID: ", docRef.id);
    return true;
  } catch (e) {
    console.error("Error al guardar en Firebase: ", e);
    return false;
  }
};

/**
 * Obtiene el Top 10 de jugadores globales (Para uso futuro en Ranking.tsx)
 */
export const getGlobalRankings = async () => {
  try {
    const q = query(collection(db, "rankings"), orderBy("score", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Error al obtener rankings: ", e);
    return [];
  }
};
