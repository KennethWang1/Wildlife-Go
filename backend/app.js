import { signup, login, upload, getElo, setElo, findUserFight, getUserCards } from './db.js';
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

app.get('/api/v1/getElo', async (req, res) => {
    const { username } = req.body;
    const response = await getElo(username);
    res.status(200).json(response);
});

app.post('/api/v1/setElo', async (req, res) => {
    const { username, elo } = req.body;
    const response = await setElo(username, elo);
    res.status(200).json(response);
});

app.post('/api/v1/findFight', async (req, res) => {
    const { username } = req.body;
    const response = await findUserFight(username);
    res.status(200).json(response);
});

app.get('/api/v1/userCards', async (req, res) => {
    const { username } = req.body;
    const response = await getUserCards(username);
    res.status(200).json(response);
});
    
app.use((req, res) => {
    res.status(404).send('Not Found');
});

http.createServer(app).listen(port, () => {
    console.log(`HTTP server up and running on port ${port}`);
});
