import { handleBootstrapping } from "@/app/services/bootstrap";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const {targetIndex} = await req.json();
    
    //handleBootsraping
    await handleBootstrapping(targetIndex);


    //return NextResponse
    return NextResponse.json({ success: true }, { status: 200 });
}