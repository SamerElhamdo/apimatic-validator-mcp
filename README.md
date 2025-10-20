# @encryptosystem/mcp-django

A reusable, MCP-compatible SDK that connects to a Django REST API to orchestrate inventory automations from n8n or any Model Context Protocol client. The package exposes a Fastify-based MCP server with real-time SSE streams and modular tools for managing company products.

## Features

- 🔌 **Django-native MCP server** powered by Fastify with automatic CORS headers and SSE endpoints.
- 🧰 **Reusable tool library** for creating, listing, updating, and deleting products.
- ⚙️ **Configurable via environment variables** with first-class support for `.env` files.
- 🚀 **n8n-ready npm package** that can be executed directly with `npx @encryptosystem/mcp-django`.
- 📦 **TypeScript source** compiled with `tsup` to ship ESM output and generated type definitions.

## Installation

```bash
npm install @encryptosystem/mcp-django
```

### Local development

Clone the repository and install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file or provide the following environment variables before running the server:

```env
API_BASE_URL=https://api.encryptosystem.com/api
AUTH_BEARER_TOKEN=your-admin-bearer-token
COMPANY_ID=123
API_TIMEOUT=30000
PORT=3000
```

| Variable | Description |
|----------|-------------|
| `API_BASE_URL` | Base URL for the Django REST API (no trailing slash required). |
| `AUTH_BEARER_TOKEN` | Bearer token for authenticating requests. |
| `COMPANY_ID` | Company identifier used to scope product routes. |
| `API_TIMEOUT` | Optional request timeout in milliseconds (defaults to `30000`). |
| `PORT` | Optional Fastify server port (defaults to `3000`). |

## Available tools

Each tool is loaded dynamically from the `src/tools` directory and exposed over MCP:

| Tool | Method | Path | Description |
|------|--------|------|-------------|
| `createProduct` | `POST` | `/companies/{COMPANY_ID}/products/` | Create a new product. |
| `listProducts` | `GET` | `/companies/{COMPANY_ID}/products/` | List products with optional query filters. |
| `updateStock` | `PATCH` | `/companies/{COMPANY_ID}/products/{productId}/` | Update on-hand quantity for a product. |
| `deleteProduct` | `DELETE` | `/companies/{COMPANY_ID}/products/{productId}/` | Remove a product. |

## Usage

### Development server

Run the TypeScript entry point with hot reloading using `tsx`:

```bash
npm run dev
```

### Build for distribution

Compile the package to `dist/` with bundled type definitions:

```bash
npm run build
```

### NPX runner

Execute the published package without installing it globally:

```bash
npx @encryptosystem/mcp-django          # Starts the Fastify MCP server
npx @encryptosystem/mcp-django start    # Explicit start command
npx @encryptosystem/mcp-django list-tools
```

The CLI prints the registered endpoints and available tools after startup. Use `list-tools` to confirm the exported toolset before automating workflows.

## Publishing workflow

1. Log in to npm: `npm login`
2. Bump the version: `npm version patch`
3. Publish the package: `npm publish --access public`
4. Validate the CLI entry point: `npx @encryptosystem/mcp-django list-tools`

## License

MIT © Encryptosystem

