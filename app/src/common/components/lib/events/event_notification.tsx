import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

export default function EventNotification() {
  useEffect(() => {
    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      
      if (!pusherKey) {
        console.error('Pusher key is not configured');
        return;
      }

      window.Pusher = Pusher;
      window.Echo = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST,
        wsPort: parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || '6001'),
        forceTLS: false,
        disableStats: true,
        enabledTransports: ['ws']
      });

      const channel = window.Echo.channel('events');
      
      channel.listen('.event.created', (e: any) => {
        toast.info(`New event "${e.event.title}" was created`);
      });

      return () => {
        if (window.Echo) {
          window.Echo.leaveChannel('events');
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, []);

  return null;
}
