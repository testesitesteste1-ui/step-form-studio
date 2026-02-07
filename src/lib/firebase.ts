import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAjb9cS8TTH5omWbYbmFJorKd2ixirvRHc",
  authDomain: "neurasys-e9418.firebaseapp.com",
  databaseURL: "https://neurasys-e9418-default-rtdb.firebaseio.com",
  projectId: "neurasys-e9418",
  storageBucket: "neurasys-e9418.firebasestorage.app",
  messagingSenderId: "1093846128296",
  appId: "1:1093846128296:web:8d3bc41fe485f8fee9149d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export async function saveToDatabase(path: string, data: Record<string, unknown>) {
  const dbRef = ref(database, path);
  return push(dbRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
}
