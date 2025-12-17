import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvcD_pv7BxdahqbGBAITmJ8YCvz61wRko",

  authDomain: "projetinho-bd.firebaseapp.com",

  projectId: "projetinho-bd",

  storageBucket: "projetinho-bd.appspot.com",

  messagingSenderId: "869357374893",

  appId: "1:869357374893:web:a4ad7e076fe8eb6064e524",

  measurementId: "G-VMNCPK736R",

  databaseURL: "https://projetinho-bd-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const database = getDatabase(app);

export const storage = getStorage(app);
