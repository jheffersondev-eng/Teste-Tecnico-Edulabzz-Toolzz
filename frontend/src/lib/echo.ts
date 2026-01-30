import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any> | null;
  }
}

let echoInstance: Echo<any> | null = null;

if (typeof window !== 'undefined') {
  try {
    window.Pusher = Pusher;

    const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

    if (isProd) {
      // Configuração para produção (Vercel)
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: 'chat-app-key',
        cluster: 'mt1',
        forceTLS: true,
      });
    } else {
      // Configuração para localhost
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: 'chat-app-key',
        wsHost: 'localhost',
        wsPort: 6001,
        forceTLS: false,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        cluster: 'mt1',
        authEndpoint: 'http://localhost/broadcasting/auth',
        auth: {
          headers: {
            Authorization: typeof localStorage !== 'undefined' ? `Bearer ${localStorage.getItem('auth_token')}` : '',
            Accept: 'application/json',
          },
        },
      });
    }

    window.Echo = echoInstance;
    console.log('✅ Echo initialized successfully');
  } catch (error) {
    console.error('❌ Echo initialization failed:', error);
    echoInstance = null;
    if (typeof window !== 'undefined') {
      window.Echo = null;
    }
  }
}

export default echoInstance;
