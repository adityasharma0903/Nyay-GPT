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
config();

const folderPath = path.join(__dirname, "legal_docs");

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("❌ PINECONE_INDEX_NAME is not set in .env file!");
}
console.log("🟦 PINECONE_INDEX_NAME:", process.env.PINECONE_INDEX_NAME);

// Collect all .txt files
const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".txt"));
console.log("TXT files found:", files);

let allDocs = [];

for (const file of files) {
  const filePath = path.join(folderPath, file);
  let content = "";

  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File does not exist: ${filePath}`);
      continue;
    }

    console.log(`📥 Reading file: ${filePath}`);
    content = fs.readFileSync(filePath, "utf8");

    if (content.trim()) {
      allDocs.push({ text: content, filename: file });
    }
  } catch (err) {
    console.error(`❌ Error reading ${file}: ${err.message}`);
  }
}

// Split all docs into manageable chunks
console.log("✂️ Splitting text into chunks...");
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

let docs = [];
for (const doc of allDocs) {
  const splitted = await splitter.createDocuments([doc.text]);
  for (const s of splitted) {
    s.metadata = { ...s.metadata, filename: doc.filename };
    docs.push(s);
  }
}

// Load local HuggingFace model for embedding
console.log("🧠 Loading HuggingFace Transformers model...");
const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

// Connect to Pinecone
console.log("🌲 Connecting to Pinecone...");
const pinecone = new Pinecone();
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Upsert all chunks into Pinecone with embedding
console.log("📦 Uploading vectors to Pinecone...");
for (let i = 0; i < docs.length; i++) {
  const doc = docs[i];
  const text = doc.pageContent;

  try {
    const features = await extractor(text, { pooling: "mean", normalize: true });
    const embedding = Array.from(features.data);

    await index.upsert([
      {
        id: `doc-${i}`,
        values: embedding,
        metadata: { text, filename: doc.metadata?.filename },
      }
    ]);

    if ((i + 1) % 5 === 0 || i === docs.length - 1) {
      console.log(`[${i + 1}/${docs.length}] ✅ Uploaded`);
    }
  } catch (err) {
    console.warn(`⚠️ Skipping doc ${i} due to error: ${err.message}`);
  }
}

console.log("🎉 Ingestion complete.");