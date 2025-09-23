import { NextResponse } from "next/server";
import { APP_URL } from "../../../lib/constants";

export async function GET() {
  const farcasterConfig = {
    "frame": {
      "name": "arbjump",
      "version": "1",
      "iconUrl": "https://jumpfinal.vercel.app/images/icon.png",
      "homeUrl": "https://jumpfinal.vercel.app",
      "imageUrl": "https://jumpfinal.vercel.app/images/image.png",
      "splashImageUrl": "https://jumpfinal.vercel.app/images/splash.png",
      "splashBackgroundColor": "#ffffff",
      "webhookUrl": "https://jumpfinal.vercel.app/api/webhook",
      "subtitle": "Jump to collect coins on Arbitrum",
      "description": "ArbJump is the next billion game on Arbitrum",
      "primaryCategory": "games"
    },
    "accountAssociation": {
    "header": "eyJmaWQiOjExMDg1NzQsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhkODUzOTVERWYzZDYzM0U3ODYyOTFiZjlERTU0ZDMyNGVlYkM3OTE3In0",
    "payload": "eyJkb21haW4iOiJqdW1wZmluYWwudmVyY2VsLmFwcCJ9",
    "signature": "1bA7P3VPHAsGMdMnoxf8SLWHhVoohnfN/c1EoYvT7xo8ttSZ099HrC31BaDDsQPQaxp4ASRabDcBi16A9SWOZxs="
  },
   "baseBuilder": {
    "allowedAddresses": ["0x721f07F9E4b5b2D522D0D657cCEebfb64487d8DC"]
  }
  };

  return NextResponse.json(farcasterConfig);
}
