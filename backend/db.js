// Import the functions you need from the SDKs you need
import admin from 'firebase-admin';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";// Import environment variables
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import fs from 'fs';
import path from 'path';
const serviceAccountPath = path.resolve('./wildlife-go-firebase-adminsdk-fbsvc-9f89698fb0.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export async function signup(email, password, username) {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const firestore = getFirestore();
  
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
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      // Signed in
      const user = userCredential.user;
      console.log("Sign in success!");
      return true;
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
      return false;
    }
  }