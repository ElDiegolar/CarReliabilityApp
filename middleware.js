// middleware.js - Next.js middleware for global settings like CORS
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get response
  const response = NextResponse.next();
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// Configure which paths should use this middleware
export const config = {
  matcher: '/api/:path*',
};