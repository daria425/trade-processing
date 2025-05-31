import axios from "axios";

let baseUrl = " http://127.0.0.1:8000";
if (import.meta.env.MODE === "production") {
  baseUrl = import.meta.env.VITE_API_URL;
}

const apiConfig = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export { apiConfig };
