import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export class MetricsService {
  private requestCounter: Counter<string>;
  private requestDuration: Histogram<string>;
  private errorCounter: Counter<string>;
  private activeConnections: Gauge<string>;
  private databaseQueries: Counter<string>;
  private databaseQueryDuration: Histogram<string>;

  constructor() {
    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics();

    // Request metrics
    this.requestCounter = new Counter({
      name: 'mcp_requests_total',
      help: 'Total number of MCP requests',
      labelNames: ['tool', 'status'],
    });

    this.requestDuration = new Histogram({
      name: 'mcp_request_duration_seconds',
      help: 'Duration of MCP requests in seconds',
      labelNames: ['tool'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });

    this.errorCounter = new Counter({
      name: 'mcp_errors_total',
      help: 'Total number of MCP errors',
      labelNames: ['tool', 'error_type'],
    });

    this.activeConnections = new Gauge({
      name: 'mcp_active_connections',
      help: 'Number of active MCP connections',
    });

    // Database metrics
    this.databaseQueries = new Counter({
      name: 'database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table'],
    });

    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
    });
  }

  incrementRequestCounter(tool: string, status: 'success' | 'error') {
    this.requestCounter.inc({ tool, status });
  }

  recordRequestDuration(tool: string, duration: number) {
    this.requestDuration.observe({ tool }, duration);
  }

  incrementErrorCounter(tool: string, errorType: string) {
    this.errorCounter.inc({ tool, error_type: errorType });
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  incrementDatabaseQuery(operation: string, table: string) {
    this.databaseQueries.inc({ operation, table });
  }

  recordDatabaseQueryDuration(operation: string, table: string, duration: number) {
    this.databaseQueryDuration.observe({ operation, table }, duration);
  }

  async getMetrics(format: 'prometheus' | 'json' = 'json') {
    if (format === 'prometheus') {
      const metrics = await register.metrics();
      return {
        content: [
          {
            type: 'text',
            text: metrics,
          },
        ],
      };
    }

    // JSON format
    const metrics = await register.getMetricsAsJSON();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(metrics, null, 2),
        },
      ],
    };
  }

  // Middleware for timing operations
  async timeOperation<T>(
    operation: string,
    table: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    try {
      this.incrementDatabaseQuery(operation, table);
      const result = await fn();
      const duration = (Date.now() - start) / 1000;
      this.recordDatabaseQueryDuration(operation, table, duration);
      return result;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      this.recordDatabaseQueryDuration(operation, table, duration);
      throw error;
    }
  }
}