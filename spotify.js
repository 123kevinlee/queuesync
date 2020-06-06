const dotenv = require('dotenv');
dotenv.config();
const rp = require('request-promise');

module.exports = class Spotify {
    constructor() {
        this.CLIENT_ID = process.env.CLIENT_ID;
        this.CLIENT_SECRET = process.env.CLIENT_SECRET;
        let buff = new Buffer(this.CLIENT_ID + ":" + this.CLIENT_SECRET);
        let base64data = buff.toString('base64');
        this.ENCODED = base64data;
        this.REDIRECT_URI = process.env.REDIRECT_URI;
        this.SCOPES = process.env.SCOPES;
        this.CURRENT_URI = "";
        this.TRACKS = [];
    }

    async authenticate_self() {
        let url = 'https://accounts.spotify.com/api/token';

        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                grant_type: 'client_credentials'
            },
            headers: {
                'Authorization': 'Basic ' + this.ENCODED,
            },
            json: true
        };

        let json = await rp.post(authOptions).catch(e => console.log(e));
        //let json = JSON.parse(jsonU);
        //console.log(json);
        this.setAccessToken(json.access_token);
        return json;
    }

    setAccessToken(access_token) {
        this.ACCESS_TOKEN = access_token;
    }

    setRefreshToken(refresh_token) {
        this.REFRESH_TOKEN = refresh_token;
    }

    async refreshToken() {
        let refresh_token = this.REFRESH_TOKEN;
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                refresh_token: refresh_token,
                grant_type: 'refresh_token'
            },
            headers: {
                'Authorization': 'Basic ' + this.ENCODED,
            },
            json: true
        };
        try {
            let json = await rp.post(authOptions);
            return json;
        } catch (e) {
            console.log(e);
        }
    }

    getOauth2URL() {
        let url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${this.CLIENT_ID}&scope=${encodeURIComponent(this.SCOPES)}&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}`;
        return url;
    }

    getMobileOauth2URL() {
        let url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${this.CLIENT_ID}&scope=${encodeURIComponent(this.SCOPES)}&redirect_uri=${encodeURIComponent(this.MOBILE_REDIRECT_URI)}`;
        return url;
    }

    getAuthorizationURL(authorization_code) {
        let url = ``;
        return url;
    }

    async getTokens(authorization_code) {
        let url = 'https://accounts.spotify.com/api/token';

        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: authorization_code,
                redirect_uri: this.REDIRECT_URI,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + this.ENCODED,
            },
            json: true
        };

        let json = await rp.post(authOptions).catch(e => console.log(e));
        //let json = JSON.parse(jsonU);
        console.log(json);
        return json;
    }

    async findSongs(queryString) {
        let json = await this.query('search',
            `q=${queryString}&type=track`,
        );
        if (json) {
            return json.tracks.items;
        } else
            return null;
    }

    async query(path, form) {
        let url = 'https://api.spotify.com/v1/' + path + "?" + form;
        var options = {
            url: url,
            headers: { 'Authorization': 'Bearer ' + this.ACCESS_TOKEN },
            json: true
        };

        try {
            let json = await rp.get(options);
            return json;
        } catch (e) {
            console.log(e);
            if (e.statusCode == 401) {
                await this.authenticate_self();
                return this.query(path, form)
            }
            return null;
        }
    }

    async changeSong(song_uri) {
        let url = 'https://api.spotify.com/v1/me/player/play';
        let uri = song_uri.URI;
        var options = {
            url: url,
            headers: { 'Authorization': 'Bearer ' + this.ACCESS_TOKEN },
            json: true,
            json: {
                uris: [uri]
            }
        };

        try {
            let json = await rp.put(options);
            if (json) return json;
            return null;
        } catch (e) {
            console.log(e);
            if (e.statusCode == 401) {
                await this.refreshToken();
                return this.changeSong(song_uri);
            }
            return null;
        }
    }

    async queueSong(song_uri) {
        let uri = song_uri.URI;
        let url = 'https://api.spotify.com/v1/me/player/add-to-queue?uri=' + uri;
        var options = {
            url: url,
            headers: { 'Authorization': 'Bearer ' + this.ACCESS_TOKEN },
            json: true,
        };

        try {
            let json = await rp.post(options);
            if (json) return json;
            return null;
        } catch (e) {
            console.log(e);
            if (e.statusCode == 401) {
                await this.refreshToken();
                return this.queueSong(song_uri);
            }
            return null;
        }
    }

    async resume() {
        let url = 'https://api.spotify.com/v1/me/player/play';
        var options = {
            url: url,
            headers: { 'Authorization': 'Bearer ' + this.ACCESS_TOKEN },
            json: true,
        };

        try {
            let json = await rp.put(options);
            if (json) return json;
            return null;
        } catch (e) {
            console.log(e);
            if (e.statusCode == 401) {
                await this.refreshToken();
                return this.resume();
            }
            return null;
        }
    }

    async pause() {
        let url = 'https://api.spotify.com/v1/me/player/pause';
        var options = {
            url: url,
            headers: { 'Authorization': 'Bearer ' + this.ACCESS_TOKEN },
            json: true,
            json: {
                uris: [song_uri]
            }
        };

        try {
            let json = await rp.put(options);
            if (json) return json;
            return null;
        } catch (e) {
            console.log(e);
            if (e.statusCode == 401) {
                await this.refreshToken();
                return this.pause();
            }
            return null;
        }
    }

    async checkToChange() {
        if (this.ACCESS_TOKEN && this.REFRESH_TOKEN) {
            let url = 'https://api.spotify.com/v1/me/player?market=ES';
            var options = {
                url: url,
                headers: { 'Authorization': 'Bearer ' + this.ACCESS_TOKEN },
                json: true,
            };

            try {
                let json = await rp.get(options);
                let help = await rp.get('https://api.spotify.com/v1/me/player?market=ES', {
                    headers: { 'Authorization': 'Bearer ' + this.ACCESS_TOKEN },
                    json: true,
                });
                if (json.item) {
                    let uri = json.item.uri;
                    if (uri != this.CURRENT_URI) {
                        if (this.TRACKS.length > 0) {
                            if (this.CURRENT_URI != "") {
                                this.TRACKS.shift();
                                this.CURRENT_URI = uri;
                                this.TRACKS[1].QUEUED = true;
                                if (this.TRACKS.length >1) {
                                let track = this.TRACKS[1];
                                await this.queueSong(track.URI);
                                }
                            } else {
                                await this.queueSong(this.TRACKS[0]);
                                this.TRACKS.shift();
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(e);
                if (e.statusCode == 401) {
                    await this.refreshToken();
                }
                return null;
            }
        }
    }
}