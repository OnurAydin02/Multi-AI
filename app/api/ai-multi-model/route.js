import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { model, msg, parentModel } = await req.json();

    /* Send POST request using Axios */
    const response = await axios.post(
      "https://kravixstudio.com/api/v1/chat",
      {
        message: msg, // Messages to AI
        aiModel: model,                     // Selected AI model
        outputType: "text"                         // 'text' or 'json'
      },
      {
        headers: {
          "Content-Type": "application/json",     // Tell server we're sending JSON
          "Authorization": "Bearer " + process.env.KRAVIXSTUDIO_API_KEY  // Fixed: Added space after Bearer
        }
      }
    );

    console.log(response.data); // Log API response
    return NextResponse.json({
      ...response.data,
      model: parentModel
    })
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Failed to fetch AI response",
        details: error.response?.data || error.message
      },
      { status: 500 }
    );
  }
}