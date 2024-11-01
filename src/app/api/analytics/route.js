import AnalyticsClient from '@/app/utils/AnalyticsClient.mjs'

const clientId = process.env.ANALYTICS_CLIENT_ID
const clientSecret = process.env.ANALYTICS_CLIENT_SECRET
const refreshToken = process.env.ANALYTICS_REFRESH_TOKEN

export async function POST(request) {
  const analyticsClient = new AnalyticsClient(clientId, clientSecret, refreshToken)
  // Handle your analytics logic here
  
  return Response.json({ success: true })
} 