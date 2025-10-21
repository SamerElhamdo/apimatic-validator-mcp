import axios from 'axios';
import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const listProducts: ToolDefinition = {
  name: 'listProducts',
  description: 'List products for the provided company.',
  method: 'GET',
  path: '/companies/{companyId}/products/',
  inputs: {
    companyId: 'number',
  },
  async execute(params) {
    const client = getApiClient();
    const { companyId, ...queryParams } = params as Record<string, unknown>;

    if (companyId === undefined || companyId === null || companyId === '') {
      return { success: false, error: 'The "companyId" parameter is required.' };
    }

    try {
      const result = await client.get<Record<string, unknown>[]>(
        `/companies/${companyId}/products/`,
        queryParams,
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
        error: error instanceof Error ? error.message : 'Unknown error listing products',
      };
    }
  },
};

export default listProducts;

