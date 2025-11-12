import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";
import { matchesGlob } from "path";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

let extractor: any;
let index: any;

const TARGET_DIM = 2688;

export async function run() {
  const indexName = process.env.PINECONE_INDEX_NAME!;

  const existingIndexes = await pc.listIndexes();
  const indexesList = existingIndexes.indexes ?? [];

  const sampleEmbedding = await extractor("My Name is Neeraj");
  const DIMENSION = sampleEmbedding.data.length;

  if (!indexesList.some((idx) => idx.name === indexName)) {
    console.log(`Creating index: ${indexName}`);
    await pc.createIndex({
      name: indexName,
      dimension: DIMENSION, // vector length
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    });

    console.log("Waiting for index to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  index = pc.index(indexName);
  return index;
}

export async function storeText(userId:string,text: string) {
  const embedding = await extractor(text);
  const vector = Array.from(embedding.data); // Convert to plain array
  const foundmatching:any = searchText(text,1,userId);
  foundmatching.then(async (foundmatch:any)=>{
        if(foundmatch.length != 0 && foundmatch[0]?.score >= 0.98){
            console.log("data did not stoed .. score matched all ready");
            return;
        }

        const normalizedVector = normalizeVector(vector, TARGET_DIM);

        await index.upsert([
          {
            id:`doc-123_${new Date().toISOString().replace(/[-:TZ.]/g, '')}`,
            values: normalizedVector,
            metadata: { UserId:userId,text:text,created_at: new Date().toISOString() },
          },
        ]);

  console.log(`✅ Stored: "${text}"`);
  })
  
  
}

export async function searchText(query: any, topK:any,userId:any) {
  const embedding = await extractor(query);
  const vector = Array.from(embedding.data);

  const normalizedVector = normalizeVector(vector, TARGET_DIM);
  const threshold = 0.25;
  console.log("userId found on searchText",userId);
  const queryResponse = await index.query({
    vector: normalizedVector,
    topK: topK,
    filter: { UserId: userId },
    includeMetadata: true,
  });

  let foundata:any = [];

  // const latest = queryResponse.matches.sort(
  // (a:any, b:any) => new Date(b.metadata.created_at).getTime() - new Date(a.metadata.created_at).getTime())[0];


  (queryResponse.matches ?? []).forEach((match: any) => {
    console.log(`ID: ${match.id}, Score: ${match.score}`);
    console.log("Metadata:", match.metadata);

    foundata.push({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    });
  });

   foundata = foundata.filter((val:any)=>(val.score > threshold));
   console.log("founded",foundata);

  return foundata;
}

function normalizeVector(vec: any, targetDim: any) {
  const currentDim = vec.length;

  if (currentDim === targetDim) {
    return vec; // already correct
  }

  if (currentDim > targetDim) {
    // Too long → trim
    return vec.slice(0, targetDim);
  }

  // Too short → pad with zeros
  const padded = new Array(targetDim).fill(0);
  for (let i = 0; i < currentDim; i++) {
    padded[i] = vec[i];
  }
  return padded;
}

export async function embeidingtranform() {
  try {
    // This will remain as import() in compiled JS
    const TransformersApi = Function('return import("@xenova/transformers")')();
    const { pipeline } = await TransformersApi;

    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    return extractor;
  } catch (err) {
    console.error("Error while transforming:", err);
    throw err;
  }
}

 async function init(){
 await embeidingtranform();
  await run();
}

init();

