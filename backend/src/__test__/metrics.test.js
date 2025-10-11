const { initMetrics } = require('../metrics');

describe('Metrics', () => {
  test('should initialize metrics without error', () => {
    expect(() => {
      initMetrics();
    }).not.toThrow();
  });

  test('should export required metrics', () => {
    const metrics = require('../metrics');
    expect(metrics.httpRequestDuration).toBeDefined();
    expect(metrics.totalCarbon).toBeDefined();
    expect(metrics.activeUsers).toBeDefined();
    expect(metrics.activitiesTracked).toBeDefined();
  });
});
