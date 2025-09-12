# MCP Server Testing & Validation Guide

This guide provides comprehensive testing procedures to validate your MCP server setup with all AI providers.

## Quick Validation Checklist

- [ ] Server starts without errors
- [ ] Database connection works
- [ ] Monitoring endpoints respond
- [ ] At least one AI provider is configured
- [ ] MCP tools respond correctly
- [ ] Kiro IDE integration works

## 1. Environment Setup Validation

### Check Required Services

```bash
# Check if services are running
docker-compose ps

# Expected output:
# NAME                     COMMAND                  SERVICE             STATUS
# mcp-server-grafana-1     "/run.sh"                grafana             Up
# mcp-server-ollama-1      "/bin/ollama serve"      ollama              Up  
# mcp-server-prometheus-1  "/bin/prometheus --c…"   prometheus          Up
```

### Verify Environment Variables

```bash
# Check if .env file exists and has required variables
cat .env | grep -E "(API_KEY|DATABASE_URL|OLLAMA_URL)"

# Should show your configured API keys (values hidden for security)
```

## 2. Server Health Validation

### Basic Health Check

```bash
# Start the MCP server
npm run dev

# In another terminal, test health endpoint
curl -s http://localhost:9090/health | jq '.'
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-09T10:30:00.000Z",
  "services": {
    "database": "healthy",
    "metrics": "healthy"
  },
  "uptime": 45.123
}
```

### Metrics Endpoint

```bash
curl -s http://localhost:9090/metrics | head -20
```

**Expected Response:**
```
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.123456

# HELP mcp_requests_total Total number of MCP requests
# TYPE mcp_requests_total counter
mcp_requests_total{tool="health_check",status="success"} 1
```

## 3. MCP Tools Validation

### Test in Kiro IDE

Open Kiro IDE and test these MCP tool calls:

#### 3.1 Basic System Tests

**Test 1: Health Check**
```json
{
  "tool": "health_check",
  "args": {}
}
```

**Expected Result:** Status "healthy" with service information.

**Test 2: AI Providers Status**
```json
{
  "tool": "ai_providers", 
  "args": {}
}
```

**Expected Result:**
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
  ],
  "timestamp": "2024-12-09T10:30:00.000Z"
}
```

#### 3.2 Data Retrieval Tests

**Test 3: Get Products**
```json
{
  "tool": "get_products",
  "args": {
    "limit": 3
  }
}
```

**Test 4: Get Analytics**
```json
{
  "tool": "get_analytics",
  "args": {
    "type": "overview"
  }
}
```

#### 3.3 AI Integration Tests

**Test 5: Simple AI Chat (Ollama - Local)**
```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Hello! Can you help me with e-commerce analysis?",
    "provider": "ollama",
    "model": "llama2"
  }
}
```

**Expected Result:**
```json
{
  "query": "Hello! Can you help me with e-commerce analysis?",
  "response": "Hello! I'd be happy to help you with e-commerce analysis. I can assist with product performance analysis, customer behavior insights, sales trends, conversion optimization, and more. What specific aspect of your e-commerce business would you like to analyze?",
  "provider": "ollama",
  "model": "llama2",
  "timestamp": "2024-12-09T10:30:00.000Z"
}
```

## 4. AI Provider Specific Tests

### 4.1 OpenAI/ChatGPT Tests

**Prerequisites:** Set `OPENAI_API_KEY` in `.env`

**Test 6: ChatGPT Product Analysis**
```json
{
  "tool": "ai_analyze_products",
  "args": {
    "provider": "openai",
    "model": "gpt-3.5-turbo"
  }
}
```

**Validation:** Response should contain structured product analysis with insights and recommendations.

### 4.2 Anthropic/Claude Tests

**Prerequisites:** Set `ANTHROPIC_API_KEY` in `.env`

**Test 7: Claude Business Insights**
```json
{
  "tool": "ai_business_insights",
  "args": {
    "provider": "anthropic",
    "model": "claude-3-haiku-20240307"
  }
}
```

**Validation:** Response should provide detailed business analysis with strategic recommendations.

### 4.3 Google/Gemini Tests

**Prerequisites:** Set `GOOGLE_API_KEY` in `.env`

**Test 8: Gemini Chat**
```json
{
  "tool": "ai_chat",
  "args": {
    "query": "What are the current trends in e-commerce?",
    "provider": "google",
    "model": "gemini-pro"
  }
}
```

### 4.4 Perplexity Tests

**Prerequisites:** Set `PERPLEXITY_API_KEY` in `.env`

**Test 9: Perplexity Market Research**
```json
{
  "tool": "ai_chat",
  "args": {
    "query": "What are the latest e-commerce market trends for 2024?",
    "provider": "perplexity", 
    "model": "llama-3.1-sonar-small-128k-online"
  }
}
```

**Validation:** Response should include current, research-backed information with sources.

### 4.5 Ollama Local Tests

**Test 10: Multiple Ollama Models**

```json
// Test Llama2
{
  "tool": "ai_chat",
  "args": {
    "query": "Explain cart abandonment in e-commerce",
    "provider": "ollama",
    "model": "llama2"
  }
}

