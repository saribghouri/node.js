import cors from "cors";

const app = express();
app.use(cors());

app.get("/home", (req, res) => {
  res.send("I am home page!");
});

app.get("/profile", (req, res) => {
  res.send("I am profile page!");
});
app.get("/weather", (req, res) => {
  res.send({
    weather: "sunny",
    temperature: "20",
    city: "London",
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

let dbURI =
  "mongodb+srv://sarib-ghouri92:445500@cluster0.nmgizsx.mongodb.net/seviceDataBase?retryWrites=true&w=majority";

mongoose.connect(dbURI);

mongoose.connection.on("connected", function () {
  console.log("Mongoose is connected");
});
mongoose.connection.on("disconnected", function () {
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  console.log("Mongoose connection error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});

require("./model/post");

const app = express();
app.use(express.json());
app.use(cors());

const post = mongoose.model("post");

app.get("/posts", async(req, res));

const port = process.env.PORT || 3000;

let userBase = []; // TODO: replace this with mongoDB

app.post("/signup", (req, res) => {
  let body = req.body;

  if (!body.firstName || !body.lastName || !body.email || !body.password) {
    res.status(400).send(
      `required fields missing, request example: 
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
    );
    return;
  }

  let isFound = false;

  for (let i = 0; i < userBase.length; i++) {
    if (userBase[i].email === body.email.toLowerCase()) {
      isFound = true;
      break;
    }
  }
  if (isFound) {
    // this email already exist
    res.status(400).send({
      message: `email ${body.email} already exist.`,
    });
    return;
  }

  let newUser = {
    userId: nanoid(),
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email.toLowerCase(),
    password: body.password,
  };

  userBase.push(newUser);

  res.status(201).send({ message: "user is created" });
});

app.post("/login", (req, res) => {
  let body = req.body;

  if (!body.email || !body.password) {
    res.status(400).send(
      `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
    );
    return;
  }

  let isFound = false; // https://stackoverflow.com/a/17402180/4378475

  for (let i = 0; i < userBase.length; i++) {
    if (userBase[i].email === body.email) {
      isFound = true;
      if (userBase[i].password === body.password) {
        // correct password

        res.status(200).send({
          firstName: userBase[i].firstName,
          lastName: userBase[i].lastName,
          email: userBase[i].email,
          message: "login successful",
          token: "some unique token",
        });
        return;
      } else {
        // password incorrect

        res.status(401).send({
          message: "incorrect password",
        });
        return;
      }
    }
  }

  if (!isFound) {
    res.status(404).send({
      message: "user not found",
    });
    return;
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
