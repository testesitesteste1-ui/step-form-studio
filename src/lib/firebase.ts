import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC_HD_iLoXcIFrF_d0ke2BlpHKVYLLq7Zw",
  authDomain: "formulario-a515c.firebaseapp.com",
  databaseURL: "https://formulario-a515c-default-rtdb.firebaseio.com",
  projectId: "formulario-a515c",
  storageBucket: "formulario-a515c.firebasestorage.app",
  messagingSenderId: "932322013974",
  appId: "1:932322013974:web:7347a76c8d38444c205637"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const saveFormSubmission = async (answers: Record<number, string>) => {
  const submissionsRef = ref(database, "submissions");
  await push(submissionsRef, {
    answers,
    submittedAt: new Date().toISOString(),
  });
};

export { database };
