# Gemini Search MCP Server

An MCP (Model Context Protocol) server providing real-time Google Search via the Gemini API with search grounding.

## Features

- **Real-time web search** with Google Search grounding via Gemini API
- **Citation support** with UTF-8 correct byte-level positioning (handles CJK characters)
- **4 authentication methods**: Gemini API Key, Vertex AI Express Mode, ADC, Service Account
- Compatible with Claude Desktop, Codex CLI, and other MCP clients

## Prerequisites

- Node.js 18+

## Installation

### From npm (Recommended)

```bash
npm install -g @kybrcore/gemini-search-mcp
```

### From Source

```bash
git clone https://github.com/kybrcore/gemini-search-mcp.git
cd gemini-search-mcp
npm install
npm run build
```

## Usage

### CLI

```bash
gemini-search "your search query"
```

### MCP Server

Configure in your MCP client (Claude Desktop, Codex CLI, etc.):

```json
{
  "mcpServers": {
    "gemini-search": {
      "command": "npx",
      "args": ["@kybrcore/gemini-search-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Authentication

> **Note**: Vertex AI was renamed to **Gemini Enterprise Agent Platform** at Google Cloud Next 2026 (April 2026). The API endpoints and functionality remain the same.

### Method 1: Gemini API Key (Simplest)

Get your key from [Google AI Studio](https://aistudio.google.com/api-keys).

- **Free Tier**: 500 grounded searches/day, no credit card needed.
- **Paid Tier 1**: 1,500 grounded searches/day. Requires setting up billing (Prepay, min $10). Note: AI Studio Prepay credits are separate from Google Cloud billing credits — you cannot use Google Cloud's $300 free credits or existing Cloud billing balance for AI Studio. Prepay credits expire after 12 months. At Tier 3 you can switch to Postpay (pay-as-you-go).

```json
{
  "mcpServers": {
    "gemini-search": {
      "command": "npx",
      "args": ["@kybrcore/gemini-search-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-gemini-api-key"
      }
    }
  }
}
```

### Method 2: Vertex AI Express Mode (Recommended for Cloud Users)

Uses Google Cloud billing ($300 free credits). Get an API key from [Google Cloud Agent Platform](https://console.cloud.google.com/agent-platform/overview).

```json
{
  "mcpServers": {
    "gemini-search": {
      "command": "npx",
      "args": ["@kybrcore/gemini-search-mcp"],
      "env": {
        "USE_VERTEX_AI": "true",
        "VERTEX_EXPRESS_MODE_API_KEY": "your-vertex-express-api-key"
      }
    }
  }
}
```

### Method 3: Vertex AI with ADC

Requires [gcloud CLI](https://cloud.google.com/cli). One-time setup:

```bash
gcloud auth application-default login
gcloud config set project your-project-id
```

```json
{
  "mcpServers": {
    "gemini-search": {
      "command": "npx",
      "args": ["@kybrcore/gemini-search-mcp"],
      "env": {
        "USE_VERTEX_AI": "true",
        "GOOGLE_CLOUD_PROJECT": "your-project-id",
        "GOOGLE_CLOUD_LOCATION": "us-central1"
      }
    }
  }
}
```

### Method 4: Vertex AI with Service Account JSON Key

Create a service account in [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts), grant it `Vertex AI User` role, and download the JSON key.

```json
{
  "mcpServers": {
    "gemini-search": {
      "command": "npx",
      "args": ["@kybrcore/gemini-search-mcp"],
      "env": {
        "USE_VERTEX_AI": "true",
        "GOOGLE_CLOUD_PROJECT": "your-project-id",
        "GOOGLE_CLOUD_LOCATION": "us-central1",
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account-key.json"
      }
    }
  }
}
```

## Tools

### `gemini_search`

Performs a grounded web search with citations and source URIs.

```json
{ "query": "Who won Euro 2024?" }
```

Returns:
```
Web search results for "Who won Euro 2024?":

Spain won Euro 2024, defeating England 2-1 in the final held in Berlin.[1] ...

Sources:
[1] wikipedia.org (https://...)
[2] aljazeera.com (https://...)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | AI Studio Gemini API key | - |
| `VERTEX_EXPRESS_MODE_API_KEY` | Vertex AI Express Mode API key | - |
| `USE_VERTEX_AI` | Use Vertex AI endpoint | `false` |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID (for ADC/Service Account) | - |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI location | `us-central1` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON key | - |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.5-flash` |

## Free Tier Limits

Default model (`gemini-2.5-flash`) grounding quotas:

| Method | Grounded Searches/day | Billing |
|--------|----------------------|---------|
| AI Studio Free Tier | 500 | No billing required |
| AI Studio Paid Tier (any) | 1,500 | Prepay or Postpay |
| Vertex AI (any method) | 1,500 | Google Cloud billing |

Notes:
- Paid Tier grounding quota is the same across Tier 1/2/3. Higher tiers give higher RPM/TPM, not more free grounding.
- AI Studio Paid Tier defaults to Prepay. AI Studio Prepay credits are **separate from and cannot be used with** Google Cloud billing account credits. Google Cloud credits (including the $300 free trial) only work with Vertex AI / Agent Platform services.
- After free quota is exceeded: $35/1,000 grounded prompts (same price for both AI Studio and Vertex AI).

## Development

```bash
npm run build      # Compile TypeScript
npm run dev        # Run with tsx (development)
npm run dev:cli    # CLI mode for testing
npm test           # Run unit tests
npm run test:e2e   # Run e2e tests (requires .env with API key)
```

## Testing

### Unit Test

```bash
npm test
```

### E2E Test

Create a `.env` file in the project root (already in `.gitignore`). Set the same environment variables as your chosen authentication method in [Authentication](#authentication) above.

Then run:

```bash
npm run test:e2e
```

The test will start the MCP server, list tools, and perform a search query.

### Codex CLI

```bash
# Add MCP server
codex mcp add gemini-search --env GEMINI_API_KEY=your-key -- node /path/to/dist/index.js

# Test
codex exec --dangerously-bypass-approvals-and-sandbox "what is MCP protocol?"
```

### Claude Code

```bash
claude mcp add gemini-search -e GEMINI_API_KEY=your-key -- node /path/to/dist/index.js
```

### OpenCode

Add to `~/.config/opencode/config.json`:

```json
{
  "mcp": {
    "gemini-search": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-key"
      }
    }
  }
}
```

### Kilo / Plik

Refer to the client's MCP server configuration docs, using:

- **Command**: `node`
- **Args**: `/path/to/dist/index.js`
- **Env**: set the authentication environment variable per [Authentication](#authentication)

## CLI Usage

```bash
# Set environment variables, then:
npm run dev:cli -- "your search query"
```

## License

MIT


