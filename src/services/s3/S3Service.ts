import { PutObjectCommand, DeleteObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';

export class S3Service {
  protected awsRegion: string; // accessible in subclasses
  protected awsS3BucketName: string; // accessible in subclasses
  private s3Client: S3Client | null = null; // lazy init, private to base class

  constructor() {
    this.awsRegion = process.env.AWS_REGION || 'ap-northeast-3';
    this.awsS3BucketName = process.env.AWS_S3_BUCKET_NAME || '';
  }

  /** Lazy initialization of S3 client */
  protected getS3Client(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({ region: this.awsRegion });
    }
    return this.s3Client;
  }

  /** Generic upload */
  async upload(key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.awsS3BucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    try {
      await this.getS3Client().send(command);
      return `https://${this.awsS3BucketName}.s3.${this.awsRegion}.amazonaws.com/${key}`;
    } catch (error) {
      if (error instanceof S3ServiceException) {
        console.error(`S3 Error: ${error.name} - ${error.message}`);
      } else {
        console.error('Unexpected error uploading to S3:', error);
      }
      throw error;
    }
  }

  /** Generic delete */
  async delete(key: string) {
    const command = new DeleteObjectCommand({ Bucket: this.awsS3BucketName, Key: key });
    try {
      await this.getS3Client().send(command);
    } catch (error) {
      console.error('Error deleting S3 object:', error);
      throw error;
    }
  }
}
