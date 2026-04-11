import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Inisialisasi S3 Client untuk Backblaze B2
const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT, 
  region: process.env.B2_REGION,     
  forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE || "true").toLowerCase() === "true",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
});

export{
    s3Client
}
