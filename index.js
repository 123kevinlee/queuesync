const Spotify = require('./spotify');
let app = require('express')();
var jwt = require('jsonwebtoken');
let spotify = new Spotify();
const dotenv = require('dotenv');
dotenv.config();

app.get('/', function (req,res) {
    console.log('Got here');
    res.redirect(spotify.getOauth2URL());
});

app.get('/callback', async function (req,res) {
    let authorization_code = req.query.code;
    let json = await spotify.getTokens(authorization_code);
    let access_token = json['access_token'];
    let refresh_token = json['refresh_token'];
    
});

app.listen(80);
app.listen(443);