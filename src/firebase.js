// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Importa o Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxlb8PwSAizbH0TcWR9nCQkE-n6LdKYMQ",
  authDomain: "app-vidragem.firebaseapp.com",
  projectId: "app-vidragem",
  storageBucket: "app-vidragem.firebasestorage.app",
  messagingSenderId: "194286818143",
  appId: "1:194286818143:web:b0b7e82c2f34b343a0dcea",
  measurementId: "G-DWQPVVR5R1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializa o Firestore
const db = getFirestore(app);  // Aqui estamos a obter a instância do Firestore

// Exporta o db para que possas usá-lo em outros ficheiros
export { db }; // Agora o db pode ser importado em outros componentes
