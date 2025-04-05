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

app.use((req, res) => {
    res.status(404).send('Not Found');
});

http.createServer(app).listen(port, () => {
    console.log(`HTTP server up and running on port ${port}`);
});