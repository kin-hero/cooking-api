import { FastifyRequest } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { ImageService } from '@/services/imageService';
import { S3ImageService } from '@/services/s3/S3ImageService';

// Type-safe interface for multipart file with buffer
export interface EnhancedMultipartFile extends MultipartFile {
  buffer: Buffer;
}

export interface ProcessedMultipartData {
  imageFile: EnhancedMultipartFile | null;
  formFields: Record<string, string>;
}

export interface ImageProcessingResult {
  thumbnailUrl: string;
  largeUrl: string;
}

// Utility function to process multipart request data
export const processMultipartRequest = async (request: FastifyRequest): Promise<ProcessedMultipartData> => {
  const parts = request.parts();
  let imageFile: EnhancedMultipartFile | null = null;
  const formFields: Record<string, string> = {};

  for await (const part of parts) {
    if (part.type === 'file') {
      const buffer = await part.toBuffer();
      imageFile = {
        ...part,
        buffer: buffer,
      } as EnhancedMultipartFile;
    } else {
      formFields[part.fieldname] = part.value as string;
    }
  }

  return { imageFile, formFields };
};

interface ImagePipeline {
  userData: {
    imageFile: EnhancedMultipartFile;
    userId: string;
    recipeId: string;
  };
  services: {
    imageService: ImageService;
    s3ImageService: S3ImageService;
  };
}

// Utility function to process image pipeline
export const processImagePipeline = async (imagePipelineData: ImagePipeline): Promise<ImageProcessingResult> => {
  const { userData, services } = imagePipelineData;
  const { imageFile, userId, recipeId } = userData;
  const { imageService, s3ImageService } = services;
  // 1. Validate image
  const imageBuffer = imageFile.buffer;
  const mimeType = imageFile.mimetype;
  const fileSize = imageBuffer.length;
  imageService.validateImageFileSize(fileSize);
  imageService.validateImageFormat(mimeType);

  // 2. Process images
  const imageThumbnail = await imageService.resizeImageThumbnail(imageBuffer);
  const imageLarge = await imageService.resizeImageLarge(imageBuffer);

  // 3. Upload to S3
  const { thumbnailUrl, largeUrl } = await s3ImageService.uploadRecipeImages(userId, recipeId, imageThumbnail, imageLarge);

  return { thumbnailUrl, largeUrl };
};

// Field processors for recipe data
const fieldProcessors: Record<string, (value: string) => any> = {
  title: (value: string) => value,
  description: (value: string) => value,
  ingredients: (value: string) => JSON.parse(value),
  instructions: (value: string) => JSON.parse(value),
  prepTimeMinutes: (value: string) => parseInt(value),
  cookingTimeMinutes: (value: string) => parseInt(value),
  servingSize: (value: string) => parseInt(value),
  isPublished: (value: string) => value === 'true',
};

// Process form fields with appropriate defaults for create operations
export const processFormFieldsForCreate = (formFields: Record<string, string>) => {
  return {
    title: formFields.title,
    description: formFields.description,
    ingredients: formFields.ingredients ? JSON.parse(formFields.ingredients) : [],
    instructions: formFields.instructions ? JSON.parse(formFields.instructions) : [],
    prepTimeMinutes: formFields.prepTimeMinutes ? parseInt(formFields.prepTimeMinutes) : 0,
    cookingTimeMinutes: formFields.cookingTimeMinutes ? parseInt(formFields.cookingTimeMinutes) : 0,
    servingSize: formFields.servingSize ? parseInt(formFields.servingSize) : 0,
    isPublished: formFields.isPublished === 'true',
  };
};

// Process form fields for update operations (only provided fields)
export const processFormFieldsForUpdate = (formFields: Record<string, string>) => {
  const updateFields: Record<string, any> = {};

  Object.entries(formFields).forEach(([fieldName, fieldValue]) => {
    if (fieldProcessors[fieldName] && fieldValue !== undefined && fieldValue !== '') {
      updateFields[fieldName] = fieldProcessors[fieldName](fieldValue);
    }
  });

  return updateFields;
};
