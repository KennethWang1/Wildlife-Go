import { signup, login, upload } from './db.js';
import multer from "multer";
import express from 'express';
import http from 'http';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;
const uploader = multer({ storage: multer.memoryStorage() }); // Use memory storage for multer

app.use(cors({
    origin: ['http://localhost:8080', 'https://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/v1/signup', (req, res) => {
    const { email, password, username } = req.body;
    signup(email, password, username);
    res.status(200).json({ message: 'User created successfully' });
});

app.get('/api/v1/login', async (req, res) => {
    const { email, password } = req.body;
    const response = await login(email, password);
    if(response.success == true) {
        res.status(200).json({ message: 'Login Sucessful', username: response.username });
    }else{
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/api/v1/uploadCard', uploader.single('image'), async (req, res) => {
    const file = req.file;
    const username = req.body.username; // Replace with actual user ID logic

    if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await upload(file, userId);
    if (result.success) {
        res.status(200).json({ success: true, downloadURL: result.downloadURL });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
});


app.get('/api/v1/test', (req, res) => {
    res.status(200).json({ message: 'Hello World' });
    console.log(process.env.GEMINI_API_KEY)
})

app.get('/api/v1/gemini_prompt', async (req, res) => {
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const model = "gemini-1.5-pro"

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
