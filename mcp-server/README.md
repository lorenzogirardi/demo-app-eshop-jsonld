# E-commerce MCP Server

A comprehensive Model Context Protocol (MCP) server for e-commerce applications with Prometheus monitoring and multi-provider AI integration.

## Features

### 🛍️ E-commerce Operations
- **Product Management**: CRUD operations for products
- **Cart Management**: Add, update, remove items from carts
- **User Management**: User data and analytics
- **Analytics**: Business insights and performance metrics

### 📊 Monitoring & Observability
- **Prometheus Metrics**: Request rates, response times, error rates
- **Grafana Dashboards**: Visual monitoring and alerting
- **Health Checks**: System status and database connectivity
- **Performance Tracking**: Database query performance

### 🤖 Multi-Provider AI Integration
- **OpenAI/ChatGPT**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic/Claude**: Claude 3 Opus, Sonnet, Haiku
- **Google/Gemini**: Gemini Pro, Gemini Pro Vision
- **Perplexity**: Search-augmented AI models
- **Ollama**: Local AI models (Llama, Mistral, CodeLlama)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (or configured database)

### Installation

1. **Clone and setup**:
```bash
cd mcp-server
chmod +x setup.sh
./setup.sh
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your API keys and database URL
```

3. **Start the MCP server**:
```bash
npm run dev
```

### AI Provider Configuration

Add your API keys to `.env`:

```env
# Required for respective providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
PERPLEXITY_API_KEY=pplx-...

# Ollama (local) - no API key needed
OLLAMA_URL=http://localhost:11434
```

## MCP Tools

### Product Management
- `get_products` - List products with filtering
- `get_product` - Get specific product details
- `create_product` - Create new product
- `update_product` - Update existing product
- `delete_product` - Delete product

### Cart Management
- `get_cart` - Get cart by ID or user ID
- `add_to_cart` - Add item to cart
- `update_cart_item` - Update item quantity
- `remove_from_cart` - Remove item from cart

### User Management
- `get_users` - List users with pagination
- `get_user` - Get user details by ID or email

### Analytics
- `get_analytics` - Business analytics and metrics

### AI Tools
- `ai_analyze_products` - AI-powered product performance analysis
- `ai_generate_recommendations` - Personalized product recommendations
- `ai_analyze_cart_abandonment` - Cart abandonment insights
- `ai_business_insights` - Strategic business analysis
- `ai_chat` - Interactive AI chat with e-commerce context
- `ai_providers` - List available AI providers and status

### Monitoring
- `get_metrics` - Prometheus metrics
- `health_check` - System health status

## Use Cases & Examples

### 1. Server Validation & Health Check

First, validate your MCP server is working:

```bash
# Test basic connectivity
curl -X POST http://localhost:9090/health

# Check available AI providers
# Use this MCP tool call in Kiro IDE:
```

**MCP Tool Call:**
```json
{
  "tool": "ai_providers",
  "args": {}
}
```

**Expected Response:**
```json
{
  "providers": [
    {
      "name": "openai",
      "models": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
      "configured": true
    },
    {
      "name": "ollama", 
      "models": ["llama2", "llama3", "mistral"],
      "configured": true
    }
  ]
}
```

### 2. E-commerce Data Analysis Use Cases

#### A. Product Performance Analysis

**Scenario**: Analyze which products are performing well and why.

**With ChatGPT (Best for creative insights):**
```json
{
  "tool": "ai_analyze_products",
  "args": {
    "provider": "openai",
    "model": "gpt-4",
    "productId": "optional_specific_product_id"
  }
}
```

**With Claude (Best for detailed analysis):**
```json
{
  "tool": "ai_analyze_products",
  "args": {
    "provider": "anthropic", 
    "model": "claude-3-sonnet-20240229"
  }
}
```

**Expected AI Response Example:**
```
Based on the product performance data, here are key insights:

🏆 TOP PERFORMERS:
- "Premium Headphones" - 45 cart additions, $12,750 revenue
- "Wireless Mouse" - 38 cart additions, $1,140 revenue

📊 ANALYSIS:
1. Premium items show higher conversion despite price
2. Electronics category dominates sales
3. Products with detailed descriptions perform 40% better

💡 RECOMMENDATIONS:
- Expand premium electronics line
- Improve product descriptions for underperforming items
- Consider bundling complementary products
```

#### B. Cart Abandonment Analysis

**Scenario**: Understand why customers abandon their carts.

```json
{
  "tool": "ai_analyze_cart_abandonment",
  "args": {
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online"
  }
}
```

