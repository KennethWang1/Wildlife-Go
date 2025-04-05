import admin from 'firebase-admin';
import { initializeApp } from "firebase/app"; // Import the Firebase client SDK
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; // Add getDoc to the importsimport dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import base64Img from 'base64-img'; 
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai';



dotenv.config({ path: './.env' });

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve('./wildlife-go-firebase-adminsdk-fbsvc-9f89698fb0.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Firebase Client SDK
const firebaseConfig = {
  apiKey: process.env.DB_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSEGAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
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

    await setDoc(doc(firestore, "elo", username), {
        elo: 1000,
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

export async function upload(image, username) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    base64Img.imgSync(image, '', 'temp', function(err, filepath) {});

    const model = "gemini-2.0-flash"

    const prompt = "You are a meticulous and avid wildlife expert that also loves to play games such as pokemon. Your job to help classify the animal within the picture as well as providing some stats and rarity for the animal to be used within a game similar to pokemon that has a battling system. For the animal classification, respond with the animal in singular conjugation and all in lower case. In addition, the name of the animal should be the common name of the animal such that a naive person could be satifised (E.g squirrel instead of north american red squirrel). Should there be multiple animals in the picutre, classify only the most prominent animal. There are five different types of rarity, common, uncommon, rare, super rare and legendary. There are also 6 stats, health for health (Base of 500 but do not include the 500 in your output), attack for damage (Base of 50 but do not include the 50 in your output), agility for dodge chance (Base 0 capped at 100), critical chance for critical chance (Base of 0 and capped at 100 points representing 100% chance of critical hit), critical damage for critical damage (Will increase the amount of damage by a percentage capped at 300 points representing 400% increase of damage) and defense for defense (Base 0 and will reduce a flat amount of attack coming in). First choose a rarity for how rare the animal based on how hard it would be for someone in the city to go outside and find this animal. Based on the rarity, pick a random number between plus minus 25 of the amount points that can be allocated to the stats in total based on the rarity. Common is 100 total, uncommon is 200 total, rare is 300 total, super rare is 400 total and legendary is 500 total. Then assign those points to the different stats such that it best represents the animal. Make sure that all the stats add up the the random number that you have choosen beforehand. Please respond in the following format of an object:\n\n{\n\t\"animal\": \"name of animal (string)\",\n\t\"health\": an integer,\n\t\"attack\": an integer,\n\t\"agility\": an integer,\n\t\"critical_chance\": an integer,\n\t\"critical_damage\":an integer,\n\t\"defense\": an integer, \n\t\"rarity\": \"rarity (string)\"}\n\nDo not output anything else. Also output the random number that you have choosen for the total points as an integer at the top of the response. Bit random with each stat such that each time it differes slightly. If there is no animal in the picture, respond with an object with the animal as none" 

    const file = await ai.files.upload({
      file: 'temp.jpg',
      config: { mimeType: "image/jpeg" },
    })

    const response = await ai.models.generateContent({
      model: model,
      contents: createUserContent([
        createPartFromUri(file.uri, file.mimeType),
        "\n\n",
        prompt

      ]),
    })

    let text = response.text
    let parsedResponse = {}

    parsedResponse = JSON.parse(text.substring(text.indexOf("{")).replace("```", ""))

    console.log(parsedResponse)
    parsedResponse.health=Number(parsedResponse.health)+Number(500);
    parsedResponse.attack=Number(parsedResponse.attack)+Number(50);
    

    if (parsedResponse.animal == "none") {
        // return res.status(400).json({ "error": "No animal found in the picture" })
        return false
    }

    const auth = getAuth(); // Use the initialized client app
    const firestore = getFirestore(firebaseApp); // Use the client Firestore instance

    const userDocRef = doc(firestore, "userCards", username); // Reference to the user's document
    const userDoc = await getDoc(userDocRef); // Fetch the document
  
      if (userDoc.exists()) {
        userDoc.data().cards.push({
            image: image,
            animal_data: parsedResponse,
        });
        await updateDoc(doc(firestore, "userCards", username), {
            cards:userDoc.data().cards
        });
      } else {
        await setDoc(doc(firestore, "userCards", username), {
            cards:[
                {
                    image: image,
                    animal_data: parsedResponse,
                }
            ]});
      }

    return parsedResponse;
}

export async function getUserCards(username) {
    const firestore = getFirestore(firebaseApp); // Use the client Firestore instance
    const userDocRef = doc(firestore, "userCards", username); // Reference to the user's document
    const userDoc = await getDoc(userDocRef); // Fetch the document

    if (userDoc.exists()) {
        return userDoc.data();
    } else {
        console.log("No such user document!");
        return null;
    }
}

export async function getElo(username) {
    const firestore = getFirestore(firebaseApp); // Use the client Firestore instance
    const userDocRef = doc(firestore, "elo", username); // Reference to the user's document
    const userDoc = await getDoc(userDocRef); // Fetch the document

    if (userDoc.exists()) {
        return userDoc.data().elo;
    } else {
        console.log("No such user document!");
        return null;
    }
}

export async function setElo(username, elo) {
    const firestore = getFirestore(firebaseApp); // Use the client Firestore instance
    const userDocRef = doc(firestore, "elo", username); // Reference to the user's document
    const userDoc = await getDoc(userDocRef); // Fetch the document

    if (userDoc.exists()) {
        await updateDoc(doc(firestore, "elo", username), {
            elo:elo});
    } else {
        console.log("No such user document!");
        return null;
    }
}

export async function findUserFight(username){
    const firestore = getFirestore(firebaseApp); // Use the client Firestore instance

    try {
        const userCardsCollection = firestore.collection("userCards"); // Reference to the userCards collection
        const snapshot = await userCardsCollection.get(); // Fetch all documents in the collection

        if (snapshot.empty) {
            console.log("No users found in the userCards collection!");
            return null;
        }

        const users = [];
        snapshot.forEach(doc => {
            if (doc.id !== username) { // Exclude the current user
                users.push({ username: doc.id, cards: doc.data().cards });
            }
        });

        if (users.length === 0) {
            console.log("No other users available for a fight!");
            return null;
        }

        const randomUser = users[Math.floor(Math.random() * users.length)]; // Select a random user

        return { username: randomUser.username, card: [randomUser.cards[0], randomUser.cards[1], randomUser.cards[2]] };
    } catch (error) {
        console.error("Error fetching user cards:", error);
        return null;
    }
}