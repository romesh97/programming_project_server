// src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp();
//import Handlers

// var serviceAccount = require("../src/config/service_key.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// setup cors for XML issue
