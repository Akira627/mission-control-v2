#!/usr/bin/env node

/**
 * Mission Control v2 Local Server
 * 
 * A lightweight Node.js server to serve the Mission Control dashboard
 * and fix CORS issues when running from file:// URLs.
 * 
 * Port: 8899
 * URL: http://localhost:8899/
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8899;
const HOST = 'localhost';
const DASHBOARD_FILE = 'mission-control-v2.html';
const PROJECTS_DATA_FILE = 'projects-data.json';
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.md': 'text/markdown'
};

// Server state
const serverState = {
  startTime: new Date(),
  requestCount: 0,
  lastDataRefresh: null
};

/**
 * Get file extension
 */
function getExtname(filePath) {
  return path.extname(filePath).toLowerCase();
}

/**
 * Serve static file
 */
function serveStaticFile(req, res, filePath) {
  const ext = getExtname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        serve404(req, res);
      } else {
        serve500(req, res, err);
      }
    } else {
      // Set CORS headers to allow all origins (for local development)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
      
      serverState.requestCount++;
      console.log(`[${new Date().toISOString()}] Served: ${filePath} (${content.length} bytes)`);
    }
  });
}

/**
 * Serve 404 Not Found
 */
function serve404(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 Not Found</h1><p>The requested resource was not found.</p>');
  console.log(`[${new Date().toISOString()}] 404: ${req.url}`);
}

/**
 * Serve 500 Internal Server Error
 */
function serve500(req, res, err) {
  res.writeHead(500, { 'Content-Type': 'text/html' });
  res.end('<h1>500 Internal Server Error</h1><p>Something went wrong on the server.</p>');
  console.error(`[${new Date().toISOString()}] 500: ${req.url} - ${err.message}`);
}

/**
 * Serve API endpoints
 */
function serveAPI(req, res, pathname) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    res.writeHead(204);
    res.end();
    return;
  }
  
  switch (pathname) {
    case '/api/status':
      serveStatus(req, res);
      break;
    
    case '/api/data':
      if (req.method === 'GET') {
        serveData(req, res);
      } else if (req.method === 'POST') {
        saveData(req, res);
      } else {
        serve404(req, res);
      }
      break;
    
    case '/api/weather':
      serveWeather(req, res);
      break;
    
    case '/api/activity':
      if (req.method === 'GET') {
        serveActivity(req, res);
      } else if (req.method === 'POST') {
        logActivity(req, res);
      } else {
        serve404(req, res);
      }
      break;
    
    default:
      serve404(req, res);
  }
}

/**
 * Serve server status
 */
function serveStatus(req, res) {
  const status = {
    status: 'online',
    uptime: Math.floor((new Date() - serverState.startTime) / 1000),
    requestCount: serverState.requestCount,
    lastDataRefresh: serverState.lastDataRefresh,
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  };
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(status, null, 2));
}

/**
 * Serve projects data
 */
function serveData(req, res) {
  const dataPath = path.join(__dirname, PROJECTS_DATA_FILE);
  
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Return empty data structure if file doesn't exist
        const emptyData = {
          lastUpdated: new Date().toISOString(),
          source: 'server',
          projectCount: 0,
          projects: {}
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(emptyData, null, 2));
      } else {
        serve500(req, res, err);
      }
    } else {
      try {
        const jsonData = JSON.parse(data);
        serverState.lastDataRefresh = new Date().toISOString();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(jsonData, null, 2));
        
        console.log(`[${new Date().toISOString()}] Served projects data: ${jsonData.projectCount} projects`);
      } catch (parseErr) {
        serve500(req, res, parseErr);
      }
    }
  });
}

/**
 * Save data (for future use)
 */
function saveData(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const dataPath = path.join(__dirname, 'mc-data.json');
      
      fs.writeFile(dataPath, JSON.stringify(data, null, 2), err => {
        if (err) {
          serve500(req, res, err);
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Data saved' }));
          
          console.log(`[${new Date().toISOString()}] Saved data to mc-data.json`);
        }
      });
    } catch (err) {
      serve500(req, res, err);
    }
  });
}

/**
 * Serve weather data (placeholder)
 */
function serveWeather(req, res) {
  const weather = {
    location: 'Lafayette, LA',
    temperature: 72,
    condition: 'Sunny',
    feels_like: 74,
    humidity: 65,
    wind_speed: 5,
    timestamp: new Date().toISOString()
  };
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(weather, null, 2));
}

