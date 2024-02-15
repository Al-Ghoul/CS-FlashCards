import fs from "node:fs";
import { initializeFirebaseApp } from "firestore-export-import";
import { backups } from "firestore-export-import";
import confirm from "@inquirer/confirm";
import * as serviceAccount from "./serviceAccountKey.json" with {
  type: "json",
};

const isDevEnv = await confirm({
  message: "Is this a development environment?",
});
const firestore = isDevEnv
  ? initializeFirebaseApp(serviceAccount.default, "[DEFAULT]", {
    firestore: {
      host: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST,
      ssl: false,
    },
  })
  : initializeFirebaseApp(serviceAccount.default);

let file;
backups(firestore)
  .then((collections) => {
    try {
      file = fs.openSync("firestore/BackedData.json", "w");
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
