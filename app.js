'use strict';
const path = require('path');
const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/app/index.html'));
});
app.get('/js/main.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/app/js/main.js'));
});
app.get('/css/main.css', (req, res) => {
    res.sendFile(path.join(__dirname + '/app/css/main.css'));
});

app.listen(port, (err) => {
    if (err) return console.error('Error: ' + err);
    
    console.log('Server now listening on port ' + port);
});