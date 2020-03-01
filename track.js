module.exports = class Track {
    constructor(title, authors, uri) {
        this.TITLE = title;
        this.AUTHORS = authors;
        this.URI = uri;
        this.QUEUED = false;
    }
}