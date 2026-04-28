import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDG2LBEyD1J8ace0Lk0kdzb-oR8QFRVM70",
  authDomain: "erp-design-9ba1a.firebaseapp.com",
  projectId: "erp-design-9ba1a",
  storageBucket: "erp-design-9ba1a.firebasestorage.app",
  messagingSenderId: "390588374504",
  appId: "1:390588374504:web:30c936ced7740f1b51585d",
  measurementId: "G-L4PS60JXZQ",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
