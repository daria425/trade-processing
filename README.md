# Trade Processing

A WIP of a full-stack application for real-time stock trading simulations and portfolio management. The project includes a FastAPI backend and a modern React (Vite) frontend, with integration to Firebase for authentication and messaging, and WebSockets for live market data streaming.

I built this as my take on the [`Build Basic Notifications for Messages challenge`](https://www.backendchallenges.com/challenges/build-basic-notifications-for-messages/challenge) challenge on [Backend Challenges](https://www.backendchallenges.com/) in order to learn more about live data processing, Web Sockets and message queues. Currently paused to pursue other projects but may pick back up!

## Current Features

- **Real-time Market Data:** Live updates of stock prices via WebSocket streams using yfinance package.
- **User Authentication:** Secure sign-up and login with Firebase Auth.
- **Simulated Trading:** Logic for buy and sell orders and tracking trade progress with simulated latency.
- **Push Notifications:** Enable real-time alerts for trade and portfolio events using Firebase Cloud Messaging.
- **Stock Search:** Lookup stocks and get symbol data via API.
- **Responsive UI:** Built with React, Tailwind CSS, and the Recharts library for data visualization.

## Architecture

- **Backend:** Python FastAPI server providing REST endpoints and WebSocket APIs for market data and trade progress. Uses async SQLAlchemy, Firebase, and various Google Cloud libraries.
- **Frontend:** React (with Vite) single-page application. Handles authentication, data visualization, and user interactions.
- **Messaging/Notifications:** Firebase Cloud Messaging for push notifications.
- **Database:** Async SQLAlchemy models for user, trade, and portfolio data.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Firebase Admin SDK, WebSockets, Uvicorn
- **Frontend:** React, Vite, Tailwind CSS, Recharts, Firebase JS SDK
- **Notifications:** Firebase Cloud Messaging
