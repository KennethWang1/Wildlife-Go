import { signup, login } from './db.js';
import express from 'express';
import http from 'http';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:8080', 'https://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/v1/signup', (req, res) => {
    console.log(req.body);
    const { email, password, username } = req.body;
    signup(email, password, username);
    res.status(200).json({ message: 'User created successfully' });
});

app.get('/api/v1/login', (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    const response = login(email, password);
    if(response){
        res.status(200).json({ message: 'Login Sucessful' });
    }else{
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.use((req, res) => {
    res.status(404).send('Not Found');
});

http.createServer(app).listen(port, () => {
    console.log(`HTTP server up and running on port ${port}`);
});