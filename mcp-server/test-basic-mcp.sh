#!/bin/bash

# Basic MCP Server Test (No AI Required)
# Tests only core MCP functionality without any AI providers

echo "🧪 Basic MCP Server Test (No AI)"
echo "================================"

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

echo ""
echo "🔧 Phase 1: Build & Dependencies"
echo "--------------------------------"

# Test 1: Check if built
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Checking if project is built... "
if [ -f "dist/index.js" ]; then
    echo -e "${GREEN}✅ BUILT${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  Building now...${NC}"
    npm run build > /dev/null 2>&1
    if [ -f "dist/index.js" ]; then
        echo -e "${GREEN}✅ BUILD SUCCESS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ BUILD FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

# Test 2: Dependencies
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ INSTALLED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  Installing...${NC}"
    npm install > /dev/null 2>&1
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ INSTALL SUCCESS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ INSTALL FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

echo ""
echo "🏥 Phase 2: HTTP Endpoints (Optional)"
echo "------------------------------------"

# Test 3: Check if monitoring server is running
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Checking monitoring server... "
if curl -s --connect-timeout 3 "http://localhost:9090/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RUNNING${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Test health endpoint
    run_test "Health endpoint" "curl -s http://localhost:9090/health" '"status"'
    
    # Test metrics endpoint
    run_test "Metrics endpoint" "curl -s http://localhost:9090/metrics" "process_"
    
else
    echo -e "${YELLOW}⚠️  NOT RUNNING (optional)${NC}"
    echo "   To start: npm run dev (in another terminal)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "📋 Phase 3: MCP Configuration"
echo "-----------------------------"

# Test 4: MCP configuration exists
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Checking MCP configuration... "
if [ -f "../.kiro/settings/mcp.json" ]; then
    echo -e "${GREEN}✅ EXISTS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  MISSING${NC}"
    echo "   MCP config not found at .kiro/settings/mcp.json"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 5: Environment file
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Checking environment file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ EXISTS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  MISSING (creating from example)${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ CREATED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ NO EXAMPLE FILE${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

echo ""
echo "🧪 Phase 4: MCP Server Process Test"
echo "-----------------------------------"

# Test 6: Can start MCP server process
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing MCP server startup... "

# Create a test script to start the server briefly
cat > test_mcp_startup.js << 'EOF'
const { spawn } = require('child_process');

const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let hasError = false;

server.stdout.on('data', (data) => {
    output += data.toString();
});

server.stderr.on('data', (data) => {
    const errorStr = data.toString();
    if (errorStr.includes('E-commerce MCP Server running')) {
        console.log('SUCCESS');
        server.kill();
        process.exit(0);
    }
    if (errorStr.includes('Error') || errorStr.includes('error')) {
        hasError = true;
    }
});

setTimeout(() => {
    if (!hasError && output.length === 0) {
        console.log('SUCCESS');
    } else {
        console.log('FAILED');
    }
    server.kill();
    process.exit(hasError ? 1 : 0);
}, 3000);
EOF

if node test_mcp_startup.js 2>/dev/null | grep -q "SUCCESS"; then
    echo -e "${GREEN}✅ CAN START${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ STARTUP FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Cleanup
rm -f test_mcp_startup.js

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Basic MCP server is ready!${NC}"
    echo ""
    echo "✅ What works:"
    echo "• MCP server can start"
    echo "• Dependencies are installed"
    echo "• Configuration files exist"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Start MCP server: npm run dev"
    echo "2. Test in Kiro IDE with these basic tools:"
    echo '   {"tool": "health_check", "args": {}}'
    echo '   {"tool": "get_metrics", "args": {"format": "json"}}'
    echo ""
    echo "📖 For more tests, see BASIC-TESTING.md"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Some basic tests failed.${NC}"
    echo ""
    echo "🔧 Common fixes:"
    echo "• Run: npm install"
    echo "• Run: npm run build"
    echo "• Check Node.js version (need 18+)"
    echo "• Copy .env.example to .env"
    echo ""
    echo "📖 For detailed help, see BASIC-TESTING.md"
    exit 1
fi