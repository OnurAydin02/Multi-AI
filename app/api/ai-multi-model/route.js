import axios from "axios";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { model, msg, parentModel } = await req.json();

    if (!model || !msg) {
      return NextResponse.json({ error: "Model and message required" }, { status: 400 });
    }

    // Format message according to KravixStudio API docs
    const formattedMessage = [{ role: "user", content: msg }];

    const response = await axios.post(
      "https://kravixstudio.com/api/v1/chat",
      {
        message: formattedMessage,
        aiModel: model,
        outputType: "text"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.KRAVIXSTUDIO_API_KEY
        }
      }
    );

    return NextResponse.json({
      ...response.data,
      model: parentModel
    })
  } catch (error) {
    console.error("AI API Error:", error.message);

    return NextResponse.json(
      { error: "AI service error", message: error.message },
      { status: 500 }
    );
  }
}