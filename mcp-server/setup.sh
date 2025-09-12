#!/bin/bash

echo "🚀 Setting up E-commerce MCP Server with Multi-Provider AI Integration"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Setup environment file
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please add your AI provider API keys."
fi

# Copy Prisma schema from parent directory if it exists
if [ -f ../prisma/schema.prisma ]; then
    echo "📋 Setting up Prisma..."
    mkdir -p prisma
    cp ../prisma/schema.prisma ./prisma/
    npx prisma generate
fi

# Start monitoring stack with Docker Compose
echo "🐳 Starting monitoring stack (Prometheus, Grafana, Ollama)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Pull Ollama models
echo "🤖 Setting up Ollama models..."
echo "   Pulling llama2..."
docker exec $(docker-compose ps -q ollama) ollama pull llama2 2>/dev/null || echo "   ⚠️  Ollama not ready, you can pull models later with: docker exec <ollama-container> ollama pull llama2"

echo "   Pulling llama3..."
docker exec $(docker-compose ps -q ollama) ollama pull llama3 2>/dev/null || echo "   ⚠️  You can pull llama3 later with: docker exec <ollama-container> ollama pull llama3"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔗 Access Points:"
echo "   - MCP Server Monitoring: http://localhost:9090"
echo "   - Prometheus: http://localhost:9091"
echo "   - Grafana: http://localhost:3001 (admin/admin)"
echo "   - Ollama API: http://localhost:11434"
echo ""
echo "🤖 AI Providers Supported:"
echo "   - OpenAI (ChatGPT): Add OPENAI_API_KEY to .env"
echo "   - Anthropic (Claude): Add ANTHROPIC_API_KEY to .env"
echo "   - Google (Gemini): Add GOOGLE_API_KEY to .env"
echo "   - Perplexity: Add PERPLEXITY_API_KEY to .env"
echo "   - Ollama (Local): Ready to use!"
echo ""
echo "🛠️  To start the MCP server:"
echo "   npm run dev"
echo ""
echo "📊 To test with Kiro IDE:"
echo "   1. The MCP configuration is already set in .kiro/settings/mcp.json"
echo "   2. Start the MCP server with 'npm run dev'"
echo "   3. Use tools like 'ai_chat', 'ai_analyze_products', etc."
echo ""
echo "💡 Example AI usage:"
echo "   - ai_chat with query: 'Analyze our top products'"
echo "   - ai_analyze_products with provider: 'openai', model: 'gpt-4'"
echo "   - ai_providers to see all available AI providers"