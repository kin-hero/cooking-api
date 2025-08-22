import { S3Service } from './S3Service';

export class S3ImageService extends S3Service {
  /** Upload thumbnail and large image for a recipe */
  async uploadRecipeImages(userId: string, recipeId: string, thumbnail: Buffer, large: Buffer) {
    const thumbnailKey = `${userId}/${recipeId}/thumbnail.jpg`;
    const largeKey = `${userId}/${recipeId}/large.jpg`;

    const thumbnailUrl = await this.upload(thumbnailKey, thumbnail, 'image/jpeg');
    const largeUrl = await this.upload(largeKey, large, 'image/jpeg');

    return { thumbnailUrl, largeUrl };
  }

  /** Delete image using full URL */
  async deleteImageByUrl(imageUrl: string) {
    const url = new URL(imageUrl);
    const key = decodeURIComponent(url.pathname.substring(1));
    await this.delete(key);
  }
}
