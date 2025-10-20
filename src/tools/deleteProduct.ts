import axios from 'axios';
import { getConfig } from '../config.js';
import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const deleteProduct: ToolDefinition = {
  name: 'deleteProduct',
  description: 'Delete a product by identifier.',
  method: 'DELETE',
  path: '/companies/{COMPANY_ID}/products/{productId}/',
  inputs: {
    productId: 'number',
  },
  async execute(params) {
    const config = getConfig();
    const client = getApiClient();

    const productId = params.productId as number | undefined;

    if (!productId) {
      return { success: false, error: 'The "productId" parameter is required.' };
    }

    try {
      await client.delete(`/companies/${config.companyId}/products/${productId}/`);
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

