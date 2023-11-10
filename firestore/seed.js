const { initializeFirebaseApp, restore } = require('firestore-export-import')
const serviceAccount = require('./serviceAccountKey.json')
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = initializeFirebaseApp(serviceAccount)


restore(firestore, "./Data.json")
