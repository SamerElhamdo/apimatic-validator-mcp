import axios from 'axios';

import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const deleteProduct: ToolDefinition = {
  name: 'deleteProduct',
  description: 'Delete a product by identifier.',
  method: 'DELETE',

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

