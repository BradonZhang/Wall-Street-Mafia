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
  username: string;
}

export const addPlayer = functions.https.onRequest((request, response) => cors(request, response, async () => {
  response.set('Access-Control-Allow-Origin', '*');
  functions.logger.info(request.body, {structuredData: true});

  const { username } = request.body.data as Name;

  let querySnapshot = await db.collection("players").where("username", "==", username).get();

  log(`There are ${querySnapshot.size} players named ${username}`);
  if(querySnapshot.size > 0){
    response.status(409).send("Username already taken.");
    return;
  }


  querySnapshot = await db.collection("players").where("username", "==", "").get();
  if (querySnapshot.size > 0){
    querySnapshot.docs[0].ref.update("username", username).then(() => {
      log(`user ${querySnapshot.docs[0].ref.path} got the username ${username}`);
      response.send({data:"Successfully created user", id: querySnapshot.docs[0].id});
    });
  }
  else{
    response.status(409).send("No users available.");
  }
}));

const getPlayer = async (username: string) => {
  return (await db.collection("players").where("username", "==", username).get());
};

const makeDeal = async (ask: types.DocumentReference, bid: types.DocumentReference) => {
  const oldAskData = (await ask.get()).data()!;
  const oldBidData = (await bid.get()).data()!;
  const sharesExchanged = Math.min(oldAskData.amount, oldBidData.amount);

  // get players that made the orders
  // change their shares accordingly
  // edit values of the orders
  // if orders are empty, delete them
  // update stock price
  // update average cost for bidder

  const asker: types.DocumentData = getPlayer(oldAskData.username);
  const bider: types.DocumentData = getPlayer(oldBidData.username);

  const costPer = (oldAskData.price + oldBidData.price)/2;
  const cost = sharesExchanged * costPer;

  if (bider.buyingPower < cost) {
    return;
  }

  bider.ref.update("buyingPower", bider.buyingPower - cost);
  asker.ref.update("buyingPower", asker.buyingPower + cost);

  const biderHolding = bider.ref.collection("holdings").doc(oldAskData.symbol);
  const biderHoldingData = (await biderHolding.get()).data();
  biderHolding.update("shares", biderHoldingData.shares + sharesExchanged);
  biderHolding.update("avgCost", (biderHoldingData.avgCost*biderHoldingData.shares + costPer*sharesExchanged)/(biderHoldingData.shares+sharesExchanged));

  const askerHolding = asker.ref.collection("holdings").doc(oldAskData.symbol);
  const askerHoldingData = (await askerHolding.get()).data();
  askerHolding.update("shares", askerHoldingData.shares - sharesExchanged);

  ask.update("amount", oldAskData.amount - sharesExchanged);
  bid.update("amount", oldBidData.amount + sharesExchanged);

  const newAskData = (await ask.get()).data()!;
  const newBidData = (await bid.get()).data()!;

  if (newAskData.amount === 0) {
    ask.delete();
  }
  if (newBidData.amount === 0) {
    bid.delete();
  }

  db.doc(`stocks/${oldAskData.symbol}`).update("currentPrice", costPer);
};

const findMatches = async (symbol: string, newOrder: types.DocumentReference, isBid: boolean) =>{
  const orderData = (await newOrder.get()).data()!;
  const otherOrders = db.collection(`stocks/${symbol}/${isBid ? "asks" : "bids"}`)
  
  otherOrders.orderBy("time").get().then((querySnapshot: types.QuerySnapshot) => {

    let sharesDealt = 0;
    querySnapshot.docs.filter((doc) => {
      if(isBid){ return doc.data().price <= orderData.price; }
      else{ return doc.data().price >= orderData.price; }
    }).forEach((match) => {
      if (sharesDealt > orderData.amount) {return;}
      sharesDealt += match.data().amount;
      const ask = isBid ? match.ref : newOrder;
      const bid = isBid ? newOrder : match.ref;
      makeDeal(ask, bid);
    })
  });
};

interface Order{
  isBid: boolean;
  symbol: string;
  price: number;
  amount: number;
  username: string;
}

export const addOrder = functions.https.onRequest((request, response) => cors(request, response, () => {
  response.set('Access-Control-Allow-Origin', '*');
  functions.logger.info(request.body, {structuredData: true});

  const { isBid, symbol, price, amount, username } = request.body.data as Order;

  db.collection(`stocks/${symbol}/${isBid ? "bids" : "asks"}`)
      .add({price, amount, time: types.Timestamp.now(), username})
      .then(async (documentReference: types.DocumentReference) => {
        await findMatches(symbol, documentReference, isBid);
        response.status(200).send({
          data: "Successfully added new order."
        });
      });
}));

const stockData = [
  {
      "currentPrice": 13.55,
      "symbol": "AMC"
  },
  {
      "currentPrice": 312.01,
      "symbol": "GME"
  },
  {
      "currentPrice": 123.45,
      "symbol": "MSFT"
  }
];

export const resetGame = functions.https.onRequest((request, response) => cors(request, response, async () => {
  let deletePromises: Array<Promise<any>> = [];

  for (const doc of (await db.collection("players").get()).docs){
    deletePromises.push(doc.ref.delete());
  }
  
  for (const doc of (await db.collection("stocks").get()).docs){
    deletePromises.push(doc.ref.delete());
  }
  
  Promise.all(deletePromises).then(() => {
    stockData.forEach((stock: any) => {
      db.doc(`stocks/${stock.symbol}`).set(stock);
    });

    for(let i = 0; i < 10; i++){
      db.doc(`players/${i}`).set({
        buyingPower: 1000000,
        totalEquity: 1000000,
        username: "",
        id: i
      });
    }

    response.status(200).send({
      data: "Successfully reset game."
    });
  });
}));