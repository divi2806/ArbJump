import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
  "frame": {
    "name": "ArbJump",
    "version": "1",
    "iconUrl": "https://arb-jump-67zv.vercel.app/icon.png",
    "homeUrl": "https://arb-jump-67zv.vercel.app",
    "imageUrl": "https://arb-jump-67zv.vercel.app/image.png",
    "splashImageUrl": "https://arb-jump-67zv.vercel.app/splash.png",
    "splashBackgroundColor": "#ffffff",
    "webhookUrl": "https://arb-jump-67zv.vercel.app/api/webhook",
    "subtitle": "Collect Coins and powerups and jump only in arbitrum",
    "description": "Collect Coins and powerups and jump only in arbitrum. A fun jump to earn game on aribitrum ",
    "primaryCategory": "games",
    "tags": [
      "arbitrum",
      "chainjump",
      "games",
      "farcaster",
      "chaincrush"
    ],
    "tagline": "Gotta earn it all"
  },
  "accountAssociation": {
    "header": "eyJmaWQiOjExNDI1MzksInR5cGUiOiJhdXRoIiwia2V5IjoiMHgyODUyMTE3NzI2ODcyNTY0YThiZDk3M2E5OTIzOGEzOTdiMjgzMUJmIn0",
    "payload": "eyJkb21haW4iOiJodHRwczovL2FyYi1qdW1wLTY3enYudmVyY2VsLmFwcCJ9",
    "signature": "ZVsoaBaw9ZAvAb89s8eGY9+lv3r4F3IZhlOEBJ8fAPNjH94UpWjrPKYN+6mlQao8v+pvHPrbthgYkDz0x25alxw="
  }
};

  return NextResponse.json(farcasterConfig);
}
