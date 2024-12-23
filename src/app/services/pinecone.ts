import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

export async function createIndexIfNessesary(indexName: string) {
  await pinecone.createIndex({
    name: indexName,
    dimension: 1024,
    spec: {
        serverless: {
            region: "us-east-1",
            cloud: "aws",
        },
    },
    waitUntilReady: true,
    suppressConflicts: true,
  });
};

export async function pineconeIndexHasVectors(indexName: string): Promise<boolean> {
    try {
      const targetIndex = pinecone.index(indexName)
  
      const stats = await targetIndex.describeIndexStats();
  
      return (stats.totalRecordCount && stats.totalRecordCount > 0) ? true : false;
    } catch (error) {
      console.error('Error checking Pinecone index:', error);
      return false;
    }
};