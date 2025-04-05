import admin from 'firebase-admin';
import { initializeApp } from "firebase/app"; // Import the Firebase client SDK
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; // Add getDoc to the importsimport dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';


dotenv.config({ path: './.env' });

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve('./wildlife-go-firebase-adminsdk-fbsvc-9f89698fb0.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
/*
// Initialize Firebase Client SDK
const firebaseConfig = {
  apiKey: process.env.DB_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSEGAGING_SENDER_ID,
  appId: process.env.APP_ID,
};
*/

const firebaseConfig = {
    apiKey: "AIzaSyC0CpwZTi5XpiVD6Je9bn406fd4Xg6sBtY",
    authDomain: "wildlife-go.firebaseapp.com",
    projectId: "wildlife-go",
    storageBucket: "wildlife-go.firebasestorage.app",
    messagingSenderId: "191317303089",
    appId: "1:191317303089:web:5ff60a66b538243d245a10",
    measurementId: "G-ECPTZJ35LK"
  };


const firebaseApp = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export async function signup(email, password, username) {
  try {
    const auth = getAuth(); // Use the initialized client app
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const firestore = getFirestore(firebaseApp); // Use the client Firestore instance

    // Store the username in Cloud Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      username: username,
      email: email, // You might want to store the email as well
    });

    console.log("Sign up success! User:", user.uid, "Username:", username);
    return true;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;

    if (errorCode == 'auth/weak-password') {
      console.log('The password is too weak.');
    } else {
      console.log('Sign up error:', errorMessage);
    }
    return false;
  }
}

export async function login(email, password) {
    try {
      const auth = getAuth(firebaseApp); // Use the initialized client app
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      // Signed in
      const user = userCredential.user; // `user` contains the authenticated user's details
      const firestore = getFirestore(firebaseApp); // Use the initialized Firestore instance
      const userDocRef = doc(firestore, "users", user.uid); // Reference to the user's document
      const userDoc = await getDoc(userDocRef); // Fetch the document
  
      if (userDoc.exists()) {
        return { success: true, username: userDoc.data().username };
      } else {
        console.log("No such user document!");
        return { success: false, message: "User document not found" };
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
  
      if (errorCode === 'auth/wrong-password') {
        console.log('Wrong password.');
      } else if (errorCode === 'auth/user-not-found') {
        console.log('No user found with that email.');
      } else {
        console.log('Sign in error:', errorMessage);
      }
      return { success: false, message: errorMessage };
    }
  }

export async function upload(cardData) {

}