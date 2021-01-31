package main

import (
	"log"
	"context"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
	"cloud.google.com/go/firestore"
	"os"
	"io/ioutil"
	"fmt"
	"strings"
	"time"
	"math/rand"
	"strconv"
	"encoding/json"
	"net/http"
	"net/url"
	"bytes"
  )

type Order struct {
	IsBid bool
	Symbol string
	Price float64
	Amount int
	Username string
}

func main() {

	stocks := []string{"AMC"}

	// Use a service account
	ctx := context.Background()
	sa := option.WithCredentialsFile("wall-street-mafia-84523ecaff3e.json")
	app, err := firebase.NewApp(ctx, nil, sa)
	if err != nil {
	log.Fatalln(err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalln(err)
	}
	defer client.Close()
	if len(os.Args) > 1 {
		_, err = client.Collection("players").Doc("0").Set(ctx, map[string]interface{}{
			"username": "0",
			"buyingPower": "100000000000",
		})
		_, err = client.Collection("players/bottrader/holdings").Doc("AMC").Set(ctx, map[string]interface{}{
			"shares": 1000000000,
			"symbol": "AMC",
		})
		if err != nil {
				// Handle any errors in an appropriate way, such as returning them.
				log.Printf("An error has occurred: %s", err)
		}
	}

	content, err := ioutil.ReadFile("amc-01-30.txt")
	if err != nil {
		log.Fatal(err)
	}
	priceArray := strings.Split(string(content), "\n")
	// fmt.Printf("%q\n", priceArray)
	for _, p := range priceArray {
		realPrice, err := strconv.ParseFloat(p, 64)
		r := rand.New(rand.NewSource(time.Now().UnixNano()))
		fmt.Println(p)
		for _, s := range stocks {
			stockData, err := client.Collection("stocks").Doc(s).Get(ctx)
			if err != nil {
				log.Printf("couldn't fetch symbol data for " + s)
			}
			currPrice := stockData.Data()["currentPrice"]
			fmt.Println("The current price for " + s + " is ")
			currPriceI, isInt := currPrice.(int)
			var currPriceF float64
			if isInt {
				currPriceF = float64(currPriceI)
			} else {
				currPriceF = currPrice.(float64)
			}
			// fmt.Println(currPriceFloat)
			c := make(chan bool)
			for i := 0; i < 50; i++ {
				priceToTrade := (0.8 * currPriceF) + (0.2 * realPrice) + ((realPrice - currPriceF) * r.NormFloat64() / 10)
				fmt.Println(priceToTrade)
				go placeRandomOrder(ctx, client, priceToTrade, s, i % 2 == 0, c)
			}
			for i := 0; i < 50; i++ {
				_ = <-c
			}
		}
		if err != nil {
				// Handle any errors in an appropriate way, such as returning them.
				log.Printf("An error has occurred: %s", err)
		}
		time.Sleep(15*time.Second)
	}
}

func placeRandomOrder(ctx context.Context, client *firestore.Client, price float64, stock string, askOrBid bool, c chan bool) {
	// order := map[string]interface{}{
	// 	"price": price,
	// 	"amount": 10,
	// 	"time": time.Now(),
	// }
	// if askOrBid {
	// 	_, _, err := client.Collection("stocks/" + stock + "/asks").Add(ctx, order)
	// 	if err != nil {
	// 		log.Printf("Unable to place random order")
	// 	}
	// } else {
	// 	_, _, err := client.Collection("stocks/" + stock + "/bids").Add(ctx, order)
	// 	if err != nil {
	// 		log.Printf("Unable to place random order")
	// 	}
	// }
	order := Order{askOrBid, stock, price, 10, "0"}
	b, err := json.Marshal(order)
	body := bytes.NewBuffer(b)
	url, err := url.Parse("https://us-central1-wall-street-mafia.cloudfunctions.net/addOrder")
	req := &http.Request {
		Method: "GET",
		URL: url,
		Header: map[string][]string {"Content-Type": { "application/json; charset=UTF-8" },},
		Body: body,
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal("couldn't send request")
	}
	data, _ := ioutil.ReadAll(res.Body)
	res.Body.Close()
	fmt.Printf("%d\n", res.StatusCode)
	c <- true
}