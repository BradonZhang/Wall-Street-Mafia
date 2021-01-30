import * as functions from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const getUser = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});

  const admin = require("firebase-admin");
  admin.initializeApp();

  const query = admin
      .firestore()
      .collection("users")
      .where("firstName", "==", "Bradon");
  query.get().then(() => {
    response.send("found that user");
  });
});
