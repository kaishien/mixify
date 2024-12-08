export interface AuthorizationResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface AuthorizeQueryParams {
  [key: string]: string;
  response_type: string;
  client_id: string;
  scope: string;
  redirect_uri: string;
  state: string;
} 