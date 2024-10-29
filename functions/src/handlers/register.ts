import * as admin from "firebase-admin";
import { Request, Response } from "firebase-functions";

export const registerHandler = async (req: Request, res: Response) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { email, password, firstName } = req.body;

  // Check emil and password fields are empty
  if (!email || !password || !firstName) {
    res.status(400).json({
      success: false,
      error: "Missing required fields",
      message: "Email and password are required",
    });
    return;
  }

  try {
    // adding a new user to firestore
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: firstName,
    });
    console.log("User created in Firebase Authentication");

    // Add user details to Users collection
    await admin.firestore().collection("Users").doc(userRecord.uid).set({
      email: email,
      firstName: firstName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("User added to Firestore collection");

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      userId: userRecord.uid,
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({
      success: false,
      error: "Failed to register user",
      details: err instanceof Error ? err.message : String(err),
    });
  }
};
