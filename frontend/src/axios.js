import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-lms-backend-74qm.onrender.com/api"
});

export default api;