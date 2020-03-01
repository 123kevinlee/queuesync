const Spotify = require('./spotify');
let express = require('express');
let app = express();
var jwt = require('jsonwebtoken');
let spotify = new Spotify();
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser')
dotenv.config();
const private_key = process.env.PRIVATE_KEY;
const path = require('path');
app.use(cookieParser());
app.use(express.static('site/'));
app.use(express.static('site/partials/'));
app.get('/', function (req, res) {
    let room_code = req.query.code;
    if (!room_code)
        res.sendFile(path.join(__dirname + "/site/landing.html"));
    else {
        res.render(path.join(__dirname, "/site/views/add.ejs"), {
            tracks:[],
            code: room_code
        });
    }
});
app.set('view engine', 'ejs');

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

app.get('/add', async function (req,res) {
    let room_code = res.locals.code;
    res.render(path.join(__dirname, "/site/views/add.ejs"), {
        tracks:[],
        code: room_code
    });
});

app.get('/search', async function (req,res) {
    res.render(path.join(__dirname, "/site/views/dashboard.ejs"), {
        tracks: [],
        code: "1234"
    });
});

app.get('/dashboard', async function (req, res) {
    let code = makeid(8);
    let tracks = [];
    res.render(path.join(__dirname, "/site/views/dashboard.ejs"), {
        code: code,
        tracks: tracks
    });
    // let jwt = req.cookies.jwt;
    // let data = decryptJWT(jwt);
    // if (req.query.q) {
    //     let queryString = req.query.q;
    //     let json = await spotify.findSongs(queryString);
    //     res.send(json);
    // } else
    //     if (data) {
    //         res.send(data);
    //     } else {
    //         res.redirect('login');
    //     }
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

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

