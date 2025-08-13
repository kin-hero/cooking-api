import { FastifyRequest, FastifyReply } from 'fastify';
import { RecipeService } from '@/services/recipes';
import { AuthenticatedRequest } from '@/middleware/auth';
import { ImageService } from '@/services/imageService';
import { S3Service } from '@/services/S3Service';
import { MultipartFile } from '@fastify/multipart';
import handleError from '@/utils/errorHandler';

// Type-safe interface for multipart file with buffer
interface EnhancedMultipartFile extends MultipartFile {
  buffer: Buffer;
}

const recipeService = new RecipeService();
const imageService = new ImageService();
const s3Service = new S3Service();

export const createRecipe = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    // Process all multipart parts, but consume file streams properly
    const parts = request.parts();
    let imageFile: EnhancedMultipartFile | null = null;
    const formFields: Record<string, string> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        // This is the file upload - we need to consume it to avoid blocking
        const buffer = await part.toBuffer();
        imageFile = {
          ...part,
          buffer: buffer, // Store the buffer for later use
        } as EnhancedMultipartFile;
      } else {
        // This is a form field - value is already available
        formFields[part.fieldname] = part.value as string;
      }
    }

    // Extract and validate form fields
    const title = formFields.title;
    const description = formFields.description;
    const ingredients = formFields.ingredients ? JSON.parse(formFields.ingredients) : [];
    const instructions = formFields.instructions ? JSON.parse(formFields.instructions) : [];
    const prepTimeMinutes = formFields.prepTimeMinutes ? parseInt(formFields.prepTimeMinutes) : 0;
    const cookingTimeMinutes = formFields.cookingTimeMinutes ? parseInt(formFields.cookingTimeMinutes) : 0;
    const servingSize = formFields.servingSize ? parseInt(formFields.servingSize) : 0;
    const isPublished = formFields.isPublished === 'true';

    const recipeData = {
      title,
      description,
      ingredients,
      instructions,
      prepTimeMinutes,
      cookingTimeMinutes,
      servingSize,
      isPublished,
      userId,
    };

    if (imageFile === null) {
      await recipeService.createRecipeWithoutImage(recipeData);
      return reply.status(201).send({
        success: true,
        message: 'Recipe has been created successfully',
      });
    }

    // Use transactional approach with image processing callback
    await recipeService.createRecipeWithTransaction(recipeData, async (recipeId: string) => {
      // This callback runs INSIDE the transaction with the created recipe ID

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
      const { thumbnailImageUrl, largeImageUrl } = await s3Service.uploadImageToBucket(userId, recipeId, imageThumbnail, imageLarge);

      // 4. Return URLs for database update (happens automatically in transaction)
      return { thumbnailImageUrl, largeImageUrl };
    });
    return reply.status(201).send({
      success: true,
      message: 'Recipe has been created successfully',
    });
  } catch (error) {
    return handleError(reply, error);
  }
};

export interface RecipeAllRequest {
  page: number;
  limit: number;
}
export const getAllRecipes = async (request: FastifyRequest<{ Querystring: RecipeAllRequest }>, reply: FastifyReply) => {
  try {
    const { page, limit } = request.query;
    const { recipeData, totalItems, hasMore } = await recipeService.fetchAllRecipes(page, limit);
    return reply.status(200).send({
      success: true,
      message: 'Recipe for the homepage has been fetched successfully',
      data: {
        recipeData,
        totalItems,
        hasMore,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
};

export interface RecipeDetailParams {
  id: string;
}

export const getDetailRecipe = async (request: FastifyRequest<{ Params: RecipeDetailParams }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const recipeDetailData = await recipeService.fetchDetailRecipe(id);
    return reply.status(200).send({
      success: true,
      message: 'Recipe detail has been fetched successfully',
      data: {
        recipeDetailData,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
};
