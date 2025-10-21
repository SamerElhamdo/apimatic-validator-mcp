import axios from 'axios';
import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const updateStock: ToolDefinition = {
  name: 'updateStock',
  description: 'Update the stock quantity for a product.',
  method: 'PATCH',
  path: '/companies/{companyId}/products/{productId}/',
  inputs: {
    companyId: 'number',
    productId: 'number',
    quantity: 'number',
  },
  async execute(params) {
    const client = getApiClient();
    const { companyId, productId, quantity } = params as {
      companyId?: unknown;
      productId?: unknown;
      quantity?: unknown;
    };

    if (companyId === undefined || companyId === null || companyId === '') {
      return { success: false, error: 'The "companyId" parameter is required.' };
    }

    if (typeof productId !== 'number') {
      return { success: false, error: 'The "productId" parameter must be a number.' };
    }

    if (typeof quantity !== 'number') {
      return { success: false, error: 'The "quantity" parameter must be a number.' };
    }

    try {
      const result = await client.patch<Record<string, unknown>>(
        `/companies/${companyId}/products/${productId}/`,
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

