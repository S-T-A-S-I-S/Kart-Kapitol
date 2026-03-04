// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAunNnSwaIdSzq4t1jebGCdqJaTEtcQoFbk",
  authDomain: "kart-kapitol-89d82.firebaseapp.com",
  projectId: "kart-kapitol-89d82",
  storageBucket: "kart-kapitol-89d82.firebasestorage.app",
  messagingSenderId: "488402375742",
  appId: "1:488402375742:web:012cbddd266b07f4ba2d6f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
