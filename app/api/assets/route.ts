import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/get-assets");
    if (!response.ok) {
      throw new Error("Failed to fetch assets from API Gateway");
    }
    // Lambda returns: { statusCode, headers, body }
    const lambdaResult = await response.json();
    // The actual assets are in lambdaResult.body as a JSON string
    const assets = typeof lambdaResult.body === "string"
      ? JSON.parse(lambdaResult.body)
      : lambdaResult.body;

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
} 