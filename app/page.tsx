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
      name: 'chainjump',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#f7f7f7',
    },
  },
  supports_mini_app: true,
  mini_app: {
    name: 'ArbJump',
    icon: `${APP_URL}/images/icon.png`,
    description: 'ArbJump is the next billion game',
    url: APP_URL,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'chainjump',
    openGraph: {
      title: 'chainjump',
      description: 'chain jump is next billion game',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  }
}

export default function Home() {
  return <App />
}
