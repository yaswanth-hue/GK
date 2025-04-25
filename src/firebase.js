// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database"; // ✅ Import Realtime Database

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPzK7qLpsNwpEBUQ3CPMFhnliVYeXe8yc",
  authDomain: "instru-d22a4.firebaseapp.com",
  projectId: "instru-d22a4",
  storageBucket: "instru-d22a4.appspot.com",
  messagingSenderId: "1626112232",
  appId: "1:1626112232:web:51ab909e5012145c8c495d",
  measurementId: "G-0F7Y9ZCBW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app); // ✅ Initialize RTDB

// Auth providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Auth functions
const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
const signUpWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
const logout = () => signOut(auth);

// Firestore helper functions
const addResource = async (data) => {
  const docRef = await addDoc(collection(db, "resources"), data);
  return docRef.id;
};

const updateResource = async (id, updatedData) => {
  const resourceRef = doc(db, "resources", id);
  await updateDoc(resourceRef, updatedData);
};

const deleteResource = async (id) => {
  const resourceRef = doc(db, "resources", id);
  await deleteDoc(resourceRef);
};

const getResourcesByInstrumentAndLevel = async (instrument, level) => {
  const q = query(
    collection(db, "resources"),
    where("instrument", "==", instrument),
    where("level", "==", level)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Export RTDB as well
export {
  auth,
  db,
  storage,
  rtdb,
  googleProvider,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logout,
  addResource,
  updateResource,
  deleteResource,
  getResourcesByInstrumentAndLevel
};
