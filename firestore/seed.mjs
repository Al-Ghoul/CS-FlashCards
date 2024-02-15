import { initializeFirebaseApp, restore } from "firestore-export-import";
import confirm from "@inquirer/confirm";
import rawlist from "@inquirer/rawlist";
import * as serviceAccount from "./serviceAccountKey.json" with {
  type: "json",
};

const isDevEnv = await confirm({
  message: "Is this a development environment?",
});
const pickedSeed = await rawlist({
  message: "Select a seed",
  choices: [
    { name: "Languages", value: "languages" },
    { name: "Topics", value: "topics" },
    { name: "Topics Translations", value: "topics_translations" },
  ],
});
const firestore = isDevEnv
  ? initializeFirebaseApp(serviceAccount.default, "[DEFAULT]", {
    firestore: {
      host: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST,
      ssl: false,
    },
  })
  : initializeFirebaseApp(serviceAccount.default);

restore(firestore, `firestore/data/${pickedSeed}.json`);
