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
            let jsonU = await rp.post(authOptions);
            let json = JSON.parse(jsonU);
            return json;
        } catch (e) {
            console.log(e);
        }
    }

    getOauth2URL() {
        let url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${this.CLIENT_ID}&scope=${encodeURIComponent(this.SCOPES)}&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}`;
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
        let url = 'https://api.spotify.com/v1/' + path+"?"+form;
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
                await this.refreshToken();
                return this.query(path, form)
            }
            return null;
        }
    }
}