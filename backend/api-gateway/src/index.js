const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Define allowed origins based on environment
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL || 'https://your-domain.com',
          process.env.ADMIN_URL || 'https://admin.your-domain.com'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3005',
          'http://localhost:3006',
          'http://localhost:3007',
          'http://localhost:8080',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3005',
          'http://127.0.0.1:3006',
          'http://127.0.0.1:3007',
          'http://127.0.0.1:8080'
        ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours preflight cache
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'API Gateway',
    timestamp: new Date().toISOString()
  });
});

// Proxy routes

const patientServiceProxy = createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL || 'http://fondazione-crm-patient-service:3003',
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Patient Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    console.log(`[Patient Proxy] Auth header: ${req.headers.authorization ? 'PRESENT' : 'MISSING'}`);
    
    // Passa tutti gli headers di autenticazione
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log(`[Patient Proxy] Token forwarded: ${req.headers.authorization.substring(0, 20)}...`);
    } else {
      console.log(`[Patient Proxy] WARNING: No authorization header found`);
    }
    
    // Handle request body for PUT/POST requests (only for JSON, not multipart)
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      const bodyData = JSON.stringify(req.body);
      console.log(`[Patient Proxy] Body data length: ${bodyData.length}`);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    } else if (req.method === 'POST' || req.method === 'PUT') {
      console.log(`[Patient Proxy] Forwarding ${req.headers['content-type'] || 'unknown'} body as-is`);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Patient Proxy Response] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  },
  onError: (err, req, res) => {
    console.error(`[Patient Proxy Error] ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Patient Service unavailable', details: err.message });
    }
  }
});

const clinicalServiceProxy = createProxyMiddleware({
  target: process.env.CLINICAL_SERVICE_URL || 'http://clinical-service:3004',
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Clinical Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    console.log(`[Clinical Proxy] Auth header: ${req.headers.authorization ? 'PRESENT' : 'MISSING'}`);
    
    // Passa tutti gli headers di autenticazione
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log(`[Clinical Proxy] Token forwarded: ${req.headers.authorization.substring(0, 20)}...`);
    } else {
      console.log(`[Clinical Proxy] WARNING: No authorization header found`);
    }
    
    // Handle request body for PUT/POST requests (only for JSON, not multipart)
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      const bodyData = JSON.stringify(req.body);
      console.log(`[Clinical Proxy] Body data length: ${bodyData.length}`);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    } else if (req.method === 'POST' || req.method === 'PUT') {
      // For other content types (like multipart/form-data), let the original request body flow through
      console.log(`[Clinical Proxy] Forwarding ${req.headers['content-type'] || 'unknown'} body as-is`);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Clinical Proxy Response] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  },
  onError: (err, req, res) => {
    console.error(`[Clinical Proxy Error] ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Clinical Service unavailable', details: err.message });
    }
  }
});

const groupServiceProxy = createProxyMiddleware({
  target: process.env.GROUP_SERVICE_URL || 'http://group-service:3005',
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  pathRewrite: {
    '^/groups': '/groups'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Group Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    // Passa tutti gli headers di autenticazione
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // Handle request body for PUT/POST requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      const bodyData = JSON.stringify(req.body);
      console.log(`[Group Proxy] Body data length: ${bodyData.length}`);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error(`[Group Proxy Error] ${err.message}`);
    res.status(500).json({ error: 'Group Service unavailable' });
  }
});

const billingServiceProxy = createProxyMiddleware({
  target: process.env.BILLING_SERVICE_URL || 'http://fondazione-crm-billing-service:3006',
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Billing Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    console.log(`[Billing Proxy] Auth header: ${req.headers.authorization ? 'PRESENT' : 'MISSING'}`);
    
    // Passa tutti gli headers di autenticazione
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log(`[Billing Proxy] Token forwarded: ${req.headers.authorization.substring(0, 20)}...`);
    } else {
      console.log(`[Billing Proxy] WARNING: No authorization header found`);
    }
    
    // Handle request body for PUT/POST requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      const bodyData = JSON.stringify(req.body);
      console.log(`[Billing Proxy] Body data length: ${bodyData.length}`);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Billing Proxy Response] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  },
  onError: (err, req, res) => {
    console.error(`[Billing Proxy Error] ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Billing Service unavailable', details: err.message });
    }
  }
});

const auditServiceProxy = createProxyMiddleware({
  target: process.env.AUDIT_SERVICE_URL || 'http://audit-service:3006',
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Audit Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    console.log(`[Audit Proxy] Auth header: ${req.headers.authorization ? 'PRESENT' : 'MISSING'}`);
    
    // Passa tutti gli headers di autenticazione
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log(`[Audit Proxy] Token forwarded: ${req.headers.authorization.substring(0, 20)}...`);
    } else {
      console.log(`[Audit Proxy] WARNING: No authorization header found`);
    }
    
    // Handle request body for PUT/POST requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      const bodyData = JSON.stringify(req.body);
      console.log(`[Audit Proxy] Body data length: ${bodyData.length}`);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Audit Proxy Response] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  },
  onError: (err, req, res) => {
    console.error(`[Audit Proxy Error] ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Audit Service unavailable', details: err.message });
    }
  }
});

