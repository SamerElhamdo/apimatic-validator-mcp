import axios from 'axios';
import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const deleteProduct: ToolDefinition = {
  name: 'deleteProduct',
  description: 'Delete a product by identifier.',
  method: 'DELETE',
  path: '/companies/{companyId}/products/{productId}/',
  inputs: {
    companyId: 'number',
    productId: 'number',
  },
  async execute(params) {
    const client = getApiClient();
    const { companyId, productId } = params as { companyId?: unknown; productId?: unknown };

    if (companyId === undefined || companyId === null || companyId === '') {
      return { success: false, error: 'The "companyId" parameter is required.' };
    }

    if (typeof productId !== 'number') {
      return { success: false, error: 'The "productId" parameter must be a number.' };
    }

    try {
      await client.delete(`/companies/${companyId}/products/${productId}/`);
      return {
        success: true,
        message: `Product ${productId} deleted successfully`,
      };
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
        error: error instanceof Error ? error.message : 'Unknown error deleting product',
      };
    }
  },
};

export default deleteProduct;

