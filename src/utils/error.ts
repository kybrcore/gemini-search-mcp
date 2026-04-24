import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function handleToolError(
  handler: () => Promise<CallToolResult>,
): Promise<CallToolResult> {
  return handler().catch((error) => {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error('[Search Error]', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error during search: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  });
}