**Expected Response:**
```
🛒 CART ABANDONMENT ANALYSIS:

📈 KEY METRICS:
- 23 abandoned carts in last 24+ hours
- Average cart value: $156.50
- Total potential revenue lost: $3,599.50

🔍 PATTERNS IDENTIFIED:
1. High-value carts (>$200) have 65% abandonment rate
2. Mobile users abandon 2x more than desktop
3. Carts with 3+ items show higher abandonment

⚡ IMMEDIATE ACTIONS:
- Implement cart recovery emails for high-value carts
- Optimize mobile checkout flow
- Offer shipping incentives for carts >$150
- Add progress indicators to checkout process
```

#### C. Personalized Product Recommendations

**Scenario**: Generate recommendations for a specific user.

```json
{
  "tool": "ai_generate_recommendations",
  "args": {
    "userId": "user_123",
    "provider": "google",
    "model": "gemini-pro"
  }
}
```

### 3. Interactive AI Chat Examples

#### A. Business Strategy Discussion

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Our conversion rate dropped 15% this month. What could be the reasons and how should we investigate?",
    "provider": "anthropic",
    "model": "claude-3-opus-20240229"
  }
}
```

**Expected Response:**
```
A 15% conversion rate drop is significant. Let me help you investigate systematically:

🔍 IMMEDIATE INVESTIGATION AREAS:

1. TECHNICAL ISSUES:
   - Check website performance metrics
   - Verify payment gateway functionality
   - Review mobile responsiveness

2. USER EXPERIENCE:
   - Analyze checkout funnel drop-off points
   - Review recent UI/UX changes
   - Check for broken product pages

3. EXTERNAL FACTORS:
   - Seasonal trends comparison
   - Competitor pricing changes
   - Marketing campaign performance

📊 DATA TO COLLECT:
- Conversion rates by traffic source
- Device-specific performance
- Geographic performance variations
- Product category performance

Would you like me to analyze your current cart and product data to identify specific issues?
```

#### B. Competitive Analysis Request

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Based on our product catalog, what market trends should we be aware of and what new products should we consider?",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-huge-128k-online",
    "context": {
      "current_categories": ["electronics", "accessories", "home"],
      "top_products": ["headphones", "mice", "keyboards"]
    }
  }
}
```

### 4. Advanced Analytics Use Cases

#### A. Business Intelligence Dashboard

```json
{
  "tool": "ai_business_insights",
  "args": {
    "provider": "openai",
    "model": "gpt-4-turbo"
  }
}
```

#### B. Custom Analytics Query

```json
{
  "tool": "get_analytics",
  "args": {
    "type": "products",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

Then follow up with AI analysis:

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Analyze this product performance data and suggest optimization strategies",
    "context": "{{previous_analytics_result}}",
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229"
  }
}
```

### 5. Multi-Provider Comparison

**Test the same query across different providers to compare responses:**

```json
// Test 1: Ollama (Local, Free)
{
  "tool": "ai_chat",
  "args": {
    "query": "What are the key factors that influence e-commerce conversion rates?",
    "provider": "ollama",
    "model": "llama3"
  }
}

// Test 2: ChatGPT (Creative, Comprehensive)
{
  "tool": "ai_chat", 
  "args": {
    "query": "What are the key factors that influence e-commerce conversion rates?",
    "provider": "openai",
    "model": "gpt-4"
  }
}

// Test 3: Claude (Analytical, Structured)
{
  "tool": "ai_chat",
  "args": {
    "query": "What are the key factors that influence e-commerce conversion rates?",
    "provider": "anthropic", 
    "model": "claude-3-sonnet-20240229"
  }
}

// Test 4: Perplexity (Current, Research-backed)
{
  "tool": "ai_chat",
  "args": {
    "query": "What are the key factors that influence e-commerce conversion rates?",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online"
  }
}
```

### 6. Validation Test Suite

Run these tests to validate your MCP server setup:

#### Basic Functionality Tests

```bash
# 1. Health Check
curl http://localhost:9090/health

# 2. Metrics Endpoint  
curl http://localhost:9090/metrics
```

#### MCP Tool Tests (Use in Kiro IDE)

```json
// Test 1: Basic data retrieval
{
  "tool": "get_products",
  "args": {
    "limit": 5
  }
}

// Test 2: AI provider status
{
  "tool": "ai_providers",
  "args": {}
}

// Test 3: Simple AI chat (local)
{
  "tool": "ai_chat",
  "args": {
    "query": "Hello, can you help me analyze e-commerce data?",
    "provider": "ollama",
    "model": "llama2"
  }
}

// Test 4: Analytics retrieval
{
  "tool": "get_analytics",
  "args": {
    "type": "overview"
  }
}

// Test 5: AI analysis (if you have data)
{
  "tool": "ai_analyze_products",
  "args": {
    "provider": "ollama",
    "model": "llama2"
  }
}
```

