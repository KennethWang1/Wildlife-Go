import { signup, login, upload } from './db.js';
import multer from "multer";
import express from 'express';
import http from 'http';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

import {GoogleGenAI, createUserContent} from '@google/genai'

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:8080', 'https://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb', extended: true, parameterLimit: 10000000 }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 10000000 }));

app.post('/api/v1/signup', async (req, res) => {
    const { email, password, username } = req.body;
    let hi = await signup(email, password, username);
    console.log(hi)
    if (hi) {
        res.status(200).json({ message: 'User created successfully' });
    } else {
        res.status(401).json({ message: "No user for you nuh uh", "error": "error :("})
    }
});

app.post('/api/v1/login', async (req, res) => {
    const { email, password } = req.body;
    const response = await login(email, password);
    if(response.success == true) {
        res.status(200).json({ message: 'Login Sucessful', username: response.username });
    }else{
        res.status(401).json({ message: 'Invalid credentials', error: "adsdasdads" });
    }
});

app.post('/api/v1/uploadCard', async (req, res) => {
    const file = req.body.image; // Use req.file for multer
    const username = req.body.username; // Replace with actual user ID logic

    if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await upload(file, username);
    if (result) {
        res.status(200).json({ success: true, downloadURL: result.downloadURL });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
});


app.post('/api/v1/test', (req, res) => {
    res.status(200).json({ 'name': 'baguette', "health": 1, "attack": 1, "agility": 1, "critical_chance": 1, "critical_damage": 1, "defense": 1, "rarity": "legendary"});
})

app.get('/api/v1/gemini_prompt', async (req, res) => {
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const model = "gemini-2.0-flash"

    const prompt = "You are a meticulous and avid wildlife expert that also loves to play games such as pokemon. Your job to help classify the animal within the picture as well as providing some stats and rarity for the animal to be used within a game similar to pokemon that has a battling system. For the animal classification, respond with the animal in singular conjugation and all in lower case. In addition, the name of the animal should be the common name of the animal such that a naive person could be satifised (E.g squirrel instead of north american red squirrel). Should there be multiple animals in the picutre, classify only the most prominent animal. There are five different types of rarity, common, uncommon, rare, super rare and legendary. There are also 6 stats, health for health (Base of 500 but do not include the 500 in your output), attack for damage (Base of 50 but do not include the 50 in your output), agility for dodge chance (Base 0 capped at 100), critical chance for critical chance (Base of 0 and capped at 100 points representing 100% chance of critical hit), critical damage for critical damage (Will increase the amount of damage by a percentage capped at 300 points representing 400% increase of damage) and defense for defense (Base 0 and will reduce a flat amount of attack coming in). First choose a rarity for how rare the animal based on how hard it would be for someone in the city to go outside and find this animal. Based on the rarity, pick a random number between plus minus 25 of the amount points that can be allocated to the stats in total based on the rarity. Common is 100 total, uncommon is 200 total, rare is 300 total, super rare is 400 total and legendary is 500 total. Then assign those points to the different stats such that it best represents the animal. Make sure that all the stats add up the the random number that you have choosen beforehand. Please respond in the following format of an object:\n\n{\n\t\"animal\": \"name of animal (string)\",\n\t\"health\": an integer,\n\t\"attack\": an integer,\n\t\"agility\": an integer,\n\t\"critical_chance\": an integer,\n\t\"critical_damage\":an integer,\n\t\"defense\": an integer, \n\t\"rarity\": \"rarity (string)\"}\n\nDo not output anything else. Also output the random number that you have choosen for the total points as an integer at the top of the response. Bit random with each stat such that each time it differes slightly. If there is no animal in the picture, respond with an object with the animal as none" 

    const file = await ai.files.upload({
      file: "public/rhino.jpg", // HOW TF ARE WE DOING THIS I HAVE NO CLUE TOUCH LATER
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

    // console.log(text.substring(text.indexOf("{")).replace("```", ""))
    // console.log(prompt)

    parsedResponse = JSON.parse(text.substring(text.indexOf("{")).replace("```", ""))

    if (parsedResponse.animal == "none") {
        return res.status(400).json({ "error": "No animal found in the picture" })
    }
    
    res.status(200).json({ animal_data: parsedResponse })
})
    
app.use((req, res) => {
    res.status(404).send('Not Found');
});

http.createServer(app).listen(port, () => {
    console.log(`HTTP server up and running on port ${port}`);
});
