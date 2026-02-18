#!/bin/bash

# Smoke tests to verify backend, UI, and contracts are properly connected
# Usage: npm run test:smoke (from root directory)
# 
# This script performs basic connectivity checks before starting the full application.
# It helps catch configuration issues early without needing to start the UI.

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

echo -e "${BLUE}🧪 Running Smoke Tests${NC}"
echo "================================"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test and report
test_check() {
    local description=$1
    shift
    local command="$@"
    
    echo -n "  Testing: $description... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Check required tools
echo "1️⃣  Checking Required Tools"
echo "---------------------------"
test_check "Node.js is installed" "command_exists node"
test_check "npm is installed" "command_exists npm"
test_check "cast is installed (Foundry)" "command_exists cast" || echo -e "    ${YELLOW}⚠ Warning: cast not found. Install Foundry for contract tests.${NC}"
echo ""

# Test 2: Check backend configuration
echo "2️⃣  Backend API Configuration"
echo "-----------------------------"
if [ -f "packages/api/.env" ]; then
    echo -e "  ${GREEN}✓${NC} Backend .env file exists"
    ((PASSED++))
    
    # Source the .env file to check variables
    set +e
    source packages/api/.env 2>/dev/null
    set -e
    
    test_check "RPC_URL is set" "[ -n \"\$RPC_URL\" ]"
    test_check "SPONSOR_PRIVATE_KEY is set" "[ -n \"\$SPONSOR_PRIVATE_KEY\" ]"
    test_check "BATCH_CALL_AND_SPONSOR_ADDRESS is set" "[ -n \"\$BATCH_CALL_AND_SPONSOR_ADDRESS\" ]"
    
    # Validate address format
    if [[ -n "$BATCH_CALL_AND_SPONSOR_ADDRESS" ]] && [[ "$BATCH_CALL_AND_SPONSOR_ADDRESS" =~ ^0x[0-9a-fA-F]{40}$ ]]; then
        echo -e "    ${GREEN}✓${NC} BATCH_CALL_AND_SPONSOR_ADDRESS format is valid"
        ((PASSED++))
    elif [[ -n "$BATCH_CALL_AND_SPONSOR_ADDRESS" ]]; then
        echo -e "    ${RED}✗${NC} BATCH_CALL_AND_SPONSOR_ADDRESS format is invalid: $BATCH_CALL_AND_SPONSOR_ADDRESS"
        ((FAILED++))
    fi
else
    echo -e "  ${RED}✗${NC} Backend .env file not found at packages/api/.env"
    echo "    Create it by copying packages/api/.env.example"
    ((FAILED++))
fi
echo ""

# Test 3: Check UI configuration
echo "3️⃣  Frontend UI Configuration"
echo "-----------------------------"
if [ -f "packages/ui/.env" ]; then
    echo -e "  ${GREEN}✓${NC} UI .env file exists"
    ((PASSED++))
    
    # Check for required variables in .env file
    test_check "VITE_API_URL is set" "grep -q '^VITE_API_URL=' packages/ui/.env"
    test_check "VITE_COUNTER_CONTRACT_ADDRESS is set" "grep -q '^VITE_COUNTER_CONTRACT_ADDRESS=' packages/ui/.env"
    test_check "VITE_BATCH_CALL_AND_SPONSOR_ADDRESS is set" "grep -q '^VITE_BATCH_CALL_AND_SPONSOR_ADDRESS=' packages/ui/.env"
    test_check "VITE_SPONSOR_WHITELIST_ADDRESS is set" "grep -q '^VITE_SPONSOR_WHITELIST_ADDRESS=' packages/ui/.env"
else
    echo -e "  ${RED}✗${NC} UI .env file not found at packages/ui/.env"
    echo "    Create it by copying packages/ui/.env.example"
    ((FAILED++))
fi
echo ""

# Test 4: Check contract addresses match between backend and UI
echo "4️⃣  Contract Address Consistency"
echo "----------------------------------"
if [ -f "packages/api/.env" ] && [ -f "packages/ui/.env" ]; then
    # Extract addresses from .env files
    API_BATCH=$(grep "^BATCH_CALL_AND_SPONSOR_ADDRESS=" packages/api/.env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "")
    UI_BATCH=$(grep "^VITE_BATCH_CALL_AND_SPONSOR_ADDRESS=" packages/ui/.env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "")
    
    if [[ -n "$API_BATCH" ]] && [[ -n "$UI_BATCH" ]] && [[ "$API_BATCH" == "$UI_BATCH" ]]; then
        echo -e "  ${GREEN}✓${NC} BATCH_CALL_AND_SPONSOR_ADDRESS matches between backend and UI"
        ((PASSED++))
    elif [[ -n "$API_BATCH" ]] && [[ -n "$UI_BATCH" ]]; then
        echo -e "  ${RED}✗${NC} BATCH_CALL_AND_SPONSOR_ADDRESS mismatch:"
        echo "    Backend: $API_BATCH"
        echo "    UI:      $UI_BATCH"
        ((FAILED++))
    else
        echo -e "  ${YELLOW}⚠${NC} Cannot compare addresses (one or both are missing)"
    fi
    
    API_WHITELIST=$(grep "^SPONSOR_WHITELIST_ADDRESS=" packages/api/.env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "")
    UI_WHITELIST=$(grep "^VITE_SPONSOR_WHITELIST_ADDRESS=" packages/ui/.env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "")
    
    if [[ -n "$API_WHITELIST" ]] && [[ -n "$UI_WHITELIST" ]] && [[ "$API_WHITELIST" == "$UI_WHITELIST" ]]; then
        echo -e "  ${GREEN}✓${NC} SPONSOR_WHITELIST_ADDRESS matches between backend and UI"
        ((PASSED++))
    elif [[ -n "$API_WHITELIST" ]] && [[ -n "$UI_WHITELIST" ]]; then
        echo -e "  ${RED}✗${NC} SPONSOR_WHITELIST_ADDRESS mismatch:"
        echo "    Backend: $API_WHITELIST"
        echo "    UI:      $UI_WHITELIST"
        ((FAILED++))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Cannot check consistency (missing .env files)"
fi
echo ""

# Test 5: Check if backend API is running (optional)
echo "5️⃣  Backend API Connectivity (Optional)"
echo "----------------------------------------"
if command_exists curl; then
    API_URL=$(grep "^VITE_API_URL=" packages/ui/.env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "http://localhost:9999")
    API_URL="${API_URL%/api}"  # Remove /api suffix if present
    
    if curl -s -f "${API_URL}/api/health" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Backend API is running and responding at ${API_URL}"
        ((PASSED++))
    else
        echo -e "  ${YELLOW}⚠${NC} Backend API is not running or not accessible at ${API_URL}"
        echo "    Start it with: cd packages/api && npm run dev"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} curl not found, skipping API connectivity test"
