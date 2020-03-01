let Track = require('./track');

module.exports = class Session {
    constructor(room_code) {
        this.ROOM_CODE = room_code;
        this.TRACKS = [];
    }

    addTrack(title, author, uri) {
        let track = new Track(title, author, uri);
        this.TRACKS.push(track);
    }
}