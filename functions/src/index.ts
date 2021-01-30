import * as functions from "firebase-functions";
import * as types from "@google-cloud/firestore";
import * as admin from "firebase-admin";
const cors = require('cors')({origin: true});

const log = ((something: any) => {functions.logger.info(something, {structuredData: true});});

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
    query.get().then((querySnapshot: types.QuerySnapshot) => {
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
  nameTakenQuery.get().then((querySnapshot: types.QuerySnapshot) =>{
    if(querySnapshot.size > 0){
      response.send({data: "That username is already taken."});
    }
  });

  db //add new user
  .collection("players")
  .add({buyingPower: 1000000, totalValue: 1000000, username: firstName})
  .then((documentReference: types.DocumentReference) => {
    documentReference.collection("stocks");
    functions.logger.info(["Added a new player:", firstName])
  });
  response.status(200).send({
    data: "Successfully added new user."
  });
}));

const findMatches = async (symbol: string, newOrder: types.DocumentReference, isBid: boolean) =>{
  const orderData = (await newOrder.get()).data()!;
  const otherOrders = db.collection(`stocks/${symbol}/${isBid ? "asks" : "bids"}`)
  
  otherOrders.orderBy("time").where("price", isBid ? "<=" : ">=", orderData.price).get().then((querySnapshot: types.QuerySnapshot) => {
    const match = querySnapshot.docs[0];
    //makeTrade(newOrder, match);
  });
};

interface Order{
  isBid: boolean;
  symbol: string;
  price: number;
  amount: number;
  time: Date;
  username: string;
}

export const addOrder = functions.https.onRequest((request, response) => cors(request, response, () => {
  response.set('Access-Control-Allow-Origin', '*');
  functions.logger.info(request.body, {structuredData: true});

  const { isBid, symbol, price, amount, username } = request.body.data as Order;

  db.collection(`stocks/${symbol}/${isBid ? "bids" : "asks"}`)
      .add({price, amount, time: types.Timestamp.now(), username})
      .then((documentReference: types.DocumentReference) => {
        findMatches(symbol, documentReference, isBid);
      });
  
  response.status(200).send({
    data: "Successfully added new order."
  });
}));