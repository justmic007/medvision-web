// Types mirroring the backend's auth schemas.

export type Role = "admin" | "clinician";
export type Status = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  email: string;
  role: Role;
  status: Status;
  email_verified: boolean;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
}
