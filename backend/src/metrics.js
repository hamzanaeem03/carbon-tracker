// metrics.js - initialize and export prometheus metrics
const client = require('prom-client');

let httpRequestDuration;
let totalCarbon;
let activeUsers;
let activitiesTracked;

function initMetrics() {
  // Histogram for HTTP durations
  httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['route', 'method', 'status_code'],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]
  });

  // Gauge for total carbon tracked (kg)
  totalCarbon = new client.Gauge({
    name: 'total_carbon_footprint_kg',
    help: 'Total carbon footprint recorded (kg)'
  });

  // Gauge for active users
  activeUsers = new client.Gauge({
    name: 'active_users_total',
    help: 'Number of active users'
  });

  // Counter for activities (labeled by type)
  activitiesTracked = new client.Counter({
    name: 'activities_tracked_total',
    help: 'Number of activities tracked',
    labelNames: ['type']
  });

  // expose them so server can use
  module.exports.httpRequestDuration = httpRequestDuration;
  module.exports.totalCarbon = totalCarbon;
  module.exports.activeUsers = activeUsers;
  module.exports.activitiesTracked = activitiesTracked;
}

// ensure init if required
if (!module.exports.httpRequestDuration) {
  initMetrics();
}

module.exports.initMetrics = initMetrics;
module.exports.httpRequestDuration = module.exports.httpRequestDuration;
module.exports.totalCarbon = module.exports.totalCarbon;
module.exports.activeUsers = module.exports.activeUsers;
module.exports.activitiesTracked = module.exports.activitiesTracked;
