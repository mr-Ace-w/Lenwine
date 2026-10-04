import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'lenwine-media';
const publicDomain = process.env.R2_PUBLIC_DOMAIN || '';

export const r2Client = accountId && accessKeyId && secretAccessKey
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

export async function uploadToR2(buffer: Buffer, fileName: string, contentType: string): Promise<string | null> {
  if (!r2Client) return null;

  try {
    const key = `products/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Return Cloudflare R2 Public URL
    if (publicDomain) {
      const domain = publicDomain.replace(/\/$/, '');
      return `${domain}/${key}`;
    }

    return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
  } catch (err) {
    console.error('Cloudflare R2 Upload Error:', err);
    return null;
  }
}
