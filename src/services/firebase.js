import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Centralized Firebase initialization
const firebaseConfig = {
  apiKey: 'AIzaSyDSBkaERxrvKBhH8NiVdVJ5GOtKNIT3AyQ',
  authDomain: 'bttal-project.firebaseapp.com',
  projectId: 'bttal-project',
  storageBucket: 'bttal-project.appspot.com',
  messagingSenderId: '564894255609',
  appId: '1:564894255609:web:31c4f5429495bcbb0e9528',
  measurementId: 'G-GKVXXZ059D',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Helpful constant for Firestore paths
const appId = firebaseConfig.appId;

export { app, db, auth, appId };
