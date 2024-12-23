import { initiateBootstraping } from "@/app/services/bootstrap";
import { NextResponse } from "next/server";

export async function POST() {
    // innitiate Booststraping

    await initiateBootstraping(process.env.PINECONE_INDEX as string);

    // return NextResponse
    return NextResponse.json({ success: true }, { status: 200 });
}