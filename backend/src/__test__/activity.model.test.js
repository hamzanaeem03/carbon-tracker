const Activity = require('../models/activity');

describe('Activity Model', () => {
  test('should have required schema fields', () => {
    const { schema } = Activity;
    expect(schema.paths.userId).toBeDefined();
    expect(schema.paths.type).toBeDefined();
    expect(schema.paths.co2Kg).toBeDefined();
    expect(schema.paths.timestamp).toBeDefined();
  });

  test('userId should be required', () => {
    const { schema } = Activity;
    expect(schema.paths.userId.isRequired).toBeDefined();
  });

  test('type should be required', () => {
    const { schema } = Activity;
    expect(schema.paths.type.isRequired).toBeDefined();
  });
});
