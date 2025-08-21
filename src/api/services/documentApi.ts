import type { AxiosResponse } from "axios";
import { SERVICES } from "../../constants/services";
import type { DocumentCreateResponse, DocumentData } from "../../types/document";
import axiosInstance from "./axiosInstance";

export const documentApi = {
        getDocuments: () =>
                axiosInstance.get(`${SERVICES.DOCUMENT.url}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }),

        addDocument: (data: DocumentData): Promise<AxiosResponse<DocumentCreateResponse>> =>
                axiosInstance.post(`${SERVICES.DOCUMENT.url}`, data, {
                        headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                }),
        getDocumentById: (id: string): Promise<AxiosResponse<DocumentCreateResponse>> => axiosInstance.get(`${SERVICES.DOCUMENT.url}/${id}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        shareDocument: (id: string, email: string): Promise<AxiosResponse<string>> =>
                axiosInstance.post<string>(
                        `${SERVICES.DOCUMENT.url}/${id}/share`,
                        { email, role: "editor" },
                        {
                                responseType: "text",                 
                                headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                        }
                ),
}