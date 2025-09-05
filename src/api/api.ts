import { authApi } from "./services/authApi";
import { documentApi } from "./services/documentApi";

const api ={
    ...authApi,
    ...documentApi
}

export default api;