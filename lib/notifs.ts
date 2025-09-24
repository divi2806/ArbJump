import { MiniAppNotificationDetails } from '@farcaster/miniapp-core'

interface NotificationParams {
  fid: number;
  title: string;
  body: string;
  notificationDetails?: MiniAppNotificationDetails;
}

interface NotificationResult {
  state: 'success' | 'error' | 'rate_limit';
  error?: string;
}

export async function sendFrameNotification(
  params: NotificationParams
): Promise<NotificationResult> {
  try {
    // For development, we'll just log the notification
    console.log(`Sending notification to FID ${params.fid}:`, {
      title: params.title,
      body: params.body,
      notificationDetails: params.notificationDetails,
    });

    // In production, you would use the Farcaster notification API
    // https://docs.farcaster.xyz/reference/notifications/send-notification

    // Example production implementation:
    /*
    const response = await fetch('https://api.farcaster.xyz/v2/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FARCASTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_fid: params.fid,
        title: params.title,
        body: params.body,
        target_url: params.notificationDetails?.url || process.env.APP_URL,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { state: 'rate_limit' };
      }
      return {
        state: 'error',
        error: `HTTP ${response.status}: ${await response.text()}`
      };
    }
    */

    return { state: 'success' };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      state: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendGameNotification(
  fid: number,
  gameEvent: 'score' | 'achievement' | 'challenge',
  details: { score?: number; achievement?: string; challenger?: string }
): Promise<NotificationResult> {
  let title: string;
  let body: string;

  switch (gameEvent) {
    case 'score':
      title = '🎯 New High Score!';
      body = `You scored ${details.score} points in ArbJump!`;
      break;
    case 'achievement':
      title = '🏆 Achievement Unlocked!';
      body = `You earned: ${details.achievement}`;
      break;
    case 'challenge':
      title = '⚡ Challenge Received!';
      body = `${details.challenger} challenged you to beat their score!`;
      break;
    default:
      title = '🎮 ArbJump Update';
      body = 'Something exciting happened in your game!';
  }

  return sendFrameNotification({ fid, title, body });
}
