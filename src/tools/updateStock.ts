import axios from 'axios';
import { getConfig } from '../config.js';
import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const updateStock: ToolDefinition = {
  name: 'updateStock',
  description: 'Update the stock quantity for a product.',
  method: 'PATCH',
  path: '/companies/{COMPANY_ID}/products/{productId}/',
  inputs: {
    productId: 'number',
    quantity: 'number',
  },
  async execute(params) {
    const config = getConfig();
    const client = getApiClient();

    const productId = params.productId as number | undefined;
    const quantity = params.quantity as number | undefined;

    if (!productId) {
      return { success: false, error: 'The "productId" parameter is required.' };
    }

    if (typeof quantity !== 'number') {
      return { success: false, error: 'The "quantity" parameter must be a number.' };
    }

    try {
      const result = await client.patch<Record<string, unknown>>(
        `/companies/${config.companyId}/products/${productId}/`,
        { quantity },
      );

      return { success: true, data: result };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.message,
          details: error.response?.data ?? null,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating stock',
      };
    }
  },
};

export default updateStock;

