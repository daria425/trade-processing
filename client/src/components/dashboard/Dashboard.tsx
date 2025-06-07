import { useOutletContext } from "react-router";
import type { AuthContextType, Holding } from "../../types/auth.types";
import { useState } from "react";
import { getToken } from "firebase/messaging";
import { apiConfig } from "@/config/api.config";
import { messaging } from "../../config/firebase.config";
import DataStream from "./DataStream";
import HoldingsTable from "./HoldingsTable";
import TradeForm from "./TradeForm";
import axios from "axios";
export default function Dashboard() {
  const { userData, getIdToken } = useOutletContext<AuthContextType>();
  const messagingEnabled = userData?.trader.is_messaging_enabled || false;
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const [notificationUpdateSuccess, setNotificationUpdateSuccess] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: false,
    success: false,
    error: null,
  });
  const [tradeFormData, setTradeFormData] = useState<{
    tradeType: "buy" | "sell";
    cashBalance: number;
    holding: {
      symbol: string;
      quantity: number;
      current_price: number;
      current_value: number;
    };
  } | null>(null);
  console.log("User Data:", userData);

  const handleOpenTradeForm = (
    tradeType: "buy" | "sell",
    cashBalance: number,
    holding: Holding
  ) => {
    setTradeFormData({
      tradeType,
      cashBalance,
      holding: {
        symbol: holding.symbol,
        quantity: holding.quantity,
        current_price: holding.current_price,
        current_value: holding.current_value,
      },
    });
  };
  const handleCloseTradeForm = () => {
    setTradeFormData(null);
  };
  const handleNotificationUpdate = async (fcmToken: string) => {
    try {
      const idToken = await getIdToken();
      const response = await apiConfig.put(
        "/api/trader/notification-token",
        {
          notification_token: fcmToken,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (response.status === 200) {
        setNotificationUpdateSuccess({
          loading: false,
          success: true,
          error: null,
        });
        console.log("Notification token updated successfully");
      } else {
        console.error("Failed to update notification token");
        setNotificationUpdateSuccess({
          loading: false,
          success: false,
          error: "Failed to update notification token",
        });
      }
    } catch (error) {
      console.error("Error updating notification token:", error);

      // Extract the most meaningful error message from the Axios error
      let errorMessage = "Unknown error occurred";
      if (axios.isAxiosError(error)) {
        // Get response error message if available
        errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Server error";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setNotificationUpdateSuccess({
        loading: false,
        success: false,
        error: errorMessage,
      });
    }
  };
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
        await handleNotificationUpdate(token);
      } else {
        console.warn("❌ No token retrieved");
      }
    } catch (error) {
      console.error("FCM error", error);
    }
  };

  const handleSubmitTrade = async (tradeData: {
    quantity: number;
    symbol: string;
    price: number;
  }) => {
    if (!tradeData) return;

    const { tradeType } = tradeFormData!;
    const idToken = await getIdToken();

    try {
      const response = await apiConfig.post(
        `/api/trades/send`,
        {
          ticker: tradeData.symbol,
          quantity: tradeData.quantity,
          price: tradeData.price,
          trade_type: tradeType,
        },
        /*
            ticker: str
    quantity: int
    price: int  # Price can be float or int
    trade_type: Literal["buy", "sell"]  # "buy" or "sell"
        */
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(`${tradeType} trade successful`, response.data);
        handleCloseTradeForm();
      } else {
        console.error(`${tradeType} trade failed`, response.data);
      }
    } catch (error) {
      console.error(`Error during ${tradeType} trade:`, error);
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
          <HoldingsTable
            cashBalance={userData?.trader.cash_balance || 0}
            holdings={userData?.holdings || []}
            handleOpenTradeForm={handleOpenTradeForm}
          />
          {tradeFormData && (
            <TradeForm
              tradeType={tradeFormData.tradeType}
              cashBalance={tradeFormData.cashBalance}
              holding={tradeFormData.holding}
              handleCloseTradeForm={handleCloseTradeForm}
              handleSubmitTrade={handleSubmitTrade}
            />
          )}
        </div>
      </div>
    </div>
  );
}
