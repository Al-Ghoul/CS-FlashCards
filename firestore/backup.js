const fs = require('node:fs');
const { initializeFirebaseApp } = require('firestore-export-import')
const { backups } = require('firestore-export-import');
const serviceAccount = require('./serviceAccountKey.json')

const firestore = initializeFirebaseApp(serviceAccount);
let file;
backups(firestore, ["cards"])
  .then((collections) => {
    try {
      file = fs.openSync("Data.json", 'w')
      console.log("Writing backup data.");
      fs.appendFileSync(file, JSON.stringify(collections));
    } catch (err) {
      console.log("Error", err);
    } finally {
      if (undefined != file) {
        fs.closeSync(file);
        console.log("Back up is done successfully");
      }
    }
  });