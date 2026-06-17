import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:5000/api";
  }
  return "https://ai-lms-backend-74qm.onrender.com/api";
};

const api = axios.create({
  baseURL: getBaseURL()
});

export default api;