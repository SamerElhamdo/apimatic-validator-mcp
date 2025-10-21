import Fastify, { FastifyInstance, FastifyReply } from 'fastify';
import { Readable } from 'node:stream';
import { getConfig, AppConfig } from './config.js';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface ToolExecuteParams {
  [key: string]: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  method: HttpMethod;
  path: string;
  inputs: Record<string, unknown>;
  execute: (params: ToolExecuteParams) => Promise<Record<string, unknown>>;
}

export interface ServerOptions {
  config?: AppConfig;
}

interface ToolRegistryEntry {
  definition: ToolDefinition;
}

export class SSEManager {
  private streams: Map<string, Set<FastifyReply>> = new Map();

  addClient(companyId: string, reply: FastifyReply): void {
    if (!this.streams.has(companyId)) {
      this.streams.set(companyId, new Set());
    }

    this.streams.get(companyId)!.add(reply);
  }

  removeClient(companyId: string, reply: FastifyReply): void {
    const clients = this.streams.get(companyId);
    if (!clients) {
      return;
    }

    clients.delete(reply);

    if (clients.size === 0) {
      this.streams.delete(companyId);
    }
  }

  broadcast(companyId: string, event: string, data: Record<string, unknown>): void {
    const clients = this.streams.get(companyId);
    if (!clients) {
      return;
    }

    const payload = `event: ${event}\ndata: ${JSON.stringify({ ...data, companyId, timestamp: new Date().toISOString() })}\n\n`;

    for (const reply of clients) {
      reply.raw.write(payload);
    }
  }

  getActiveCompanies(): string[] {
    return Array.from(this.streams.keys());
  }
}

export class McpServerApp {
  private readonly config: AppConfig;
  private readonly fastify: FastifyInstance;
  private readonly tools: Map<string, ToolRegistryEntry> = new Map();
  private readonly sseManager: SSEManager;

  constructor(options?: ServerOptions) {
    this.config = options?.config ?? getConfig();
    this.fastify = Fastify({ logger: false });
    this.sseManager = new SSEManager();
  }

  async init(): Promise<void> {
    this.fastify.addHook('onRequest', (request, reply, done) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

      if (request.method === 'OPTIONS') {
        reply.status(204).send();
        return;
      }

      done();
    });

    this.fastify.options('*', async (request, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      reply.status(204);
      return reply.send();
    });

    this.fastify.get('/health', async () => ({
      status: 'ok',
      tools: this.listTools(),
      timestamp: new Date().toISOString(),
    }));

    this.fastify.get('/sse/:companyId', async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.flushHeaders();

      this.sseManager.addClient(companyId, reply);

      const keepAlive = setInterval(() => {
        reply.raw.write(`event: keepalive\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
      }, 1000 * 15);

      request.raw.on('close', () => {
        clearInterval(keepAlive);
        this.sseManager.removeClient(companyId, reply);
      });

      return reply.send(new Readable({ read() {} }));
    });

    this.fastify.get('/tools', async () => ({
      tools: this.listTools(),
    }));

    this.fastify.post('/tools/:name', async (request, reply) => {
      const { name } = request.params as { name: string };
      const tool = this.tools.get(name);

      if (!tool) {
        reply.status(404);
        return { error: `Tool '${name}' not found` };
      }

      try {
        const payload = (request.body ?? {}) as ToolExecuteParams;
        return await tool.definition.execute(payload);
      } catch (error) {
        reply.status(500);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error executing tool',
        };
      }
    });
  }

  registerTool(definition: ToolDefinition): void {
    this.tools.set(definition.name, { definition });
  }

  registerTools(definitions: ToolDefinition[]): void {
    definitions.forEach((definition) => this.registerTool(definition));
  }

  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(({ definition }) => definition);
  }

  async executeTool(name: string, params: ToolExecuteParams): Promise<Record<string, unknown>> {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    return tool.definition.execute(params);
  }

  notify(companyId: string, event: string, data: Record<string, unknown>): void {
    this.sseManager.broadcast(companyId, event, data);
  }

  async start(): Promise<void> {
    await this.fastify.listen({ port: this.config.port, host: '0.0.0.0' });
    this.printBanner();
  }

  async stop(): Promise<void> {
    await this.fastify.close();
  }

  private printBanner(): void {
    const endpoints = [`GET  /health`, `GET  /tools`, `POST /tools/:name`, `GET  /sse/:companyId`];

    // eslint-disable-next-line no-console
    console.log('\n🛠️  MCP Django Server Ready');
    // eslint-disable-next-line no-console
    console.log(`➡️  Base URL: ${this.config.apiBaseUrl}`);
    // eslint-disable-next-line no-console
    console.log('📡  Available endpoints:');
    endpoints.forEach((endpoint) => {
      // eslint-disable-next-line no-console
      console.log(`   • ${endpoint}`);
    });
    // eslint-disable-next-line no-console
    console.log('🧰  Registered tools:');
    this.listTools().forEach((tool) => {
      // eslint-disable-next-line no-console
      console.log(`   • ${tool.name} (${tool.method} ${tool.path})`);
    });
  }
}

