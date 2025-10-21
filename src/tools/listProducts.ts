import axios from 'axios';

import { getApiClient } from '../httpClient.js';
import { ToolDefinition } from '../server.js';

const listProducts: ToolDefinition = {
  name: 'listProducts',

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

