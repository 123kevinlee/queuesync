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
        let options = {
            uri: url,
            header: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: {
                "client_id": this.CLIENT_ID,
                "client_secret": this.CLIENT_SECRET,
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET
            },
            form: {
                grant_type: 'authorization_code',
                code: authorization_code,
                redirect_uri: this.REDIRECT_URI,
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET
            }
        };
        let jsonU = await rp.post(options).catch(e=> console.log(e));
        let json = JSON.parse(jsonU);
        console.log(json);
        return json;
    }
}