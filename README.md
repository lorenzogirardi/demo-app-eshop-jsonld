# Gucci Digital - Platform Engineering Demo App

## Overview
This is a demo e-commerce application built with Next.js, React, and TypeScript. It showcases a simple online shopping experience with product browsing, cart functionality, and checkout process.

## Demo Mode Setup
This application has been configured to run in demo mode with the following features:
- No authentication required (Auth0 bypassed with mock user)
- Sample product images from the internet
- Mock database implementation instead of MongoDB/Prisma
- Local cart functionality using cookies

## How to Run
1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```
   The application will be available at http://localhost:12000

## Key Features
- Product browsing with sample images
- Shopping cart functionality
- Checkout process
- Responsive design

## Technical Implementation
The demo mode is implemented through several key modifications:

1. **Authentication Bypass**: Modified `authOptions.ts` to use a mock user session instead of Auth0
2. **Mock Database**: Created `mock-db.ts` with sample product data instead of using MongoDB
3. **Local Cart**: Simplified cart functionality to use cookies for local cart ID
4. **Sample Images**: All product images are sourced from public URLs

## How AI Boosts Productivity with Modern Web Apps

AI assistants can significantly enhance productivity when working with modern web applications by:

### 1. Rapid Prototyping and Development
- Quickly implementing features based on requirements
- Generating boilerplate code and configurations
- Adapting existing code to new requirements (like our demo mode)

### 2. Problem Solving and Debugging
- Identifying and fixing bugs in complex applications
- Suggesting optimizations for performance improvements
- Implementing workarounds for technical limitations

### 3. Knowledge Integration
- Incorporating best practices from various frameworks and libraries
- Suggesting modern approaches to common problems
- Providing context-aware recommendations

### 4. Documentation and Knowledge Transfer
- Creating clear documentation for complex systems
- Explaining technical implementations to different audiences
- Bridging knowledge gaps between technical and non-technical team members

In this project, AI assistance was used to transform a production-ready e-commerce application into a demo version that can run locally without external dependencies, demonstrating how AI can quickly adapt applications to different use cases and requirements.