import App from '@/components/pages/app'
import { APP_URL } from '@/lib/constants'
import type { Metadata } from 'next'

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/icon.png`,
  button: {
    title: 'EARN $ARB NOW',
    action: {
      type: 'launch_frame',
      name: 'arbjump',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#f7f7f7',
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ArbJump',
    openGraph: {
      title: 'ArbJump',
      description: 'ArbJump is the next billion game on Arbitrum',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  }
}

export default function Home() {
  return <App />
}
