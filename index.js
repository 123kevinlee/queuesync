const Spotify = require('./spotify');
let app = require('express')();
var jwt = require('jsonwebtoken');
let spotify = new Spotify();
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser')
dotenv.config();
const private_key = process.env.PRIVATE_KEY;

app.use(cookieParser());

app.get('/', function (req, res) {
    console.log('Got here');
});

app.get('/login', async function (req, res) {
    res.redirect(spotify.getOauth2URL());
});

app.get('/callback', async function (req, res) {
    let authorization_code = req.query.code;
    let json = await spotify.getTokens(authorization_code);
    let access_token = json['access_token'];
    let refresh_token = json['refresh_token'];
    var token = jwt.sign({ access_token: access_token, refresh_token: refresh_token }, private_key);
    spotify.setAccessToken(access_token);
    spotify.setRefreshToken(refresh_token);
    res.cookie('jwt', token);
    res.redirect('/dashboard');
});

app.get('/dashboard', async function (req, res) {
    let jwt = req.cookies.jwt;
    let data = decryptJWT(jwt);
    if (req.query.q) {
        let queryString = req.query.q;
        let json = await spotify.findSongs(queryString);
        res.send(json);
    } else
        if (data) {
            res.send(data);
        } else {
            res.redirect('login');
        }
});

function decryptJWT(token) {
    try {
        var decoded = jwt.verify(token, private_key);
        return decoded;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

app.listen(80);
app.listen(443);