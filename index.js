//Definition & imports
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

// Middlewares
require("dotenv").config();
app.use(cors());
app.use(express.json());

// app.use(async (req, res, next) => {
//   console.log(`⚡ ${req.method} - ${req.path} from ${req.host} at ⌛ ${new Date().toLocaleString()}`);
//   next();
// });

//ports & clients
const port = process.env.PORT || 5000;
const uri = process.env.DB;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//listeners
client.connect()
  .then(() => app.listen(port, () => console.log(`Hero Apps Server listening ${port}\nHero Apps Server Connected with DB`)))
  .catch((err) => console.log(err));

//DB & collections
const database = client.db("heroApps");
const appsCollection = database.collection("apps");

//Apps Route

app.get("/apps", async (req, res) => {
  const{limit = 0, skip = 0, sort, search = "" } = req.query
  try {
    const apps = await appsCollection.find({title: { $regex: search, $options: "i" }}).limit(limit).skip(skip).toArray();
    res.send(apps);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/apps/:id", async (req, res) => {
  try {
    const appId = req.params.id;
    if (appId.length != 24) return res.status(400).json({ error: "Invalid ID" });
    const app = await appsCollection.findOne({ _id: new ObjectId(appId) });
    res.json(app);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Basic routes
app.get("/", (req, res) => res.json({ status: "ok", message: "Hero Apps Server" }));
//404
app.all(/.*/, (req, res) => res.status(404).json({ status: 404, error: "API not found", }));