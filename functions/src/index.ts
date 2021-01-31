import * as functions from "firebase-functions";
import * as types from "@google-cloud/firestore";
import * as admin from "firebase-admin";
const alpha = require('alphavantage')({ key: 'UV1MSQCUNS0STILQ' });
const cors = require('cors')({origin: true});

const log = ((name: string, something: any) => {functions.logger.info({name: name, object: something}, {structuredData: true});});

admin.initializeApp();
const db = admin.firestore()

export const helloWorld = functions.https.onRequest((request, response) => cors(request, response, () => {
  response.set('Access-Control-Allow-Origin', '*');
  log("body", request.body);

  response.send({ data: "Hello, World!" });
}));

interface Name{
  username: string;
}

export const addPlayer = functions.https.onRequest((request, response) => cors(request, response, async () => {
  response.set('Access-Control-Allow-Origin', '*');
  log("body", request.body);

  const { username } = request.body.data as Name;

  let querySnapshot = await db.collection("players").where("username", "==", username).get();

  // log(`There are ${querySnapshot.size} players named ${username}`,"");
  if(querySnapshot.size > 0){
    response.status(409).send("Username already taken.");
    return;
  }


  querySnapshot = await db.collection("players").where("username", "==", "").get();
  if (querySnapshot.size > 0){
    querySnapshot.docs[0].ref.update("username", username).then(() => {
      // log(`user ${querySnapshot.docs[0].ref.path} got the username ${username}`, "");
      response.send({data:"Successfully created user", id: querySnapshot.docs[0].id});
    });
  }
  else{
    response.status(409).send("No users available.");
  }
}));

const getPlayerByID = async (playerID: number) => {
  return (await db.collection("players").where("id", "==", playerID).limit(1).get()).docs[0];
};

const makeDeal = async (ask: types.DocumentReference, bid: types.DocumentReference) => {
  const oldAskData = (await ask.get()).data()!;
  // log("oldAskData", oldAskData);
  const oldBidData = (await bid.get()).data()!;
  const sharesExchanged = Math.min(oldAskData.amount, oldBidData.amount);

  // get players that made the orders
  // change their shares accordingly
  // edit values of the orders
  // if orders are empty, delete them
  // update stock price
  // update average cost for bidder

  const asker: types.DocumentData = await getPlayerByID(oldAskData.playerID);
  const askerData = asker.data()!;
  const bider: types.DocumentData = await getPlayerByID(oldBidData.playerID);
  const biderData = bider.data()!;

  // log("asker", askerData);
  // log("bider", biderData);

  const costPer = (oldAskData.price + oldBidData.price)/2;
  const cost = sharesExchanged * costPer;
  // log("cost", cost);
  if (biderData.buyingPower < cost) {
    return;
  }

  // log("bidder buying power", biderData);

  bider.ref.update("buyingPower", biderData.buyingPower - cost);
  asker.ref.update("buyingPower", askerData.buyingPower + cost);

  const biderHolding = bider.ref.collection("holdings").doc(oldAskData.symbol);
  const biderHoldingData = (await biderHolding.get()).data();
  biderHolding.update("shares", biderHoldingData.shares + sharesExchanged);
  biderHolding.update("avgCost", (biderHoldingData.avgCost*biderHoldingData.shares + costPer*sharesExchanged)/(biderHoldingData.shares+sharesExchanged));

  const askerHolding = asker.ref.collection("holdings").doc(oldAskData.symbol);
  const askerHoldingData = (await askerHolding.get()).data();
  askerHolding.update("shares", askerHoldingData.shares - sharesExchanged);

  ask.update("amount", oldAskData.amount - sharesExchanged);
  bid.update("amount", oldBidData.amount - sharesExchanged);

  const newAskData = (await ask.get()).data()!;
  const newBidData = (await bid.get()).data()!;

  if (newAskData.amount === 0) {
    await ask.delete();
  }
  if (newBidData.amount === 0) {
    await bid.delete();
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
    }).forEach(async (match) => {
      if (sharesDealt > orderData.amount) {return;}
      sharesDealt += match.data().amount;
      const ask = isBid ? match.ref : newOrder;
      const bid = isBid ? newOrder : match.ref;
      await makeDeal(ask, bid);
    })
  });
};

interface Order{
  isBid: boolean;
  symbol: string;
  price: number;
  amount: number;
  playerID: number;
}

export const addOrder = functions.https.onRequest((request, response) => cors(request, response, () => {
  response.set('Access-Control-Allow-Origin', '*');
  log("body", request.body);

  const { isBid, symbol, price, amount, playerID } = request.body.data as Order;

  db.collection(`stocks/${symbol}/${isBid ? "bids" : "asks"}`)
      .add({price, amount, time: types.Timestamp.now(), playerID, symbol})
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

const setStocks = async () => {
  // const stocks = [ //list of all the stocks we're using
  //   "AMC", "GME", "MSFT"
  // ];

  const stonkData = await alpha.data.intraday("AMC");
  stonkData["Time Series (1min)"][stonkData["Meta Data"]["3. Last Refreshed"]]["4. close"];
};

export const resetGame = functions.https.onRequest((request, response) => cors(request, response, async () => {
  response.set('Access-Control-Allow-Origin', '*');
  log("body", request.body);

  let deletePromises: Array<Promise<any>> = [];

  for (const doc of (await db.collection("players").get()).docs){
    deletePromises.push(doc.ref.delete());
  }
  
  for (const doc of (await db.collection("stocks").get()).docs){
    deletePromises.push(doc.ref.delete());
  }

  Promise.all(deletePromises).then(async () => {
    stockData.forEach((stock: any) => {
      db.doc(`stocks/${stock.symbol}`).set(stock);
    });

    await setStocks();

    for(let i = 0; i < 10; i++){
      const newPlayer = db.doc(`players/${i}`);
      newPlayer.set({
        buyingPower: 1000000,
        totalEquity: 1000000,
        username: "",
        id: i
      });
      newPlayer.collection("holdings");
    }

    response.status(200).send({
      data: "Successfully reset game."
    });
  });
}));