
import { initiateBootstrapping } from "@/app/services/bootstrap";
import { NextResponse } from "next/server";

export async function POST() {
    // innitiate Booststraping

    await initiateBootstrapping(process.env.PINECONE_INDEX as string);

    // return NextResponse
    return NextResponse.json({ success: true }, { status: 200 });
}