### 7. Real-World Scenarios

#### Scenario A: Daily Business Review

**Morning routine for e-commerce manager:**

1. **Check system health:**
```json
{"tool": "health_check", "args": {}}
```

2. **Get business overview:**
```json
{"tool": "get_analytics", "args": {"type": "overview"}}
```

3. **AI-powered insights:**
```json
{
  "tool": "ai_business_insights",
  "args": {
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229"
  }
}
```

#### Scenario B: Product Launch Analysis

**After launching new products:**

1. **Get recent products:**
```json
{
  "tool": "get_products",
  "args": {
    "limit": 10,
    "offset": 0
  }
}
```

2. **Analyze performance:**
```json
{
  "tool": "ai_analyze_products", 
  "args": {
    "provider": "openai",
    "model": "gpt-4"
  }
}
```

3. **Get recommendations:**
```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Based on our recent product launches, what marketing strategies would be most effective?",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online"
  }
}
```

#### Scenario C: Customer Support Enhancement

**Using AI to improve customer experience:**

```json
{
  "tool": "ai_chat",
  "args": {
    "query": "A customer is asking about our return policy for electronics. They bought headphones 2 weeks ago but haven't opened the package. What should I tell them?",
    "provider": "anthropic",
    "model": "claude-3-haiku-20240307",
    "context": {
      "product_category": "electronics",
      "purchase_date": "2024-01-15",
      "current_date": "2024-01-29",
      "condition": "unopened"
    }
  }
}
```

## Monitoring Stack

### Access Points
- **MCP Server Monitoring**: http://localhost:9090
- **Prometheus**: http://localhost:9091
- **Grafana**: http://localhost:3001 (admin/admin)
- **Ollama API**: http://localhost:11434

### Key Metrics
- `mcp_requests_total` - Total MCP requests by tool
- `mcp_request_duration_seconds` - Request latency
- `mcp_errors_total` - Error rates by tool and type
- `database_queries_total` - Database operation counts
- `database_query_duration_seconds` - Database performance

## Kiro IDE Integration

Add to your `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "ecommerce-mcp": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "cwd": ".",
      "env": {
        "DATABASE_URL": "mongodb://localhost:27017/ecommerce"
      },
      "disabled": false,
      "autoApprove": [
        "get_products",
        "get_analytics", 
        "ai_chat",
        "health_check"
      ]
    }
  }
}
```

## AI Provider Comparison

| Provider | Best For | Cost | Speed | Capabilities |
|----------|----------|------|-------|--------------|
| **OpenAI** | General tasks, creativity | $$$ | Fast | Excellent reasoning |
| **Anthropic** | Analysis, safety | $$$ | Medium | Superior analysis |
| **Google** | Multimodal, cost-effective | $ | Fast | Vision capabilities |
| **Perplexity** | Real-time data, research | $$ | Medium | Search integration |
| **Ollama** | Privacy, no cost | Free | Variable | Local processing |

## Development

### Project Structure
```
mcp-server/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── metrics.ts            # Prometheus metrics
│   ├── monitoring-server.ts  # HTTP monitoring server
│   ├── services/             # Business logic services
│   └── ai-integration/       # AI provider integrations
├── grafana/                  # Grafana configuration
├── docker-compose.yml        # Monitoring stack
└── ai-config.json           # AI provider configuration
```

### Adding New AI Providers

1. Update `universal-ai-client.ts` with new provider
2. Add provider configuration to `ai-config.json`
3. Update environment variables in `.env.example`
4. Add provider to tool schemas in `index.ts`

### Custom Analytics

Extend `AnalyticsService` to add custom business metrics:

```typescript
async getCustomAnalytics(filters: any) {
  // Your custom analytics logic
  return await this.metrics.timeOperation('select', 'custom', async () => {
    // Database queries
  });
}
```

## Troubleshooting

### Common Issues

1. **AI Provider Not Working**
   - Check API keys in `.env`
   - Verify provider is configured: `ai_providers` tool
   - Check network connectivity

2. **Database Connection Issues**
   - Verify `DATABASE_URL` in environment
   - Check database server is running
   - Use `health_check` tool to diagnose

3. **Monitoring Stack Issues**
   - Ensure Docker is running
   - Check port conflicts (9090, 9091, 3001, 11434)
   - Restart with `docker-compose down && docker-compose up -d`

### Logs and Debugging

