import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-app-s27r.onrender.com"
});

export default api;
