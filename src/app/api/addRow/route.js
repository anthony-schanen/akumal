import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  console.log("Received POST request at /api/addRow");

  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await req.json();
    console.log("Data received:", data);

    // Process the input data
    const rows = processInputData(data);
    console.log("Processed rows:", rows);

    if (rows.length === 0) {
      console.log("No valid data to add");
      return NextResponse.json(
        { error: "No valid data to add" },
        { status: 400 }
      );
    }

    const workspaceId = "2940213000000004004";
    const viewId = "2940213000000004009";
    const orgId = "867894988";

    const baseUrl = `https://analyticsapi.zoho.com/restapi/v2/workspaces/${workspaceId}/views/${viewId}/rows`;

    const results = [];

    for (const row of rows) {
      console.log("Processing row:", row);

      // Construct the CONFIG parameter for a single row
      const config = {
        columns: row,
        dateFormat: "yyyy/MM/dd HH:mm",
      };

      const configJson = JSON.stringify(config);
      const encodedConfig = encodeURIComponent(configJson);
      const fullUrl = `${baseUrl}?CONFIG=${encodedConfig}`;

      console.log("Sending request to:", fullUrl);
      console.log("Request body is empty");

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${session.accessToken}`,
          "ZANALYTICS-ORGID": orgId,
        },
      });

      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response data:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        result = { message: responseText };
      }

      if (!response.ok) {
        console.error("Failed to add row:", result);
        return NextResponse.json(
          {
            error:
              result.data?.errorMessage ||
              result.message ||
              "Failed to add row",
            details: result,
          },
          { status: response.status }
        );
      }

      results.push(result);
    }

    console.log("All rows added successfully");
    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error) {
    console.error("Error in addRow API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

function processInputData(inputData) {
  const pattern = /(\d) (\d{2}) (\d{4}\/\d{2}\/\d{2}) (\d{2}:\d{2})/g;
  const rows = [];
  let match;

  while ((match = pattern.exec(inputData)) !== null) {
    const [_, location, user, date, time] = match;
    const dateTime = `${date} ${time}`; // Combine date and time
    rows.push({
      location: location,
      user: user,
      created_date: dateTime,
    });
  }

  return rows;
}
