import { PutObjectCommand, S3Client, S3ServiceException, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3Service {
  private awsAccessKeyId: string;
  private awsSecretAccessKey: string;
  private awsRegion: string;
  private awsS3BucketName: string;
  private awsS3BucketUrl: string;
  private readonly s3Client: S3Client;

  constructor() {
    // Class properties are camelCase
    this.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    this.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    this.awsRegion = process.env.AWS_REGION || '';
    this.awsS3BucketName = process.env.AWS_S3_BUCKET_NAME || '';
    this.awsS3BucketUrl = process.env.AWS_S3_BUCKET_URL || '';

    // Initialize S3 client once
    this.s3Client = new S3Client({
      region: this.awsRegion,
      credentials: {
        accessKeyId: this.awsAccessKeyId,
        secretAccessKey: this.awsSecretAccessKey,
      },
    });
  }

  uploadImageToBucket = async (userId: string, recipeId: string, thumbnailImage: Buffer, largeImage: Buffer) => {
    // 1. Create the file path
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
      await this.s3Client.send(thumbnailCommand);
      await this.s3Client.send(largeCommand);

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

  deleteImage = async (imageURL: string) => {
    const url = new URL(imageURL);
    const key = decodeURIComponent(url.pathname.substring(1));
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: key,
        })
      );
    } catch (error) {
      console.error('Error deleting object:', error);
      throw error;
    }
  };
}
