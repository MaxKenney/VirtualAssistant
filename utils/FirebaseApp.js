var firebase = require("firebase-admin");

module.exports = class FirebaseApp {


    constructor(serviceAccount, databaseUrl) {
        if (!firebase.apps.length) {
            firebase.initializeApp({
                credential: firebase.credential.cert(serviceAccount),
                databaseURL: databaseUrl
            });
        }

        this.db = firebase.database();
    }

    set(refString, value) {
        var childRef = this.db.ref().child(refString);
        childRef.set(value);
    }

    get(refString) {
        var ref = this.db.ref(refString);
        return ref.once("value");
    }
}