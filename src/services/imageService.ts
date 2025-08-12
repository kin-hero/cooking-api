import sharp from 'sharp';

export class ImageService {
  validateImageFileSize = (fileSize: number) => {
    const maximumLimit = 1 * 1024 * 1024;
    if (fileSize > maximumLimit) {
      throw new Error('Image file size is bigger than 1 MB');
    }
    return;
  };

  validateImageFormat = (mimeType: string) => {
    const allowedImageFormat = ['image/png', 'image/jpeg'];
    if (!allowedImageFormat.includes(mimeType)) {
      throw new Error('Image type should only be png or jpeg');
    }
  };

  resizeImageThumbnail = async (imageFile: Buffer) => {
    const thumbnailImage = await sharp(imageFile)
      .resize(400, 300, { kernel: sharp.kernel.nearest, fit: 'fill' })
      .jpeg({ quality: 80 })
      .toBuffer();
    return thumbnailImage;
  };

  resizeImageLarge = async (imageFile: Buffer) => {
    const thumbnailLarge = await sharp(imageFile)
      .resize(1200, 800, { kernel: sharp.kernel.nearest, fit: 'fill' })
      .jpeg({ quality: 80 })
      .toBuffer();
    return thumbnailLarge;
  };
}
