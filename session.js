let Track = require('./track');
let Spotify = require('./spotify');

module.exports = class Session {
    constructor(room_code) {
        this.ROOM_CODE = room_code;
        this.spotify = new Spotify();
    }

    addTrack(title, author, uri) {
        let track = new Track(title, author, uri);
        this.spotify.TRACKS.push(track);
    }
}