```bash
# MCP server logs
npm run dev

# Docker logs
docker-compose logs -f

# Specific service logs
docker-compose logs grafana
docker-compose logs prometheus
docker-compose logs ollama
```

## Documentation

- **[BASIC-TESTING.md](BASIC-TESTING.md)** - Test MCP server without AI (start here!)
- **[TESTING.md](TESTING.md)** - Comprehensive testing and validation guide
- **[EXAMPLES.md](EXAMPLES.md)** - Real-world use cases and practical examples
- **[ai-config.json](ai-config.json)** - AI provider configuration reference

## Quick Test Commands

### Basic Testing (No AI Required)

Test core MCP functionality first:

```bash
# 1. Run basic tests (no AI needed)
./test-basic-mcp.sh

# 2. Start MCP server
npm run dev

# 3. Test in Kiro IDE - Core functionality
{
  "tool": "health_check",
  "args": {}
}

{
  "tool": "get_metrics", 
  "args": {"format": "json"}
}

{
  "tool": "get_products",
  "args": {"limit": 5}
}
```

### Full Testing (With AI)

After basic tests pass:

```bash
# 1. Run full test suite
./test-mcp-server.sh

# 2. Test AI providers
{
  "tool": "ai_providers",
  "args": {}
}

# 3. Test AI chat (local)
{
  "tool": "ai_chat",
  "args": {
    "query": "Hello! Can you help analyze e-commerce data?",
    "provider": "ollama",
    "model": "llama2"
  }
}

# 4. Test external AI (if configured)
{
  "tool": "ai_chat",
  "args": {
    "query": "What are key e-commerce metrics to track?",
    "provider": "openai",
    "model": "gpt-3.5-turbo"
  }
}
```

## Production Deployment

### Environment Variables for Production

```env
# Database
DATABASE_URL=mongodb://your-production-db/ecommerce

# AI Providers (add only the ones you want to use)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_API_KEY=your-google-api-key
PERPLEXITY_API_KEY=pplx-your-perplexity-key

# Monitoring
MONITORING_PORT=9090
NODE_ENV=production

# Security
CORS_ORIGIN=https://your-domain.com
```

### Docker Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  mcp-server:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    ports:
      - "9090:9090"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9090/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Performance Optimization

### AI Provider Cost Optimization

```json
// Use cost-effective models for frequent queries
{
  "tool": "ai_chat",
  "args": {
    "query": "Simple product question",
    "provider": "google",
    "model": "gemini-pro"  // Lower cost than GPT-4
  }
}

// Use premium models for complex analysis
{
  "tool": "ai_business_insights",
  "args": {
    "provider": "anthropic",
    "model": "claude-3-opus-20240229"  // Best quality for important decisions
  }
}

// Use local models for sensitive data
{
  "tool": "ai_analyze_products",
  "args": {
    "provider": "ollama",
    "model": "llama3"  // No API costs, full privacy
  }
}
```

### Caching Strategy

Implement caching for expensive AI operations:

```javascript
// Example caching wrapper
const aiCache = new Map();

async function cachedAICall(tool, args) {
  const cacheKey = JSON.stringify({ tool, args });
  
  if (aiCache.has(cacheKey)) {
    return aiCache.get(cacheKey);
  }
  
  const result = await callAI(tool, args);
  aiCache.set(cacheKey, result);
  
  return result;
}
```

## Security Considerations

### API Key Management

- Store API keys in environment variables, never in code
- Use different keys for development and production
- Rotate keys regularly
- Monitor API usage for unusual patterns

### Data Privacy

- Use Ollama for sensitive business data
- Implement data anonymization for external AI providers
- Log AI interactions for audit purposes
- Comply with data protection regulations

## Monitoring & Alerting

### Key Metrics to Monitor

```promql
# Request rate
rate(mcp_requests_total[5m])

# Error rate
rate(mcp_errors_total[5m]) / rate(mcp_requests_total[5m])

# Response time
histogram_quantile(0.95, rate(mcp_request_duration_seconds_bucket[5m]))

# AI provider costs (custom metric)
increase(ai_provider_costs_total[1d])
```

### Grafana Alerts

Set up alerts for:
- High error rates (>5%)
- Slow response times (>10s)
- AI provider failures
- High API costs

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

### Adding New AI Providers

1. Update `universal-ai-client.ts`
2. Add provider config to `ai-config.json`
3. Update environment variables
4. Add tests in `TESTING.md`
5. Document in `EXAMPLES.md`

## Support

- **Issues**: GitHub Issues for bugs and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Documentation**: Check TESTING.md and EXAMPLES.md first

## License

MIT License - see LICENSE file for details.