fi
echo ""

# Test 6: Check contract connectivity (if cast is available and RPC_URL is set)
echo "6️⃣  Contract Connectivity (Optional)"
echo "-------------------------------------"
if command_exists cast && [ -f "packages/api/.env" ]; then
    source packages/api/.env 2>/dev/null || true
    
    if [[ -n "$RPC_URL" ]] && [[ -n "$BATCH_CALL_AND_SPONSOR_ADDRESS" ]]; then
        if cast code "$BATCH_CALL_AND_SPONSOR_ADDRESS" --rpc-url "$RPC_URL" > /dev/null 2>&1; then
            CODE=$(cast code "$BATCH_CALL_AND_SPONSOR_ADDRESS" --rpc-url "$RPC_URL" 2>/dev/null)
            if [[ "$CODE" != "0x" ]] && [[ -n "$CODE" ]]; then
                echo -e "  ${GREEN}✓${NC} BatchCallAndSponsor contract is deployed and accessible"
                ((PASSED++))
            else
                echo -e "  ${RED}✗${NC} BatchCallAndSponsor address has no code (not deployed or EOA)"
                ((FAILED++))
            fi
        else
            echo -e "  ${YELLOW}⚠${NC} Cannot connect to RPC or contract not found"
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} RPC_URL or contract address not set"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} cast not available or .env not found, skipping contract tests"
fi
echo ""

# Summary
echo "================================"
echo -e "${BLUE}Test Summary${NC}"
echo "================================"
echo -e "  ${GREEN}Passed: ${PASSED}${NC}"
echo -e "  ${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All smoke tests passed!${NC}"
    echo "You can proceed to start the application."
    exit 0
else
    echo -e "${RED}❌ Some smoke tests failed.${NC}"
    echo "Please fix the issues above before starting the application."
    exit 1
fi
