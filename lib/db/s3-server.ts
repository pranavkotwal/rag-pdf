import { GetObjectCommand , S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import type { Readable } from "stream";
export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new S3Client({
        region: "ap-southeast-2",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        },
      });
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
      };

      const getObjectCommand = new GetObjectCommand(params)
 
      const response = await s3.send(getObjectCommand);
      
      const stream = response.Body as Readable
      const file_name = `/tmp/pdf-${Date.now().toString()}.pdf`;


      // Pipe the S3 stream to a local file with the defined path
      const localFileStream = fs.createWriteStream(file_name);
      stream.pipe(localFileStream);

      // Wait for download to finish
      localFileStream.on('finish', () => {
        console.log(`File downloaded successfully: ${file_name}`);
        resolve(file_name); // Resolve with the file path once download completes
      });

      localFileStream.on('error', (error) => {
        console.error("Error downloading file:", error);
        reject(error); // Reject with error if there's any problem during download
      });



      
    } catch (error) {
      console.error(error);
      reject(error);
      return null;
    }
  });
}

// downloadFromS3("uploads/1693568801787chongzhisheng_resume.pdf");