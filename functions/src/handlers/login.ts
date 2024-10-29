import * as admin from "firebase-admin";
import { Request, Response } from "express";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth } from "../config/firebase";

export const loginHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { email, password } = req.body;

  // check email and password
  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Email and password are required",
    });
    return;
  }

  try {
    // Sign in user with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const idToken = await user.getIdToken();

    // fetch additional data
    const userDoc = await admin
      .firestore()
      .collection("Users")
      .doc(user.uid)
      .get();

    if (!userDoc.exists) {
      await user.delete(); // Clean up the auth user if no matching admin document
      res.status(403).json({
        success: false,
        error: "Authorization Error",
        message: "Forbidden",
      });
      return;
    }

    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          uid: user.uid,
          email: user.email,
          ...userData,
        },
        token: idToken,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    if (err instanceof Error) {
      const firebaseError = err as AuthError;
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password"
      ) {
        res.status(401).json({
          success: false,
          error: "Authentication Error",
          message: "Invalid email or password",
        });
        return;
      }

      // For other known errors
      res.status(500).json({
        success: false,
        error: "Login Error",
        message: "An error occurred during login",
        details: firebaseError.message,
      });
    } else {
      // For unknown errors
      res.status(500).json({
        success: false,
        error: "Unknown Error",
        message: "An unexpected error occurred",
        details: String(err),
      });
    }
  }
};
