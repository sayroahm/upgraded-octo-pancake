import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6KN09Nx7er5eFYLkCOimWGYLJtwuwXU0",
  authDomain: "nbep-5039a.firebaseapp.com",
  projectId: "nbep-5039a",
  storageBucket: "nbep-5039a.firebasestorage.app",
  messagingSenderId: "753495624185",
  appId: "1:753495624185:web:8245b64f6c374794081528",
  measurementId: "G-GRFMK30MVM"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

(async () => {
  if (window.location.pathname === "/error" || window.location.pathname.endsWith("error.html")) return;

  try {
    const outageRef = doc(db, "outage", "bool");
    const outageSnap = await getDoc(outageRef);

    if (outageSnap.exists() && outageSnap.data().outage === true) {
      window.location.replace("/error");
    }
  } catch (err) {
    console.warn("[NBEP] Outage check failed:", err.message);
  }
})();
