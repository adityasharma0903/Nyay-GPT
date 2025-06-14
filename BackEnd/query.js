import { config } from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@xenova/transformers";

config();

// User ka query likho
const query = "in which cases can a person be arrested without a warrant in India?";

// 1. Query embedding banao (local model se)
const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
const features = await extractor(query, { pooling: "mean", normalize: true });
const embedding = Array.from(features.data);

// 2. Pinecone connect karo
const pinecone = new Pinecone();
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// 3. Pinecone me search karo
const result = await index.query({
  vector: embedding,
  topK: 3, // Top 3 relevant docs laayega
  includeMetadata: true,
});

// 4. Result print karo
console.log("Top Matches:\n");
for (let i = 0; i < result.matches.length; i++) {
  console.log(`Result ${i + 1}:\n${result.matches[i].metadata.text}\n---\n`);
}