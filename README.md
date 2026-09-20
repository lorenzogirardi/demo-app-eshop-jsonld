# Platform Engineering Demo App

## Quick start (fresh clone)

Requires Docker (with Compose v2), `openssl` and `curl`. The only value you supply is your OpenRouter API key.

```bash
git clone git@github.com:lorenzogirardi/demo-app-eshop-jsonld.git
cd demo-app-eshop-jsonld
OPENROUTER_API_KEY=sk-or-... ./scripts/setup.sh     # or run without the variable and paste the key when asked
```

The script creates `.env` and `.env.enthusiast` (random secrets, your key; both git-ignored), builds and starts the
Enthusiast sidecar and the shop, bootstraps Enthusiast (API token, data set, agent) and imports the catalog.
The first build takes several minutes. Then open http://localhost:3000.
Re-running the script is safe. Documentation: `agenticommerce/README.md`.

To use only the direct LLM (no Enthusiast), set `AI_BACKEND=direct` in `.env` and restart the shop.

## Overview
This is a demo e-commerce application built with Next.js, React, and TypeScript. It showcases a simple online shopping experience with product browsing and a cart (there is no checkout: the Checkout button is a placeholder), and has been extended with AI search, a shopping assistant and an agent-ready surface (REST/OpenAPI/MCP, llms.txt, feeds, JSON-LD). See `agenticommerce/README.md`.

## Demo Mode Setup
This application has been configured to run in demo mode with the following features:
- No authentication required (Auth0 bypassed with mock user)
- Sample product images from the internet
- Mock database implementation instead of MongoDB/Prisma
- Local cart functionality using cookies

## How to Run
Full demo with AI (shop + Enthusiast): see *Quick start* above. Shop only, without Docker (AI features off unless you configure `.env`):

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
- Shopping cart functionality (no checkout)
- AI search and shopping assistant (optional, needs an OpenRouter key)
- Agent-ready: REST API, OpenAPI, MCP server, llms.txt, product feeds, schema.org JSON-LD
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
