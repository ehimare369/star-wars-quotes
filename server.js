const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;
require("dotenv").config();

// Connecting to MongoDB
// const MongoClient = require("mongodb").MongoClient;
const { MongoClient } = require("mongodb");

//  Connection URL
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyffy.mongodb.net/star-wars?retryWrites=true&w=majority`;

const client = new MongoClient(url, { useUnifiedTopology: true });

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    console.log("Connected correctly to database");
    // Declaring the name of the database
    const db = client.db("star-wars-quotes");

    // Declaring the collection 'quotes'
    const quotesCollection = db.collection("quotes");

    // Setting the view engine to ejs which must be placed before app.use, app.get, app.post, app.listen methods.
    app.set("view engine", "ejs");
    // Make sure you place body-parser before your CRUD handlers!
    // Parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    // Telling express to use public folder
    app.use(express.static("public"));

    // Parse for server to accept json data
    app.use(bodyParser.json());

    // All your handlers here...which will be moved to MongodbClient
    app.get("/", (req, res) => {
      db.collection("quotes")
        .find()
        .toArray()
        .then((results) => {
          // Rendering the ejs view and passing the quotes
          res.render("index", { quotes: results });
        })
        .catch((error) => console.error(error));
    });

    app.post("/quotes", (req, res) => {
      // Adding documents to a collection using insertOne() method.
      quotesCollection
        .insertOne(req.body)
        .then((result) => {
          res.redirect("/");
        })
        .catch((error) => console.error(error));
    });

    app.put("/quotes", (req, res) => {
      quotesCollection
        .findOneAndUpdate(
          { name: "Yoda" },
          {
            $set: {
              name: req.body.name,
              quote: req.body.quote,
            },
          },
          {
            upsert: true,
          }
        )
        .then((result) => {
          res.json("Success");
        })
        .catch((error) => console.error(error));
    });

    app.delete("/quotes", (req, res) => {
      quotesCollection
        .deleteOne({ name: req.body.name })
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.json("No quote to delete");
          }
          res.json(`Deleted Darth Vardar's quotes`);
        })
        .catch((error) => console.error(error));
    });
    // Server and PORT connection
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });

    //
  } catch (err) {
    console.log(err.stack);
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
