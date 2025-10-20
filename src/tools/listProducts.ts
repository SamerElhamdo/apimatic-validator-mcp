import axios from 'axios';
import { getConfig } from '../config.js';
import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const listProducts: ToolDefinition = {
  name: 'listProducts',
  description: 'List products for the configured company.',
  method: 'GET',
  path: '/companies/{COMPANY_ID}/products/',
  inputs: {},
  async execute(params) {
    const config = getConfig();
    const client = getApiClient();

    try {
      const result = await client.get<Record<string, unknown>[]>(
        `/companies/${config.companyId}/products/`,
        params as Record<string, unknown>,
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

