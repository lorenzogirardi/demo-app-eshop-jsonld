# Basic MCP Server Testing (No AI Required)

This guide shows how to test the core MCP server functionality without any AI providers configured.

## Prerequisites

1. Start the MCP server:
```bash
cd mcp-server
npm install
npm run build
npm run dev
```

2. The server should show:
```
E-commerce MCP Server running on stdio
```

## Basic MCP Tools Testing

Test these tools in **Kiro IDE** without any AI integration:

### 1. Health Check

```json
{
  "tool": "health_check",
  "args": {}
}
```

**Expected Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"status\": \"healthy\",\n  \"timestamp\": \"2024-12-09T...\",\n  \"services\": {\n    \"database\": \"healthy\",\n    \"metrics\": \"healthy\"\n  },\n  \"uptime\": 45.123\n}"
    }
  ]
}
```

### 2. Get Metrics

```json
{
  "tool": "get_metrics",
  "args": {
    "format": "json"
  }
}
```

**Expected Response:**
```json
{
  "content": [
    {
      "type": "text", 
      "text": "[\n  {\n    \"name\": \"process_cpu_user_seconds_total\",\n    \"help\": \"Total user CPU time spent in seconds.\",\n    \"type\": \"counter\",\n    \"values\": [...]\n  }\n]"
    }
  ]
}
```

### 3. Get Products (Basic Data)

```json
{
  "tool": "get_products",
  "args": {
    "limit": 5
  }
}
```

**Expected Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"products\": [...],\n  \"count\": 5,\n  \"pagination\": {\n    \"limit\": 5,\n    \"offset\": 0\n  }\n}"
    }
  ]
}
```

### 4. Get Analytics Overview

```json
{
  "tool": "get_analytics",
  "args": {
    "type": "overview"
  }
}
```

**Expected Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"overview\": {\n    \"totalProducts\": 10,\n    \"totalUsers\": 5,\n    \"totalCarts\": 3,\n    \"totalCartItems\": 8,\n    \"totalCartValue\": 1250,\n    \"averageCartValue\": 416.67\n  },\n  \"recent\": {\n    \"productsLast7Days\": 2,\n    \"cartsLast7Days\": 1\n  },\n  \"timestamp\": \"2024-12-09T...\"\n}"
    }
  ]
}
```

### 5. Get Users

```json
{
  "tool": "get_users",
  "args": {
    "limit": 3
  }
}
```

### 6. Create a Test Product

```json
{
  "tool": "create_product",
  "args": {
    "name": "Test Product",
    "description": "A test product for MCP validation",
    "price": 2999,
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  }
}
```

**Expected Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"message\": \"Product created successfully\",\n  \"product\": {\n    \"id\": \"...\",\n    \"name\": \"Test Product\",\n    \"description\": \"A test product for MCP validation\",\n    \"price\": 2999,\n    \"imageUrl\": \"https://images.unsplash.com/photo-1505740420928-5e560c06d30e\",\n    \"createdAt\": \"2024-12-09T...\",\n    \"updatedAt\": \"2024-12-09T...\"\n  }\n}"
    }
  ]
}
```

### 7. Get Specific Product

```json
{
  "tool": "get_product",
  "args": {
    "id": "YOUR_PRODUCT_ID_FROM_STEP_6"
  }
}
```

### 8. Add Item to Cart

```json
{
  "tool": "add_to_cart",
  "args": {
    "productId": "YOUR_PRODUCT_ID",
    "quantity": 2
  }
}
```

### 9. Get Cart

```json
{
  "tool": "get_cart",
  "args": {
    "cartId": "YOUR_CART_ID_FROM_STEP_8"
  }
}
```

## Testing Without Database

If you don't have a database configured, you can still test some tools:

### Mock Data Testing

```json
// This will work even without database
{
  "tool": "health_check",
  "args": {}
}

// This will show metrics even without database
{
  "tool": "get_metrics",
  "args": {
    "format": "json"
  }
}
```

## HTTP Endpoint Testing

You can also test the monitoring server directly:

```bash
# Test health endpoint
curl http://localhost:9090/health

# Test metrics endpoint  
curl http://localhost:9090/metrics

# Test API endpoint
curl http://localhost:9090/api/products
```

## Expected Errors (Normal Behavior)

### Without Database Connection

```json
{
  "tool": "get_products",
  "args": {}
}
```

**Expected Error:**
```
Error: Database connection failed
```

### Without AI Providers

```json
{
  "tool": "ai_providers",
  "args": {}
}
```

**Expected Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"providers\": [\n    {\n      \"name\": \"openai\",\n      \"models\": [...],\n      \"configured\": false\n    },\n    {\n      \"name\": \"ollama\",\n      \"models\": [...],\n      \"configured\": true\n    }\n  ]\n}"
    }
  ]
}
```

## Troubleshooting Basic Issues

### 1. MCP Server Won't Start

```bash
# Check if dependencies are installed
npm install

# Check if project is built
npm run build

# Check for syntax errors
npm run dev
```

### 2. Tools Return Errors

```bash
# Check server logs
npm run dev

# Look for error messages in the console
```

### 3. No Response from Tools

```bash
# Verify MCP configuration in Kiro
cat ../.kiro/settings/mcp.json

# Check if server is running
ps aux | grep node
```

## Minimal Working Test Sequence

Run these tests in order to verify basic functionality:

```json
// Test 1: Server is alive
{"tool": "health_check", "args": {}}

// Test 2: Metrics are working
{"tool": "get_metrics", "args": {"format": "json"}}

// Test 3: Basic data operations (if database connected)
{"tool": "get_products", "args": {"limit": 1}}

// Test 4: Analytics (if database connected)
{"tool": "get_analytics", "args": {"type": "overview"}}
```

## Success Criteria

Your basic MCP server is working if:

- [ ] `health_check` returns "healthy" status
- [ ] `get_metrics` returns metrics data
- [ ] No JavaScript errors in server console
- [ ] MCP tools respond (even with database errors)
- [ ] Server stays running without crashing

## Next Steps

Once basic functionality works:

1. **Add database connection** to test data operations
2. **Configure AI providers** to test AI tools
3. **Set up monitoring stack** for full observability
4. **Run full test suite** with `./test-mcp-server.sh`