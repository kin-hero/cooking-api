import awsLambdaFastify from '@fastify/aws-lambda';
import { getApp } from './app';

let cachedProxy: any = null;

export const handler = async (event: any, context: any) => {
  // Cache the configured app to avoid re-setup on warm starts
  if (!cachedProxy) {
    const app = await getApp();
    cachedProxy = awsLambdaFastify(app);
  }

  return cachedProxy(event, context);
};
