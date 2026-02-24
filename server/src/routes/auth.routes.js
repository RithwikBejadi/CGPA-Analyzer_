import express from "express";
import passport from "passport";
import crypto from "crypto";
import {
  createUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";
const authRouter = express.Router();

// Short-lived one-time codes for OAuth token exchange
// This avoids setting cookies during cross-site redirects (blocked by Chrome)
const oauthCodes = new Map(); // code -> { payload, expiresAt }

const OAUTH_CODE_TTL_MS = 60 * 1000; // 1 minute

// Clean up expired codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [code, value] of oauthCodes) {
    if (value.expiresAt < now) oauthCodes.delete(code);
  }
}, 30 * 1000);

authRouter.post("/exchange-code", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required" });

  const entry = oauthCodes.get(code);
  if (!entry || entry.expiresAt < Date.now()) {
    oauthCodes.delete(code);
    return res.status(401).json({ error: "Invalid or expired code" });
  }

  oauthCodes.delete(code); // one-time use

  const { generateToken } = await import("../utils/generateToken.js");
  generateToken(res, entry.payload);
  return res.status(200).json({ ok: true });
});

authRouter.post("/register", createUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);

authRouter.get("/google", (req, res, next) => {
  try {
    const strat =
      passport &&
      typeof passport._strategy === "function" &&
      passport._strategy("google");
    if (!strat)
      return res
        .status(501)
        .json({ error: "Google OAuth not configured on server" });
    return passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      state: false,
    })(req, res, next);
  } catch (err) {
    console.error("Error starting Google auth flow", err);
    return res.status(500).json({ error: "Unable to start Google OAuth" });
  }
});

authRouter.get(
  "/google/callback",
  (req, res, next) => {
    try {
      const strat =
        passport &&
        typeof passport._strategy === "function" &&
        passport._strategy("google");
      if (!strat)
        return res.redirect(
          process.env.CLIENT_URL || "https://cgpa-analyzer.vercel.app"
        );
      return passport.authenticate("google", {
        session: false,
        state: false,
        failureRedirect:
          process.env.CLIENT_URL || "https://cgpa-analyzer.vercel.app",
      })(req, res, next);
    } catch (err) {
      console.error("Error handling Google callback", err);
      return res.redirect(
        process.env.CLIENT_URL || "https://cgpa-analyzer.vercel.app"
      );
    }
  },
  async (req, res) => {
    try {
      const payload = req.user || {};
      // Generate a short-lived one-time code instead of setting cookie directly.
      // Cookies set during cross-site redirects (OAuth flow) are blocked by Chrome.
      // The client will exchange this code for a cookie via a direct fetch().
      const code = crypto.randomBytes(32).toString("hex");
      oauthCodes.set(code, { payload, expiresAt: Date.now() + OAUTH_CODE_TTL_MS });

      const clientUrl = process.env.CLIENT_URL || "https://cgpa-analyzer.vercel.app";
      return res.redirect(`${clientUrl}/auth/callback?code=${code}`);
    } catch (err) {
      console.error("OAuth callback error", err);
      return res.redirect(
        process.env.CLIENT_URL || "https://cgpa-analyzer.vercel.app"
      );
    }
  }
);

export default authRouter;
