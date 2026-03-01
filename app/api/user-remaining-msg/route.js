import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { aj } from "@/config/Arcjet";

export async function POST(req) {
    try {
        const user = await currentUser();
        const { token } = await req.json();

        if (token) {
            const decision = await aj.protect(req, {
                userId: user?.primaryEmailAddress?.emailAddress || "anonymous",
                requested: token
            });

            if (decision.isDenied()) {
                return NextResponse.json({
                    error: 'Too many requests',
                    remainingToken: decision.reason.remaining
                })
            }

            return NextResponse.json({
                allowed: true,
                remainingToken: decision.reason.remaining
            })
        } else {
            const decision = await aj.protect(req, {
                userId: user?.primaryEmailAddress?.emailAddress || "anonymous",
                requested: 0
            });

            return NextResponse.json({
                remainingToken: decision.reason.remaining
            })
        }
    } catch (error) {
        console.error("Rate limit error:", error.message);

        return NextResponse.json(
            {
                error: "Rate limit check failed",
                message: error.message
            },
            { status: 500 }
        );
    }
}