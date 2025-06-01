import { useOutletContext } from "react-router";
import type { AuthContextType } from "../../types/auth.types";
import { useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "../../config/firebase.config";
import DataStream from "./DataStream";
export default function Dashboard() {
  const { userData, getIdToken } = useOutletContext<AuthContextType>();
  const messagingEnabled = userData?.trader.is_messaging_enabled || false;
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const handleEnableNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission not granted");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        setFcmToken(token);
        console.log("✅ FCM Token:", token);

        // Optionally send it to your backend:
        // await fetch('/api/trader/notification-token', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ token }),
        // });
      } else {
        console.warn("❌ No token retrieved");
      }
    } catch (error) {
      console.error("FCM error", error);
    }
  };
  return (
    <div className="text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Welcome, {userData?.trader.name || "Trader"}!
          </h1>
          {!messagingEnabled && (
            <button
              onClick={handleEnableNotifications}
              type="button"
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Enable Messaging
            </button>
          )}
          <DataStream getIdToken={getIdToken} />
        </div>
      </div>
    </div>
  );
}
