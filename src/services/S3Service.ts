import { PutObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';

export class S3Service {
  private awsAccessKeyId: string;
  private awsSecretAccessKey: string;
  private awsRegion: string;
  private awsS3BucketName: string;
  private awsS3BucketUrl: string;

  constructor() {
    // Class properties are camelCase
    this.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    this.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    this.awsRegion = process.env.AWS_REGION || '';
    this.awsS3BucketName = process.env.AWS_S3_BUCKET_NAME || '';
    this.awsS3BucketUrl = process.env.AWS_S3_BUCKET_URL || '';
  }

  uploadImageToBucket = async (userId: string, recipeId: string, thumbnailImage: Buffer, largeImage: Buffer) => {
    // 1. Create an S3 client.
    const client = new S3Client({
      region: this.awsRegion,
      credentials: {
        accessKeyId: this.awsAccessKeyId,
        secretAccessKey: this.awsSecretAccessKey,
      },
    });

    // 2. Create the file path
    const thumbnailKey = `${userId}/${recipeId}/thumbnail.jpg`;
    const largeKey = `${userId}/${recipeId}/large.jpg`;

    const thumbnailCommand = new PutObjectCommand({
      Bucket: this.awsS3BucketName,
      Key: thumbnailKey,
      Body: thumbnailImage,
      ContentType: 'image/jpeg',
    });

    const largeCommand = new PutObjectCommand({
      Bucket: this.awsS3BucketName,
      Key: largeKey,
      Body: largeImage,
      ContentType: 'image/jpeg',
    });

    try {
      await client.send(thumbnailCommand);
      await client.send(largeCommand);

      const thumbnailImageUrl = `https://${this.awsS3BucketName}.s3.${this.awsRegion}.amazonaws.com/${thumbnailKey}`;
      const largeImageUrl = `https://${this.awsS3BucketName}.s3.${this.awsRegion}.amazonaws.com/${largeKey}`;
      return {
        thumbnailImageUrl,
        largeImageUrl,
      };
    } catch (error) {
      if (error instanceof S3ServiceException) {
        console.error(`Error from S3: ${error.name} - ${error.message}`);
      } else {
        console.error('An unexpected error occurred:', error);
      }
      throw error;
    }
  };
}
