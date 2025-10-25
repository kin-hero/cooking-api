import { FastifyRequest, FastifyReply } from 'fastify';
import { RecipeService } from '@/services/recipes';
import { AuthenticatedRequest } from '@/middleware/auth';
import { ImageService } from '@/services/imageService';
import { S3ImageService } from '@/services/s3/S3ImageService';
import handleError from '@/utils/errorHandler';
import { processMultipartRequest, processImagePipeline, processFormFieldsForCreate, processFormFieldsForUpdate } from '@/utils/recipeUtils';

const recipeService = new RecipeService();
const imageService = new ImageService();
const s3ImageService = new S3ImageService();

export const createRecipe = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;

    // Process multipart request data
    const { imageFile, formFields } = await processMultipartRequest(request);

    // Process form fields for create operation
    const processedFields = processFormFieldsForCreate(formFields);
    const recipeData = {
      ...processedFields,
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
      const imagePipelineData = {
        userData: {
          imageFile,
          userId,
          recipeId,
        },
        services: {
          imageService,
          s3ImageService,
        },
      };
      return await processImagePipeline(imagePipelineData);
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
      message: 'Recipes for the homepage has been fetched successfully',
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
    const userId = (request as AuthenticatedRequest).user?.userId;
    const recipeDetailData = await recipeService.fetchDetailRecipe(id, userId);
    return reply.status(200).send({
      success: true,
      message: 'Recipe detail has been fetched successfully',
      data: recipeDetailData,
    });
  } catch (error) {
    return handleError(reply, error);
  }
};

export const getRecipesPerAuthor = async (request: FastifyRequest<{ Querystring: RecipeAllRequest }>, reply: FastifyReply) => {
  try {
    const { page, limit } = request.query;
    const userId = (request as AuthenticatedRequest).user.userId;
    const { recipeData, totalItems, hasMore } = await recipeService.fetchRecipesPerAuthor(page, limit, userId);
    return reply.status(200).send({
      success: true,
      message: 'Author personal recipes have been fetched successfully',
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

export const deleteRecipe = async (request: FastifyRequest<{ Params: RecipeDetailParams }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const userId = (request as AuthenticatedRequest).user.userId;
    await recipeService.removeRecipe(id, userId, async (thummbnailImageUrl: string | null, largeImageUrl: string | null) => {
      thummbnailImageUrl ? await s3ImageService.deleteImageByUrl(thummbnailImageUrl) : null;
      largeImageUrl ? await s3ImageService.deleteImageByUrl(largeImageUrl) : null;
    });
    return reply.status(200).send({
      success: true,
      message: 'Recipe has been deleted successfully',
    });
  } catch (error) {
    return handleError(reply, error);
  }
};

export const updateRecipe = async (request: FastifyRequest<{ Params: RecipeDetailParams }>, reply: FastifyReply) => {
  try {
    const { id: recipeId } = request.params;
    const userId = (request as AuthenticatedRequest).user.userId;

    // Process multipart request data
    const { imageFile, formFields } = await processMultipartRequest(request);

    // Process form fields for update operation
    const updateFields = processFormFieldsForUpdate(formFields);

    // Validate that at least one field is being updated
    if (Object.keys(updateFields).length === 0 && !imageFile) {
      return reply.status(400).send({
        success: false,
        message: 'No fields provided for update',
      });
    }

    // Handle case with no image update
    if (imageFile === null) {
      await recipeService.updateRecipeWithoutImage(recipeId, userId, updateFields);
      return reply.status(200).send({
        success: true,
        message: 'Recipe has been updated successfully',
      });
    }

    await recipeService.updateRecipeWithTransaction(recipeId, userId, updateFields, async (recipeId: string) => {
      const imagePipelineData = {
        userData: {
          imageFile,
          userId,
          recipeId,
        },
        services: {
          imageService,
          s3ImageService,
        },
      };
      return await processImagePipeline(imagePipelineData);
    });
    return reply.status(200).send({
      success: true,
      message: 'Recipe has been updated successfully',
    });
  } catch (error) {
    return handleError(reply, error);
  }
};
