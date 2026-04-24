# Gemini Search MCP Server

An MCP (Model Context Protocol) server providing real-time Google Search via the Gemini API with search grounding.

## Features

- **Real-time web search** with Google Search grounding via Gemini API
- **Citation support** with UTF-8 correct byte-level positioning (handles CJK characters)
- **4 authentication methods**: Gemini API Key, Vertex AI Express Mode, ADC, Service Account
- Compatible with Claude Code, Codex CLI, OpenCode, and other MCP clients

## Prerequisites

- Node.js 20+

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

Configure in your MCP client:

#### Codex CLI

```bash
codex mcp add gemini-search --env GEMINI_API_KEY=your-key -- npx @kybrcore/gemini-search-mcp
```

#### Claude Code

```bash
claude mcp add gemini-search -e GEMINI_API_KEY=your-key -- npx @kybrcore/gemini-search-mcp
```

#### OpenCode

Add to `~/.config/opencode/config.json`:

```json
{
  "mcp": {
    "gemini-search": {
      "command": "npx",
      "args": ["@kybrcore/gemini-search-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-key"
      }
    }
  }
}
```

#### Other MCP Clients

Refer to your client's MCP configuration documentation. Use:

- **Command**: `npx`
- **Args**: `["@kybrcore/gemini-search-mcp"]`
- **Env**: set authentication variables per [Authentication](#authentication)

## Authentication

> **Note**: Google Cloud positions **Gemini Enterprise Agent Platform** as the evolution of Vertex AI. Moving forward, Vertex AI services and roadmap updates are delivered through Agent Platform.

### Method 1: Gemini API Key (Simplest)

Get your key from [Google AI Studio](https://aistudio.google.com/api-keys).
Billing, quotas, and eligibility vary by tier and may change. See the official [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) and [billing](https://ai.google.dev/gemini-api/docs/billing) docs for current details.

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

For new users, express mode offers a 90-day free trial without requiring billing information up front. Get an API key from [Google Cloud Agent Platform](https://console.cloud.google.com/agent-platform/overview).
Availability, billing, and quotas may change. See the official [Vertex AI in express mode overview](https://cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/overview) for current details.

```json
{
  "mcpServers": {
    "gemini-search": {
      "command": "npx",
      "args": ["@kybrcore/gemini-search-mcp"],
      "env": {
        "USE_VERTEX_AI": "true",
        "VERTEX_EXPRESS_MODE_API_KEY": "your-vertex-express-mode-api-key"
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

Best used for:

- Broad or open-ended queries where a synthesized answer is more useful than a list of links
- News, background research, historical topics, and general fact-finding
- Cases where inline citations and source URIs help with quick verification

Less suitable for:

- Finding exact official docs, API references, or product specification pages
- Queries where raw search result ordering matters more than an AI summary
- Exhaustive webpage discovery, page-by-page comparison, or pinpointing one exact URL

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

## Pricing & Quotas

Pricing, quotas, and availability vary by model, tier, and platform. Check [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing), and [Vertex AI pricing](https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing) for current details.

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

## CLI Usage

```bash
# Set environment variables, then:
npm run dev:cli -- "your search query"
```

## License

MIT
