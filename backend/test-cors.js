#!/usr/bin/env node

/**
 * CORS Testing Script
 * Tests if your backend properly allows requests from your frontend domain
 */

const https = require('https');

const BACKEND_URL = 'e-commerce-rbac-platform-backend.vercel.app';
const FRONTEND_ORIGIN = 'https://e-commerce-rbac-platform.appwrite.network';
const TEST_ENDPOINT = '/api/products?page=1&limit=1';

console.log('🔍 Testing CORS Configuration...\n');
console.log(`Backend: https://${BACKEND_URL}`);
console.log(`Frontend Origin: ${FRONTEND_ORIGIN}`);
console.log(`Test Endpoint: ${TEST_ENDPOINT}\n`);

const options = {
  hostname: BACKEND_URL,
  path: TEST_ENDPOINT,
  method: 'GET',
  headers: {
    'Origin': FRONTEND_ORIGIN,
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('\n📋 Response Headers:');
  console.log('─'.repeat(50));
  
  const corsHeaders = {
    'access-control-allow-origin': 'Access-Control-Allow-Origin',
    'access-control-allow-credentials': 'Access-Control-Allow-Credentials',
    'access-control-allow-methods': 'Access-Control-Allow-Methods',
    'access-control-allow-headers': 'Access-Control-Allow-Headers'
  };

  let hasAllCorsHeaders = true;
  
  for (const [key, name] of Object.entries(corsHeaders)) {
    if (res.headers[key]) {
      console.log(`✅ ${name}: ${res.headers[key]}`);
    } else {
      console.log(`❌ ${name}: NOT FOUND`);
      hasAllCorsHeaders = false;
    }
  }

  console.log('\n' + '─'.repeat(50));
  
  if (hasAllCorsHeaders && res.headers['access-control-allow-origin'] === FRONTEND_ORIGIN) {
    console.log('\n✅ CORS is properly configured!');
    console.log('✅ Your frontend should be able to make requests to the backend.');
  } else {
    console.log('\n❌ CORS configuration issues detected!');
    console.log('\n🔧 Fixes needed:');
    
    if (!res.headers['access-control-allow-origin']) {
      console.log('  1. Add Access-Control-Allow-Origin header to responses');
    } else if (res.headers['access-control-allow-origin'] !== FRONTEND_ORIGIN) {
      console.log(`  1. Update Access-Control-Allow-Origin to: ${FRONTEND_ORIGIN}`);
    }
    
    if (!res.headers['access-control-allow-credentials']) {
      console.log('  2. Add Access-Control-Allow-Credentials: true');
    }
    
    if (!res.headers['access-control-allow-methods']) {
      console.log('  3. Add Access-Control-Allow-Methods header');
    }
  }

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('\n📦 Response Preview:');
    console.log('─'.repeat(50));
    try {
      const data = JSON.parse(body);
      console.log(JSON.stringify(data, null, 2).substring(0, 300) + '...');
    } catch {
      console.log(body.substring(0, 300) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request failed:', error.message);
  console.log('\n🔧 Possible issues:');
  console.log('  1. Backend is not deployed or not accessible');
  console.log('  2. Network connectivity issues');
  console.log('  3. Invalid backend URL');
});

req.end();
