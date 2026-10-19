// Store active SSE connections
const connections = new Set<ReadableStreamDefaultController<any>>();

export function addConnection(controller: ReadableStreamDefaultController<any>) {
  connections.add(controller);
}

export function removeConnection(controller: ReadableStreamDefaultController<any>) {
  connections.delete(controller);
}

// Helper function to broadcast court submission events
export function broadcastCourtSubmission(reportNumber: string) {
  const message = JSON.stringify({
    type: 'COURT_SUBMISSION',
    reportNumber,
    timestamp: new Date().toISOString()
  });

  connections.forEach(controller => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      // Remove dead connections
      connections.delete(controller);
    }
  });
}

// Helper function to broadcast stats updates
export function broadcastStatsUpdate(stats: any) {
  const message = JSON.stringify({
    type: 'STATS_UPDATE',
    stats,
    timestamp: new Date().toISOString()
  });

  connections.forEach(controller => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      // Remove dead connections
      connections.delete(controller);
    }
  });
}
