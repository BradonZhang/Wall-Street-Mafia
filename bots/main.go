package main

import (
	"log"
	"context"
	firebase "firebase.google.com/go"
	"strconv"
	"google.golang.org/api/option"
  )
func main() {
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
	for i := 0; i < 50; i++ {
		_, err := client.Collection("players").Doc("bot" + strconv.Itoa(i)).Set(ctx, map[string]interface{}{
			"username": "bot" + strconv.Itoa(i),
			"buyingPower": "10000000",
		})
		if err != nil {
				// Handle any errors in an appropriate way, such as returning them.
				log.Printf("An error has occurred: %s", err)
		}
	}
}
