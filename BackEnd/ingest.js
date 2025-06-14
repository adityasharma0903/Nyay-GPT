import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pipeline } from "@xenova/transformers";

// Setup env and paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config(); // Loads .env

// DEBUG: Print Pinecone Index Name
console.log('PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME || "[NOT SET]");
if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("❌ PINECONE_INDEX_NAME is not set in .env file!");
}

console.log("🔍 Loading legal documents...");
const folderPath = path.join(__dirname, "legal_docs");
const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".txt") || f.endsWith(".md"));
let allText = "";
for (const file of files) {
  const filePath = path.join(folderPath, file);
  const content = fs.readFileSync(filePath, "utf-8");
  allText += `\n${content}`;
}

console.log("✂️ Splitting text...");
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const docs = await splitter.createDocuments([allText]);

console.log("📦 Loading HuggingFace Transformers.js model (local)...");
const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

console.log("🌲 Connecting to Pinecone...");
const pinecone = new Pinecone();
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

console.log("📚 Storing vectors in Pinecone...");
for (let i = 0; i < docs.length; i++) {
  const doc = docs[i];
  const text = doc.pageContent;
  // Get embedding (local, no API)
  const features = await extractor(text, { pooling: "mean", normalize: true });
  const embedding = Array.from(features.data); // Float32Array to Array
  await index.upsert([
    {
      id: `doc-${i}`,
      values: embedding,
      metadata: { text },
    }
  ]);
  if ((i+1) % 5 === 0 || i === docs.length - 1) {
    console.log(`[${i + 1}/${docs.length}] Documents embedded & upserted`);
  }
}

console.log("✅ Ingestion completed successfully.");