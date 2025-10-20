#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { getConfig } from './config.js';
import { McpServerApp, ToolDefinition } from './server.js';

async function discoverTools(): Promise<ToolDefinition[]> {
  const toolsDirUrl = new URL('./tools/', import.meta.url);
  const toolsDirPath = fileURLToPath(toolsDirUrl);
  const entries = await readdir(toolsDirPath);
  entries.sort();
  const definitions: ToolDefinition[] = [];

  for (const entry of entries) {
    if (!/\.(t|j)sx?$/.test(entry) || entry.endsWith('.d.ts')) {
      continue;
    }

    const moduleCandidates = [entry];

    if (entry.endsWith('.ts')) {
      moduleCandidates.push(entry.replace(/\.ts$/, '.js'));
    }

    let toolModule: Record<string, unknown> | null = null;

    for (const candidate of moduleCandidates) {
      const moduleUrl = new URL(candidate, toolsDirUrl);
      try {
        toolModule = await import(moduleUrl.href);
        break;
      } catch (error) {
        if (candidate === moduleCandidates[moduleCandidates.length - 1]) {
          throw error;
        }
      }
    }

    if (!toolModule) {
      continue;
    }

    const tool = (toolModule.default ?? toolModule) as ToolDefinition;

    if (tool?.name) {
      definitions.push(tool);
    }
  }

  return definitions;
}

async function listTools(tools: ToolDefinition[]): Promise<void> {
  if (!tools.length) {
    console.log('No tools registered.');
    return;
  }

  console.log('Available MCP tools:');
  for (const tool of tools) {
    console.log(`- ${tool.name} (${tool.method} ${tool.path})`);
    if (tool.description) {
      console.log(`  ${tool.description}`);
    }
  }
}

async function startServer(command: string): Promise<void> {
  const config = getConfig();
  const tools = await discoverTools();

  const server = new McpServerApp({ config });
  server.registerTools(tools);
  await server.init();

  if (command === 'list-tools') {
    await listTools(tools);
    return;
  }

  if (command !== 'start') {
    console.warn(`Unknown command "${command}". Starting server instead.`);
  }

  await server.start();
}

startServer(process.argv[2] ?? 'start').catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

