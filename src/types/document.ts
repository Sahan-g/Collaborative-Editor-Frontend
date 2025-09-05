export interface DocumentData {
    title: string
}

export interface DocumentCreateResponse {
  ID: string;
  Title: string;
  OwnerID: string;
  Content: string;
  Version: number;
}