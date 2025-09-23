import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
  "frame": {
    "name": "ArbJump",
    "version": "1",
    "iconUrl": "https://arb-jump.vercel.app/icon.png",
    "homeUrl": "https://arb-jump.vercel.app",
    "imageUrl": "https://arb-jump.vercel.app/image.png",
    "splashImageUrl": "https://arb-jump.vercel.app/splash.png",
    "splashBackgroundColor": "#ffffff",
    "webhookUrl": "https://arb-jump.vercel.app/api/webhook",
    "subtitle": "jump to earn on arbitrum",
    "description": "Collect Coins and powerups and jump only in arbitrum. A fun jump to earn game on aribitrum",
    "primaryCategory": "games",
    "tags": [
      "arbitrum",
      "recess",
      "games",
      "chaincrush",
      "wagmi"
    ],
    "tagline": "Gotta win it all"
  },
  "accountAssociation": {
    "header": "eyJmaWQiOjExNDI1MzksInR5cGUiOiJhdXRoIiwia2V5IjoiMHgyODUyMTE3NzI2ODcyNTY0YThiZDk3M2E5OTIzOGEzOTdiMjgzMUJmIn0",
    "payload": "eyJkb21haW4iOiJhcmItanVtcC52ZXJjZWwuYXBwIn0",
    "signature": "V47ddNLSU78Sg6s2xi7QWoQfuVwQTJVZTc7X0vsJwYkN7gjKVC2VNktfhvCF6eufySGZ0Y/pJ8JFX3vqkFPWYhs="
  }
};

  return NextResponse.json(farcasterConfig);
}
