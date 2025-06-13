import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";

// Setup paths and env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config();

console.log("🔍 Loading legal documents...");
const folderPath = path.join(__dirname, "legal_docs");
const files = fs.readdirSync(folderPath);
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

console.log("📦 Loading Hugging Face Embeddings...");
const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

console.log("🌲 Connecting to Pinecone...");
const pinecone = new Pinecone();
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

console.log("📚 Storing vectors in Pinecone...");
await PineconeStore.fromDocuments(docs, embeddings, {
  pineconeIndex: index,
});

console.log("✅ Ingestion completed successfully.");