// Apply proxies
app.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auth' // Keep the /auth prefix since auth service expects it
  },
  timeout: 30000,
  proxyTimeout: 30000,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Auth Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    console.log(`[Auth Proxy] Target: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    console.log(`[Auth Proxy] Auth header: ${req.headers.authorization ? 'PRESENT' : 'MISSING'}`);
    
    // Passa tutti gli headers di autenticazione
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log(`[Auth Proxy] Token forwarded: ${req.headers.authorization.substring(0, 20)}...`);
    }
    
    // Re-stream body for POST and PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      const bodyData = JSON.stringify(req.body);
      console.log(`[Auth Proxy] Body data length: ${bodyData.length}`);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    } else if (req.method === 'POST' || req.method === 'PUT') {
      console.log(`[Auth Proxy] Forwarding ${req.headers['content-type'] || 'unknown'} body as-is`);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Auth Proxy Response] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  },
  onError: (err, req, res) => {
    console.error(`[Auth Proxy Error] ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Auth Service unavailable', details: err.message });
    }
  }
}));
app.use('/users', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/users': '/users' // Keep the /users prefix since auth service expects it
  },
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Users Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    console.log(`[Users Proxy] Auth header: ${req.headers.authorization ? 'PRESENT' : 'MISSING'}`);
    
    // Passa tutti gli headers di autenticazione
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
      console.log(`[Users Proxy] Token forwarded: ${req.headers.authorization.substring(0, 20)}...`);
    } else {
      console.log(`[Users Proxy] WARNING: No authorization header found`);
    }
    
    // Handle request body for PUT/POST requests (only for JSON, not multipart)
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      const bodyData = JSON.stringify(req.body);
      console.log(`[Users Proxy] Body data length: ${bodyData.length}`);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    } else if (req.method === 'POST' || req.method === 'PUT') {
      console.log(`[Users Proxy] Forwarding ${req.headers['content-type'] || 'unknown'} body as-is`);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Users Proxy Response] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  },
  onError: (err, req, res) => {
    console.error(`[Users Proxy Error] ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Auth Service unavailable', details: err.message });
    }
  }
}));

app.use('/roles', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/roles': '/roles' // Keep the /roles prefix since auth service expects it
  },
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Roles Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // Handle request body for PUT/POST requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      const bodyData = JSON.stringify(req.body);
      console.log(`[Roles Proxy] Body data length: ${bodyData.length}`);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error(`[Roles Proxy Error] ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Auth Service unavailable' });
    }
  }
}));
// System health endpoint
app.get('/system/health', async (req, res) => {
  try {
    const services = [
      { name: 'API Gateway', status: 'OK', responseTime: 0 },
      { name: 'Auth Service', url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3002' },
      { name: 'Patient Service', url: process.env.PATIENT_SERVICE_URL || 'http://fondazione-crm-patient-service:3003' },
      { name: 'Clinical Service', url: process.env.CLINICAL_SERVICE_URL || 'http://clinical-service:3004' },
      { name: 'Group Service', url: process.env.GROUP_SERVICE_URL || 'http://group-service:3005' },
      { name: 'Billing Service', url: process.env.BILLING_SERVICE_URL || 'http://fondazione-crm-billing-service:3006' },
      { name: 'Audit Service', url: process.env.AUDIT_SERVICE_URL || 'http://audit-service:3006' }
    ];

    const healthChecks = await Promise.allSettled(
      services.slice(1).map(async (service) => {
        const startTime = Date.now();
        try {
          const response = await fetch(`${service.url}/health`, {
            method: 'GET',
            timeout: 5000
          });
          const responseTime = Date.now() - startTime;
          return {
            name: service.name,
            status: response.ok ? 'OK' : 'ERROR',
            responseTime: responseTime,
            port: service.url.split(':').pop()
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'ERROR',
            responseTime: Date.now() - startTime,
            error: error.message
          };
        }
      })
    );

    const results = [
      services[0],
      ...healthChecks.map(result => result.status === 'fulfilled' ? result.value : result.reason)
    ];

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: results
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/patients', patientServiceProxy);
app.use('/documents', patientServiceProxy); // Document endpoints proxied to patient service
app.use('/clinical', clinicalServiceProxy);
app.use('/groups', groupServiceProxy);
app.use('/billing', billingServiceProxy);
app.use('/audit', auditServiceProxy);
app.use('/gdpr', auditServiceProxy);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
});