/**
 * Serve activity log
 */
function serveActivity(req, res) {
  const activityPath = path.join(__dirname, 'mc-activity.json');
  
  fs.readFile(activityPath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Return empty activity array if file doesn't exist
        const emptyActivity = {
          activities: [],
          count: 0,
          timestamp: new Date().toISOString()
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(emptyActivity, null, 2));
      } else {
        serve500(req, res, err);
      }
    } else {
      try {
        const activityData = JSON.parse(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(activityData, null, 2));
      } catch (parseErr) {
        serve500(req, res, parseErr);
      }
    }
  });
}

/**
 * Log activity (for future use)
 */
function logActivity(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const activity = JSON.parse(body);
      const activityPath = path.join(__dirname, 'mc-activity.json');
      
      // Read existing activities
      fs.readFile(activityPath, 'utf8', (err, data) => {
        let activities = { activities: [], count: 0 };
        
        if (!err) {
          try {
            activities = JSON.parse(data);
          } catch (parseErr) {
            // If file is corrupted, start fresh
            console.warn(`[${new Date().toISOString()}] Activity file corrupted, starting fresh`);
          }
        }
        
        // Add new activity
        activity.timestamp = new Date().toISOString();
        activity.id = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        activities.activities.unshift(activity);
        activities.activities = activities.activities.slice(0, 100); // Keep only last 100
        activities.count = activities.activities.length;
        activities.lastUpdated = new Date().toISOString();
        
        // Save back to file
        fs.writeFile(activityPath, JSON.stringify(activities, null, 2), err => {
          if (err) {
            serve500(req, res, err);
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, id: activity.id }));
            
            console.log(`[${new Date().toISOString()}] Logged activity: ${activity.action || 'unknown'}`);
          }
        });
      });
    } catch (err) {
      serve500(req, res, err);
    }
  });
}

/**
 * Main request handler
 */
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);
  
  // Handle API routes
  if (pathname.startsWith('/api/')) {
    serveAPI(req, res, pathname);
    return;
  }
  
  // Handle root path - serve dashboard
  if (pathname === '/' || pathname === '/index.html') {
    serveStaticFile(req, res, path.join(__dirname, DASHBOARD_FILE));
    return;
  }
  
  // Handle other static files
  const filePath = path.join(__dirname, pathname === '/' ? DASHBOARD_FILE : pathname);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file doesn't exist, try serving the dashboard
      if (pathname === '/mission-control-v2.html') {
        serveStaticFile(req, res, path.join(__dirname, DASHBOARD_FILE));
      } else {
        serve404(req, res);
      }
    } else {
      serveStaticFile(req, res, filePath);
    }
  });
}

/**
 * Create and start server
 */
function startServer() {
  const server = http.createServer(handleRequest);
  
  server.listen(PORT, HOST, () => {
    console.log(`╔══════════════════════════════════════════════════════════╗`);
    console.log(`║ Mission Control v2 Server                               ║`);
    console.log(`║                                                        ║`);
    console.log(`║ Server running at: http://${HOST}:${PORT}/             ║`);
    console.log(`║ Dashboard: http://${HOST}:${PORT}/mission-control-v2.html ║`);
    console.log(`║ API Status: http://${HOST}:${PORT}/api/status          ║`);
    console.log(`║ API Data: http://${HOST}:${PORT}/api/data              ║`);
    console.log(`║                                                        ║`);
    console.log(`║ Press Ctrl+C to stop the server                        ║`);
    console.log(`╚══════════════════════════════════════════════════════════╝`);
    console.log('');
    console.log(`[${new Date().toISOString()}] Server started successfully`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(`\n[${new Date().toISOString()}] Shutting down server...`);
    server.close(() => {
      console.log(`[${new Date().toISOString()}] Server stopped`);
      process.exit(0);
    });
  });
  
  // Handle errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[${new Date().toISOString()}] ERROR: Port ${PORT} is already in use`);
      console.error(`[${new Date().toISOString()}] Try: kill -9 $(lsof -ti:${PORT})`);
      process.exit(1);
    } else {
      console.error(`[${new Date().toISOString()}] Server error:`, err);
      process.exit(1);
    }
  });
}

// Start the server
startServer();