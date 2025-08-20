import axios from "axios";

const axiosInstance = axios.create({
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
})


export default axiosInstance;