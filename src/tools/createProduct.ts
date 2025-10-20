import axios from 'axios';
import { getConfig } from '../config.js';
import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const requiredFields = ['name', 'price', 'quantity'] as const;
const optionalFields = [
  'sku',
  'unit',
  'measurement',
  'description',
  'cost_price',
  'wholesale_price',
  'retail_price',
  'category_id',
  'category_name',
] as const;

type CreateProductPayload = Record<(typeof requiredFields)[number] | (typeof optionalFields)[number], unknown>;

function pickCreateProductPayload(params: Record<string, unknown>): CreateProductPayload {
  const payload: Record<string, unknown> = {};

  for (const field of [...requiredFields, ...optionalFields]) {
    if (params[field] !== undefined) {
      payload[field] = params[field];
    }
  }

  for (const field of requiredFields) {
    if (payload[field] === undefined) {
      throw new Error(`Missing required field '${field}'`);
    }
  }

  return payload as CreateProductPayload;
}

const createProduct: ToolDefinition = {
  name: 'createProduct',
  description: 'Create a new product for the configured company.',
  method: 'POST',
  path: '/companies/{COMPANY_ID}/products/',
  inputs: {
    name: 'string',
    price: 'number',
    quantity: 'number',
    sku: 'string?',
    unit: 'string?',
    measurement: 'string?',
    description: 'string?',
    cost_price: 'number?',
    wholesale_price: 'number?',
    retail_price: 'number?',
    category_id: 'number?',
    category_name: 'string?',
  },
  async execute(params) {
    const config = getConfig();
    const client = getApiClient();

    try {
      const payload = pickCreateProductPayload(params);
      const result = await client.post<Record<string, unknown>>(
        `/companies/${config.companyId}/products/`,
        payload,
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
        error: error instanceof Error ? error.message : 'Unknown error creating product',
      };
    }
  },
};

export default createProduct;

