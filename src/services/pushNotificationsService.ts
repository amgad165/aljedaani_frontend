import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const FCM_TOKEN_STORAGE_KEY = 'fcm_token';
let foregroundListenerReady = false;

function hasFirebaseConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey
  );
}

function getOrCreateFirebaseApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  return initializeApp(firebaseConfig);
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const swUrl = new URL('/firebase-messaging-sw.js', window.location.origin);
  swUrl.searchParams.set('apiKey', firebaseConfig.apiKey || '');
  swUrl.searchParams.set('authDomain', firebaseConfig.authDomain || '');
  swUrl.searchParams.set('projectId', firebaseConfig.projectId || '');
  swUrl.searchParams.set('storageBucket', firebaseConfig.storageBucket || '');
  swUrl.searchParams.set('messagingSenderId', firebaseConfig.messagingSenderId || '');
  swUrl.searchParams.set('appId', firebaseConfig.appId || '');

  return navigator.serviceWorker.register(swUrl.toString());
}

async function saveTokenOnBackend(authToken: string, fcmToken: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/push-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      token: fcmToken,
      platform: 'web',
      device_id: navigator.userAgent,
    }),
  });
}

export async function unregisterPushToken(authToken?: string): Promise<void> {
  const token = authToken || localStorage.getItem('auth_token');
  const fcmToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

  if (!token || !fcmToken) {
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/notifications/push-token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: fcmToken }),
    });
  } catch (error) {
    console.warn('Failed to unregister push token:', error);
  } finally {
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  }
}

export async function initializePushNotifications(authToken?: string): Promise<void> {
  const token = authToken || localStorage.getItem('auth_token');

  if (!token || !hasFirebaseConfig() || typeof window === 'undefined') {
    return;
  }

  const supported = await isSupported();
  if (!supported || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'denied') {
    return;
  }

  const app = getOrCreateFirebaseApp();
  const messaging = getMessaging(app);

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }
  }

  const registration = await registerServiceWorker();

  const currentToken = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!currentToken) {
    return;
  }

  const cachedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  if (cachedToken !== currentToken) {
    await saveTokenOnBackend(token, currentToken);
    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, currentToken);
  }

  if (!foregroundListenerReady) {
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';

      if (Notification.permission === 'granted') {
        const link = payload.data?.link;
        const notification = new Notification(title, { body });

        if (link) {
          notification.onclick = () => {
            window.location.href = link;
          };
        }
      }
    });

    foregroundListenerReady = true;
  }
}
