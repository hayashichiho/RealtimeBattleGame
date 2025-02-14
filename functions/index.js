const functions = require('firebase-functions');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, '../public')));

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/gameBase/index.html'));
});

app.get('/gameBase/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/gameBase', req.params.filename));
});

exports.app = functions.https.onRequest(app);
