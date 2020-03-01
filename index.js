const Spotify = require('./spotify');
let express = require('express');
let app = express();
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser')
dotenv.config();
const private_key = process.env.PRIVATE_KEY;
const path = require('path');
const Track = require('./track');

let sessions = [];

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
    res.redirect(new Spotify().getOauth2URL());
});

app.get('/callback', async function (req, res) {
    let room_code = makeid(8);
    let session = new Session(room_code);
    let authorization_code = req.query.code;
    let json = await session.spotify.getTokens(authorization_code);
    let access_token = json['access_token'];
    let refresh_token = json['refresh_token'];
    var token = jwt.sign({ access_token: access_token, refresh_token: refresh_token }, private_key);
    session.spotify.setAccessToken(access_token);
    session.spotify.setRefreshToken(refresh_token);
    res.cookie('jwt', token);
    sessions.push(session);
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

app.get('/tracks-playing', async function (req,res) {
    let room_code = req.query.room_code;
    let session = findSession(room_code);
    return session.tracks;
});

app.get('/get-songs', async function (req,res) {
    let room_code = req.query.room_code;
    let query = req.query.query;
    let session = findSession(room_code);
    let tracks = session.findSongs();
    return tracks;
});

app.post('/add-song', async function (req,res) {
    let room_code = req.query.room_code;
    let session = findSession(room_code);
    let title = req.query.title;
    let authors = req.query.authors;
    let uri = req.query.uri;
    let track = new Track(title, authors, uri);
    session.TRACKS.add(track);
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

function findSession(room_code) {
    for (let session in sessions) {
        if (session.room_code == room_code) return session;
    }
    return null;
}