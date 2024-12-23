"use server";

import { NextResponse } from "next/server";
import { createIndexIfNessesary, pineconeIndexHasVectors } from "./pinecone";

export const initiateBootstraping = async (targetindex: string) => {
  const BaseURL = process.env.PRODUCTION_URL
    ? `https://${process.env.PRODUCTION_URL}`
    : `http://localhost:${process.env.PORT}`;

    const responce = await fetch(`${BaseURL}/api/ingest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetindex }),
    });
    if (!responce.ok){
        throw new Error(`API request failed with status ${responce.status}`);
    }
};


export const handleBootstrapping = async (targetIndex: string) => {
    try {
        console.log(`Running bootstrapping procedure against Pinecone index: ${targetIndex}`);

        //create index if nesesary
        await createIndexIfNessesary(targetIndex);
        const hasVectors = await pineconeIndexHasVectors(targetIndex);

        if (hasVectors) {
            console.log("Pineconr index already exist and has vectors in it - returning early");
            return NextResponse.json({ success: true }, { status: 200 });
        }

    } catch (error) {
        
    }
}