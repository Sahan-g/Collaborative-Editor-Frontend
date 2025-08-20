import { SERVICES } from "../../constants/services";
import type { DocumentData } from "../../types/document";
import axiosInstance from "./axiosInstance";

export const documentApi = {
    getDocuments: () =>
            axiosInstance.get(`${SERVICES.DOCUMENT.url}/login`, ),
    
    addDocument: (data: DocumentData) =>
            axiosInstance.post(`${SERVICES.DOCUMENT.url}/`, data),
}