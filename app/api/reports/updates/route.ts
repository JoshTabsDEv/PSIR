import { NextRequest, NextResponse } from 'next/server';
import { addConnection, removeConnection } from '@/lib/sse-broadcast';

export async function GET(request: NextRequest) {
  // Create a new ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller: ReadableStreamDefaultController<any>) {
      // Add this connection to our active connections
      addConnection(controller);

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Connected to real-time updates' })}\n\n`);

      // Cleanup when connection closes
      request.signal.addEventListener('abort', () => {
        removeConnection(controller);
      });
    },
    cancel(controller: ReadableStreamDefaultController<any>) {
      removeConnection(controller);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
