import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { createReadStream, statSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const R2_ACCESS_KEY_ID = "6c74100c28948397eaeaf1c33850a902"
const R2_SECRET_ACCESS_KEY =
  "b54590e16cd43e7da504c39b3f8c0a60ad7a4d4707003cfd98c2983fccceb9ea"
const R2_ACCOUNT_ID = "7fc9b60d4f60702a09f95f49e3b58600"
const BUCKET = "personal-website"

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const FILES = [
  "3. all of me.MOV",
  "6. tea for two.MOV",
]

for (const filename of FILES) {
  const filepath = join(__dirname, "../public/videos", filename)
  const size = statSync(filepath).size
  const mb = (size / 1024 / 1024).toFixed(1)

  console.log(`\nUploading "${filename}" (${mb} MB)...`)

  const upload = new Upload({
    client,
    params: {
      Bucket: BUCKET,
      Key: filename,
      Body: createReadStream(filepath),
      ContentType: "video/quicktime",
    },
    queueSize: 4,
    partSize: 1024 * 1024 * 64, // 64 MB parts
  })

  upload.on("httpUploadProgress", ({ loaded, total }) => {
    const pct = total ? Math.round((loaded / total) * 100) : "?"
    process.stdout.write(`\r  ${pct}% (${(loaded / 1024 / 1024).toFixed(0)} / ${mb} MB)`)
  })

  await upload.done()
  console.log(`\n  Done: "${filename}"`)
}

console.log("\nAll uploads complete.")
