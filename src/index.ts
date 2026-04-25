#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

// ── Upload helper ──────────────────────────────────────────────────────────────

async function uploadToOxo(filePath: string): Promise<string> {
    const absolutePath = path.resolve(filePath);

    // Verify file exists and is readable
    const stat = await fs.stat(absolutePath);
    if (!stat.isFile()) {
        throw new Error(`"${absolutePath}" is not a file.`);
    }

    const fileData = await fs.readFile(absolutePath);
    const fileName = path.basename(absolutePath);

    const formData = new FormData();
    formData.append('file', new Blob([fileData]), fileName);

    const response = await fetch('https://0x0.st', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Upload failed (HTTP ${response.status}): ${body.trim()}`);
    }

    const url = (await response.text()).trim();
    return url;
}

// ── MCP Server ─────────────────────────────────────────────────────────────────

const server = new McpServer({
    name: '0x0.st File Sharing',
    version: '1.0.0',
    title: 'Temporary File Sharing',
    description: 'Upload files to 0x0.st for temporary sharing URLs.',
    icons: [{ src: 'https://raw.githubusercontent.com/andreasjhagen/Cynosure-MCPs/main/mcp-nullpointer-file-share/icon.png', mimeType: 'image/png' }],
});

// Tool: share_file
server.registerTool(
    'share_file',
    {
        description: 'Upload a file to 0x0.st and return a temporary sharing URL. Files are retained based on size (min 30 days, max 365 days). Max file size is 512 MiB.',
        inputSchema: z.object({
            filePath: z.string().describe('Absolute or relative path to the file to upload'),
        }),
    },
    async ({ filePath }) => {
        try {
            const url = await uploadToOxo(filePath);
            return {
                content: [
                    {
                        type: 'text',
                        text: `File uploaded successfully!\n\nURL: ${url}\n\nNote: The file is temporary and will expire based on its size (smaller files last longer, up to 365 days).`,
                    },
                ],
            };
        } catch (err) {
            return {
                content: [{ type: 'text', text: `Error uploading file: ${(err as Error).message}` }],
                isError: true,
            };
        }
    }
);

// ── Start ──────────────────────────────────────────────────────────────────────

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('nullpointer-file-share MCP server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
