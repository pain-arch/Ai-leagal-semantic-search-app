"use client";

import { useEffect, useState } from "react";
import { type Document } from "./types/document";


interface SearchResult {
  metadata: Document["metadata"];
  content: string;
}



const runBootstrapProcedure = async () => {
  const response = await fetch("/api/bootstrap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.json();
    console.log(body);
    throw new Error(`API request failed with status ${response.status}`);
  }
};


const checkAndBootstrapIndex = async (
  setsetIsBootsrapping: (isBootsrapping: boolean) => void,
  setIsIndexReady: (isIndexReady: boolean) => void
) => {
  setsetIsBootsrapping(true);
  await runBootstrapProcedure();
  setsetIsBootsrapping(false);
  setIsIndexReady(true);
};





export default function Home() {
  
  const [isBootsrapping, setIsBootsrapping] = useState(false);
  const [isIndexReady, setIsIndexReady] = useState(false);

  useEffect(() => {
    checkAndBootstrapIndex(setIsBootsrapping, setIsIndexReady);

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center w-full mb-8">
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600">Processing legal documents...</p>
            <div className="spinner border-4 border-t-transparent border-indigo-600 rounded-full w-5 h-5 animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
