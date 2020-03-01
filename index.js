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
const Session = require('./session');
let sessions = [];

app.use(cookieParser());
app.use(express.static('site/'));
app.use(express.static('site/partials/'));
var bodyParser = require('body-parser');
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
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
    res.redirect('/dashboard?room_code='+room_code);
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
    let room_code = req.query.room_code;
    let tracks = [];
    res.render(path.join(__dirname, "/site/views/dashboard.ejs"), {
        code: room_code,
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
    if (!session) res.status(400).send("There is no room with that code!");
    res.send(session.spotify.TRACKS);
});

app.get('/get-songs', async function (req,res) {
    let room_code = req.query.room_code;
    let query = req.query.query;
    let session = findSession(room_code);
    if (!session || session == null)  { res.status(400).send("There is no room with that code!"); return;};
    let tracks = await session.spotify.findSongs(query);
    let parsed_tracks = [];
    for (let i = 0; i < tracks.length; i++) {
        let artists = null;
        artists = tracks[i].artists[0].name;
        for (let j = 0; j < tracks[i].artists.length-1; j++) {
            artists += ', ' + tracks[i].artists[j].name;
        }
        if (tracks[i].artists[1]) artists += ', and ' + tracks[i].artists[tracks[i].artists.length-1].name;
        parsed_tracks.push({
            artists: artists,
            name: tracks[i].name,
            uri: tracks[i].uri,
            row: i+1
        });
    }
    res.send(parsed_tracks);
});

app.get('/add-song', async function (req,res) {
    let room_code = req.query.room_code;
    console.log("Room Code: "+ room_code);
    let session = findSession(room_code);
    if (!session || session == null)  { res.status(400).send("There is no room with that code!"); return;};
    let title = req.query.title;
    let authors = req.query.authors;
    let uri = req.query.uri;
    session.addTrack(title, authors, uri);
    res.status(200).send("Ok!");
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
    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].ROOM_CODE == room_code) return sessions[i];
    }
    return null;
}