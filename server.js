require("dotenv").config()
const express = require("express")
const app = express()
const fs = require("fs")

const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const PORT = process.env.PORT || 3000

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.static("public"))

const stripe = require("stripe")(stripeSecretKey)

app.get("/", (req, res) => {
  fs.readFile("items.json", (error, data) => {
    error
      ? res.status(500).end()
      : res.render("store.ejs", { items: JSON.parse(data), stripePublicKey })
  })
})

app.post("/purchase", (req, res) => {
  fs.readFile("items.json", (error, data) => {
    if (error) {
      res.status(500).end()
    } else {
      const itemsJson = JSON.parse(data)
      const itemsArray = itemsJson.music.concat(itemsJson.merch)
      let total = 0
      req.body.items.forEach(item => {
        const itemJson = itemsArray.find((i)=> {
          return i.id == item.id
        })
        total= total + itemJson.price * item.quantity
      })
      stripe.charges
        .create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: "usd",
        })
        .then(() => {
          console.log("Charge Successful")
          res.json({ message: "Successfully purchased items" })
        })
        .catch(() => {
          console.log("Charge Fail")
          res.status(500).end()
        })
      
    }
	
  })
  //const {stripeTokenId,items} = req.body
  //console.log(stripeTokenId,items)
})

app.listen(PORT, () => {
  console.log("Server is running...")
})
