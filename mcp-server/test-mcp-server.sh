#!/bin/bash

# MCP Server Validation Test Script
# This script validates that your MCP server is properly configured and working

echo "🧪 MCP Server Validation Test Suite"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing $test_name... "
    
    if eval "$test_command" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to check if service is running
check_service() {
    local service_name="$1"
    local port="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Checking $service_name on port $port... "
    
    if curl -s --connect-timeout 5 "http://localhost:$port" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ RUNNING${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ NOT ACCESSIBLE${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo ""
echo "🔍 Phase 1: Infrastructure Tests"
echo "--------------------------------"

# Test 1: Check if Docker services are running
check_service "Prometheus" "9091"
check_service "Grafana" "3001"
check_service "Ollama" "11434"

# Test 2: Check MCP monitoring server
check_service "MCP Monitoring Server" "9090"

echo ""
echo "🏥 Phase 2: Health & Metrics Tests"
echo "----------------------------------"

# Test 3: Health endpoint
run_test "Health endpoint" "curl -s http://localhost:9090/health" '"status":"healthy"'

# Test 4: Metrics endpoint
run_test "Metrics endpoint" "curl -s http://localhost:9090/metrics" "mcp_requests_total"

# Test 5: Prometheus metrics collection
run_test "Prometheus connectivity" "curl -s http://localhost:9091/-/healthy" "Prometheus is Healthy"

# Test 6: Grafana API
run_test "Grafana API" "curl -s http://localhost:3001/api/health" '"database":"ok"'

echo ""
echo "🤖 Phase 3: AI Provider Tests"
echo "-----------------------------"

# Test 7: Ollama models
echo -n "Checking Ollama models... "
OLLAMA_MODELS=$(curl -s http://localhost:11434/api/tags 2>/dev/null | jq -r '.models[]?.name' 2>/dev/null | wc -l)
if [ "$OLLAMA_MODELS" -gt 0 ]; then
    echo -e "${GREEN}✅ $OLLAMA_MODELS models available${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  No models found (run: docker exec \$(docker-compose ps -q ollama) ollama pull llama2)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 8: Environment variables
echo -n "Checking environment configuration... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  .env file missing (copy from .env.example)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "📊 Phase 4: MCP Server Process Test"
echo "-----------------------------------"

# Test 9: Check if MCP server process can start
echo -n "Testing MCP server startup... "
if [ -f "dist/index.js" ]; then
    echo -e "${GREEN}✅ Built successfully${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Not built (run: npm run build)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 10: Node modules
echo -n "Checking dependencies... "
if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ Dependencies missing (run: npm install)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "🔧 Phase 5: Configuration Tests"
echo "-------------------------------"

# Test 11: Kiro MCP configuration
echo -n "Checking Kiro MCP configuration... "
if [ -f "../.kiro/settings/mcp.json" ]; then
    echo -e "${GREEN}✅ MCP config exists${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  MCP config missing (check .kiro/settings/mcp.json)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 12: Database configuration
echo -n "Checking database configuration... "
if grep -q "DATABASE_URL" .env 2>/dev/null; then
    echo -e "${GREEN}✅ Database URL configured${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  DATABASE_URL not set in .env${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "📋 Test Results Summary"
echo "======================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your MCP server is ready to use.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the MCP server: npm run dev"
    echo "2. Open Kiro IDE and test MCP tools"
    echo "3. Try the example queries in EXAMPLES.md"
    echo ""
    echo "Example MCP tool call to test in Kiro:"
    echo '{"tool": "ai_providers", "args": {}}'
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "• Run: docker-compose up -d (start services)"
    echo "• Run: npm install (install dependencies)"
    echo "• Run: npm run build (build the project)"
    echo "• Copy .env.example to .env and configure"
    echo "• Pull Ollama models: docker exec \$(docker-compose ps -q ollama) ollama pull llama2"
    echo ""
    echo "For detailed troubleshooting, see TESTING.md"
    exit 1
fi