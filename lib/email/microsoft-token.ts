import "server-only";

export async function exchangeMicrosoftAuthorizationCode(params: {
  tenant: string;
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const url = `https://login.microsoftonline.com/${params.tenant}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    code: params.code,
    redirect_uri: params.redirectUri,
    grant_type: "authorization_code",
    scope:
      "offline_access openid profile https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read",
  });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Microsoft token exchange failed: ${text}`);
  }
  return JSON.parse(text) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

export async function refreshMicrosoftAccessToken(params: {
  tenant: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const url = `https://login.microsoftonline.com/${params.tenant}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
    scope:
      "offline_access openid profile https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read",
  });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Microsoft token refresh failed: ${text}`);
  }
  return JSON.parse(text) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}
