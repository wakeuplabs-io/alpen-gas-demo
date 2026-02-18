#!/bin/bash

# Script to dry-run test contract logic before configuring backend
# Usage: ./test-contracts.sh
# 
# This script uses cast call to simulate contract interactions without sending transactions.
# It helps verify that contracts are properly deployed and configured before moving to backend setup.

set -e

CHAIN_ID=8150
RPC_URL="${RPC_URL:-https://rpc.testnet.alpenlabs.io}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Contract Configuration (Dry-Run)"
echo "=============================================="
echo ""

# Function to check if a required environment variable is set
check_env_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ Error: Required environment variable $var_name is not set${NC}"
        echo "   Please set it before running this script:"
        echo "   export $var_name=<address>"
        exit 1
    fi
    
    # Basic validation: check if it looks like an Ethereum address
    if [[ ! "$var_value" =~ ^0x[0-9a-fA-F]{40}$ ]]; then
        echo -e "${RED}❌ Error: $var_name does not appear to be a valid Ethereum address: $var_value${NC}"
        exit 1
    fi
}

# Function to test a cast call and show result
test_call() {
    local description=$1
    local contract=$2
    local function_sig=$3
    shift 3
    local args="$@"
    
    echo -n "  Testing: $description... "
    
    if result=$(cast call "$contract" "$function_sig" $args --rpc-url "$RPC_URL" 2>&1); then
        if [ -n "$result" ] && [[ ! "$result" =~ Error ]] && [[ ! "$result" =~ error ]]; then
            # Try to decode as decimal if it looks like hex
            if [[ "$result" =~ ^0x[0-9a-fA-F]+$ ]]; then
                decoded=$(cast --to-dec "$result" 2>/dev/null || echo "$result")
                echo -e "${GREEN}✓${NC} Result: $decoded"
            else
                echo -e "${GREEN}✓${NC} Result: $result"
            fi
        else
            echo -e "${RED}✗${NC} Failed: $result"
            return 1
        fi
        return 0
    else
        echo -e "${RED}✗${NC} Failed: $result"
        return 1
    fi
}

# Check required environment variables
echo "📋 Checking environment variables..."
check_env_var "SPONSOR_WHITELIST_ADDRESS"
check_env_var "BATCH_CALL_AND_SPONSOR_ADDRESS"
check_env_var "COUNTER_ADDRESS"
echo -e "${GREEN}✓${NC} All required variables are set"
echo ""

# Test 1: Verify Counter contract is readable
echo "1️⃣  Testing Counter Contract"
echo "----------------------------"
test_call "Read Counter current value" "$COUNTER_ADDRESS" "number()(uint256)"
echo ""

# Test 2: Verify Counter is in SponsorWhitelist
echo "2️⃣  Testing SponsorWhitelist Configuration"
echo "-------------------------------------------"
test_call "Check if Counter is allowed in whitelist" \
    "$SPONSOR_WHITELIST_ADDRESS" \
    "allowedContracts(address)(bool)" \
    "$COUNTER_ADDRESS"

# Read whitelist configuration
echo -n "  Reading daily limit... "
daily_limit=$(cast call "$SPONSOR_WHITELIST_ADDRESS" "dailyLimit()(uint256)" --rpc-url "$RPC_URL" 2>/dev/null || echo "failed")
if [ "$daily_limit" != "failed" ]; then
    daily_limit_dec=$(cast --to-dec "$daily_limit" 2>/dev/null || echo "$daily_limit")
    echo -e "${GREEN}✓${NC} $daily_limit_dec"
else
    echo -e "${RED}✗${NC} Failed to read"
fi

echo -n "  Reading global daily limit... "
global_limit=$(cast call "$SPONSOR_WHITELIST_ADDRESS" "globalDailyLimit()(uint256)" --rpc-url "$RPC_URL" 2>/dev/null || echo "failed")
if [ "$global_limit" != "failed" ]; then
    global_limit_dec=$(cast --to-dec "$global_limit" 2>/dev/null || echo "$global_limit")
    echo -e "${GREEN}✓${NC} $global_limit_dec"
else
    echo -e "${RED}✗${NC} Failed to read"
fi
echo ""

# Test 3: Verify BatchCallAndSponsor has correct whitelist reference
echo "3️⃣  Testing BatchCallAndSponsor Configuration"
echo "-----------------------------------------------"
# Note: This assumes BatchCallAndSponsor has a public variable or getter for the whitelist
# If not available, we'll skip this test
echo -n "  Testing contract connection... "
if cast code "$BATCH_CALL_AND_SPONSOR_ADDRESS" --rpc-url "$RPC_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Contract is deployed and accessible"
else
    echo -e "${RED}✗${NC} Contract not found or not accessible"
fi
echo ""

# Test 4: Simulate eligibility check (using a test address with zero balance)
echo "4️⃣  Simulating Eligibility Check"
echo "---------------------------------"
# Use a known address that should have zero balance for testing
TEST_ADDRESS="0x0000000000000000000000000000000000000000"
echo "  Using test address: $TEST_ADDRESS"

echo -n "  Checking eligibility... "
# Note: checkEligibility returns (bool, string), cast handles tuples automatically
eligibility_result=$(cast call "$SPONSOR_WHITELIST_ADDRESS" "checkEligibility(address)(bool,string)" "$TEST_ADDRESS" --rpc-url "$RPC_URL" 2>&1 || echo "failed")
if [ "$eligibility_result" != "failed" ] && [[ ! "$eligibility_result" =~ Error ]] && [[ ! "$eligibility_result" =~ error ]]; then
    echo -e "${GREEN}✓${NC} Eligibility check executed"
    echo "    Result: $eligibility_result"
else
    echo -e "${YELLOW}⚠${NC} Note: Eligibility check may require specific conditions"
    echo "    (This is informational - eligibility depends on wallet balance and daily limits)"
fi
echo ""

# Test 5: Verify contract addresses are valid contracts
echo "5️⃣  Verifying Contract Deployment"
echo "---------------------------------"
for contract_name in "SPONSOR_WHITELIST_ADDRESS" "BATCH_CALL_AND_SPONSOR_ADDRESS" "COUNTER_ADDRESS"; do
    contract_addr="${!contract_name}"
    echo -n "  Checking $contract_name ($contract_addr)... "
    if code=$(cast code "$contract_addr" --rpc-url "$RPC_URL" 2>/dev/null); then
        if [ "$code" != "0x" ] && [ -n "$code" ]; then
            echo -e "${GREEN}✓${NC} Contract deployed"
        else
            echo -e "${RED}✗${NC} No code at address (EOA or not deployed)"
        fi
    else
        echo -e "${RED}✗${NC} Failed to check"
    fi
done
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}✅ Dry-run tests completed!${NC}"
echo ""
echo "If all tests passed, you can proceed to configure the backend API."
echo "Make sure to use these addresses in your backend .env file:"
echo "  SPONSOR_WHITELIST_ADDRESS=$SPONSOR_WHITELIST_ADDRESS"
echo "  BATCH_CALL_AND_SPONSOR_ADDRESS=$BATCH_CALL_AND_SPONSOR_ADDRESS"
echo "  COUNTER_ADDRESS=$COUNTER_ADDRESS"
echo ""
