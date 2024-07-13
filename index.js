const express = require('express');
require('dotenv').config()
const { resolve } = require('path');
const keapRoute = require('./keap');
const app = express();
const port = 3010;
const https = require('https');


app.use(express.static('static'));
app.use('/keap', keapRoute);
app.get('/', (req, res) => {
    res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
