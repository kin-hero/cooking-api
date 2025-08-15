import { PutObjectCommand, S3Client, S3ServiceException, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3Service {
  private awsRegion: string;
  private awsS3BucketName: string;
  private s3Client: S3Client | null = null; // Lazy initialization

  constructor() {
    // Class properties are camelCase
    this.awsRegion = process.env.AWS_REGION || 'ap-northeast-3';
    this.awsS3BucketName = process.env.AWS_S3_BUCKET_NAME || '';
    // S3 client will be initialized on first use (lazy loading)
  }

  /**
   * Lazy loading: Initialize S3 client only when first needed
   * This reduces cold start time by avoiding S3 client setup during Lambda init
   */
  private getS3Client(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: this.awsRegion,
        // No explicit credentials needed in Lambda - uses IAM role
      });
    }
    return this.s3Client;
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
      const s3Client = this.getS3Client(); // Lazy load S3 client
      await s3Client.send(thumbnailCommand);
      await s3Client.send(largeCommand);

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
      const s3Client = this.getS3Client(); // Lazy load S3 client
      await s3Client.send(
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
