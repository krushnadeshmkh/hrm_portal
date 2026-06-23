export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/notification-sw.js');
      console.log('Service Worker registered');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  return null;
}

export async function subscribeToPushNotifications(registration) {
  if (!registration) return null;
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
    });
    
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}