// Test Llama3 (if available)
{
  "tool": "ai_chat",
  "args": {
    "query": "Explain cart abandonment in e-commerce", 
    "provider": "ollama",
    "model": "llama3"
  }
}
```

## 5. Advanced Integration Tests

### 5.1 Multi-Provider Comparison Test

Run the same query across all configured providers:

```json
// Query template
{
  "tool": "ai_chat",
  "args": {
    "query": "What are 3 key metrics every e-commerce business should track?",
    "provider": "PROVIDER_NAME",
    "model": "MODEL_NAME"
  }
}
```

**Test with each provider:**
- `openai` + `gpt-3.5-turbo`
- `anthropic` + `claude-3-haiku-20240307`
- `google` + `gemini-pro`
- `perplexity` + `llama-3.1-sonar-small-128k-online`
- `ollama` + `llama2`

**Validation:** Each should provide relevant but potentially different perspectives on e-commerce metrics.

### 5.2 Context-Aware Analysis Test

**Test 11: Analysis with Context**
```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Should we increase our marketing budget for this product category?",
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "context": {
      "category": "electronics",
      "current_conversion_rate": 2.3,
      "average_order_value": 156,
      "monthly_revenue": 45000,
      "marketing_spend": 9000
    }
  }
}
```

**Validation:** AI should reference the provided context in its analysis.

### 5.3 Error Handling Tests

**Test 12: Invalid Provider**
```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Test query",
    "provider": "invalid_provider",
    "model": "test"
  }
}
```

**Expected:** Error message about unknown provider.

**Test 13: Missing API Key**
```json
{
  "tool": "ai_chat",
  "args": {
    "query": "Test query",
    "provider": "openai",
    "model": "gpt-4"
  }
}
```

**Expected:** If `OPENAI_API_KEY` not set, should get configuration error.

## 6. Performance Tests

### 6.1 Response Time Test

```bash
# Test response times for different providers
time curl -X POST http://localhost:9090/api/test-endpoint
```

### 6.2 Concurrent Request Test

```bash
# Test multiple simultaneous requests
for i in {1..5}; do
  curl -s http://localhost:9090/health &
done
wait
```

## 7. Monitoring Validation

### 7.1 Prometheus Metrics

```bash
# Check if metrics are being collected
curl -s http://localhost:9091/api/v1/query?query=mcp_requests_total | jq '.'
```

### 7.2 Grafana Dashboard

1. Open http://localhost:3001
2. Login with admin/admin
3. Check if MCP dashboard loads
4. Verify metrics are displaying

## 8. Troubleshooting Common Issues

### Issue 1: AI Provider Not Configured

**Symptoms:** `ai_providers` shows `configured: false`

**Solution:**
```bash
# Check environment variables
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Add missing keys to .env file
echo "OPENAI_API_KEY=your_key_here" >> .env
```

### Issue 2: Ollama Models Not Available

**Symptoms:** Ollama requests fail with model not found

**Solution:**
```bash
# Check available models
docker exec $(docker-compose ps -q ollama) ollama list

# Pull missing models
docker exec $(docker-compose ps -q ollama) ollama pull llama2
docker exec $(docker-compose ps -q ollama) ollama pull llama3
```

### Issue 3: Database Connection Issues

**Symptoms:** Health check shows database unhealthy

**Solution:**
```bash
# Check DATABASE_URL in .env
grep DATABASE_URL .env

# Test database connection
mongosh "$DATABASE_URL" --eval "db.runCommand('ping')"
```

### Issue 4: Port Conflicts

**Symptoms:** Services fail to start

**Solution:**
```bash
# Check what's using the ports
lsof -i :9090
lsof -i :9091
lsof -i :3001
lsof -i :11434

# Stop conflicting services or change ports in docker-compose.yml
```

## 9. Automated Test Script

Create a test script to run all validations:

```bash
#!/bin/bash
# save as test-mcp-server.sh

echo "🧪 Running MCP Server Validation Tests"

# Test 1: Health Check
echo "1. Testing health endpoint..."
curl -s http://localhost:9090/health | jq '.status' | grep -q "healthy" && echo "✅ Health check passed" || echo "❌ Health check failed"

# Test 2: Metrics
echo "2. Testing metrics endpoint..."
curl -s http://localhost:9090/metrics | grep -q "mcp_requests_total" && echo "✅ Metrics endpoint working" || echo "❌ Metrics endpoint failed"

# Test 3: Prometheus
echo "3. Testing Prometheus..."
curl -s http://localhost:9091/-/healthy | grep -q "Prometheus is Healthy" && echo "✅ Prometheus healthy" || echo "❌ Prometheus unhealthy"

# Test 4: Grafana
echo "4. Testing Grafana..."
curl -s http://localhost:3001/api/health | jq '.database' | grep -q "ok" && echo "✅ Grafana healthy" || echo "❌ Grafana unhealthy"

# Test 5: Ollama
echo "5. Testing Ollama..."
curl -s http://localhost:11434/api/tags | jq '.models | length' | grep -q "[0-9]" && echo "✅ Ollama working" || echo "❌ Ollama not responding"

echo "🏁 Validation complete!"
```

Run with:
```bash
chmod +x test-mcp-server.sh
./test-mcp-server.sh
```

## 10. Success Criteria

Your MCP server is properly configured if:

- [ ] All health checks pass
- [ ] At least one AI provider is configured and working
- [ ] MCP tools respond correctly in Kiro IDE
- [ ] Monitoring stack is accessible
- [ ] No errors in server logs
- [ ] AI responses are relevant and helpful

## Next Steps

Once validation is complete:

1. **Configure additional AI providers** for comparison
2. **Set up alerting** in Grafana for production monitoring
3. **Create custom analytics** for your specific business needs
4. **Integrate with your existing e-commerce platform**
5. **Train your team** on using the AI-powered insights