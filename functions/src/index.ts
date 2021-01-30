import * as functions from "firebase-functions";
import * as dataTypes from "@google-cloud/firestore";
import * as admin from "firebase-admin";
const cors = require('cors')({origin: true});

admin.initializeApp();
const db = admin.firestore()

export const helloWorld = functions.https.onRequest((request, response) => cors(request, response, () => {
  response.set('Access-Control-Allow-Origin', '*');
  functions.logger.info(request.body, {structuredData: true});

  response.send({ data: "Hello, World!" });
}));

interface Name{
  firstName: string;
}

export const getUser = functions.https.onRequest((request, response) => cors(request, response, () => {
    response.set('Access-Control-Allow-Origin', '*');
    functions.logger.info(request.body, {structuredData: true});
  
    const { firstName } = request.body.data as Name;
  
    const query = db
        .collection("users")
        .where("firstName", "==", firstName);
    query.get().then((querySnapshot: dataTypes.QuerySnapshot) => {
      const responseStr = `Found ${querySnapshot.size} people with that first name.`;
      response.send({data: responseStr});
    });
}));

export const addPlayer = functions.https.onRequest((request, response) => cors(request, response, () => {
  response.set('Access-Control-Allow-Origin', '*');
  functions.logger.info(request.body, {structuredData: true});

  const { firstName } = request.body.data as Name;

  const nameTakenQuery = db //check if the requested name is already taken
      .collection("players")
      .where("username", "==", firstName);
  nameTakenQuery.get().then((querySnapshot: dataTypes.QuerySnapshot) =>{
    if(querySnapshot.size > 0){
      response.send({data: "That username is already taken."});
    }
  });

  db //add new user
  .collection("players")
  .add({buyingPower: 1000000, totalValue: 1000000, username: firstName})
  .then((documentReference: dataTypes.DocumentReference) => {
    documentReference.collection("stocks");
    functions.logger.info(["Added a new player:", firstName])
  });
  response.status(200).send({
    data: "Successfully added new user"
  });
}));

// interface Order{
//   isBid: boolean;
//   symbol: string;
//   price: number;
// }

// export const addOrder = functions.https.onRequest((request, response) => {
//   response.set('Access-Control-Allow-Origin', '*');
//   functions.logger.info(request.body, {structuredData: true});

//   const {  }

//   debugger.collection
// });