"use server";

import { NextResponse } from "next/server";
import { createIndexIfNessesary, pineconeIndexHasVectors } from "./pinecone";
import path from "path";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { promises as fs } from "fs";
import { type Document } from "../types/document";

const readMetadata = async (): Promise<Document["metadata"][]> => {
  try {
    const filePath = path.resolve(process.cwd(), "docs/db.json");
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.documents || [];
  } catch (error) {
    console.warn("Couldn't read metadata from db.json:", error);
    return [];
  }
};

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
  if (!responce.ok) {
    throw new Error(`API request failed with status ${responce.status}`);
  }
};

const isValidElement = (content: string): boolean => {
  if (!content || typeof content !== "string") return false;

  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length < 8192;
};

export const handleBootstrapping = async (targetIndex: string) => {
  try {
    console.log(
      `Running bootstrapping procedure against Pinecone index: ${targetIndex}`
    );

    //create index if nesesary
    await createIndexIfNessesary(targetIndex);
    const hasVectors = await pineconeIndexHasVectors(targetIndex);

    if (hasVectors) {
      console.log(
        "Pineconr index already exist and has vectors in it - returning early"
      );
      return NextResponse.json({ success: true }, { status: 200 });
    }

    console.log("loading documents and metadata.....");

    const docsPath = path.resolve(process.cwd(), "docs/");
    const loader = new DirectoryLoader(docsPath, {
      ".pdf": (filePath: string) => new PDFLoader(filePath),
    });

    const documents = await loader.load();

    if (documents.length === 0) {
      console.warn("No PDF documents found in the directory");
      return NextResponse.json(
        { error: "No documents found" },
        { status: 400 }
      );
    }

    const metadata = await readMetadata();

    const validDocuments = documents.filter((doc) =>
      isValidElement(doc.pageContent)
    );

    validDocuments.forEach((doc) => {
      const fileMetadata = metadata.find(
        (meta) => meta.filename === path.basename(doc.metadata.source)
      );

      if (fileMetadata) {
        doc.metadata = {
          ...doc.metadata,
          ...fileMetadata,
          pageContent: doc.pageContent,
        };
      }
    });

    console.log(`Found ${validDocuments.length} valid documents`);

    //split documents into smaller chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splits = await splitter.splitDocuments(validDocuments);
    console.log(`Created into ${splits.length} chunks`);

    const BATCH_SIZE = 5;

    for (let i = 0; i < splits.length; i += BATCH_SIZE) {
      const batch = splits.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
          splits.length / BATCH_SIZE
        )}`
      );

      //filter and prepare batch
      const validBatch = batch.filter((split) =>
        isValidElement(split.pageContent)
      );
      if (validBatch.length === 0){
        console.log("Skipping batch - no valid content");
        continue;
      }

    }



  } catch (error) {}
};
