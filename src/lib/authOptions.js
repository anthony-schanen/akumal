// /lib/authOptions.js
import ZohoProvider from "next-auth/providers/zoho";

export const authOptions = {
  providers: [
    ZohoProvider({
      clientId: process.env.ZOHO_CLIENT_ID,
      clientSecret: process.env.ZOHO_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.zoho.com/oauth/v2/auth",
        params: {
          scope: "AaaServer.profile.Read ZohoAnalytics.data.create",
          access_type: "offline",
          prompt: "consent",
        },
      },
      token: "https://accounts.zoho.com/oauth/v2/token",
      userinfo: {
        url: "https://accounts.zoho.com/oauth/user/info",
      },
      profile(profile) {
        return {
          id: profile.ZUID,
          name: `${profile.First_Name} ${profile.Last_Name}`,
          email: profile.Email,
          image: null,
        };
      },
      wellKnown: null, // Prevent OIDC discovery
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;
      }
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};

async function refreshAccessToken(token) {
  try {
    const url = "https://accounts.zoho.com/oauth/v2/token";
    const params = new URLSearchParams({
      refresh_token: token.refreshToken,
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token",
    });

    const response = await fetch(url, {
      method: "POST",
      body: params,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Failed to refresh access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
