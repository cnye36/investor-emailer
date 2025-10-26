import { NextRequest } from "next/server";

// This endpoint should be called by a cron job every few minutes
// You can use services like Vercel Cron, GitHub Actions, or external cron services
export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (optional security measure)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call the campaign scheduler
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const schedulerResponse = await fetch(`${baseUrl}/api/campaign-scheduler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!schedulerResponse.ok) {
      const errorData = await schedulerResponse.json();
      console.error('Campaign scheduler error:', errorData);
      return Response.json({ error: "Failed to process campaigns" }, { status: 500 });
    }

    const result = await schedulerResponse.json();
    
    return Response.json({
      success: true,
      message: `Processed ${result.processed} campaign schedules`,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    console.error('Campaign processor error:', error);
    return Response.json(
      { error: "Failed to process campaigns" },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
