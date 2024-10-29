// src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

//import Handlers
import { registerHandler } from "./handlers/register";

admin.initializeApp();
//import Handlers

// var serviceAccount = require("../src/config/service_key.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// setup cors for XML issue
const corsHandler = cors({ origin: true });

export const addUser = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, () => registerHandler(req, res));
});
