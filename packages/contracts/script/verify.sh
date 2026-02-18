#!/bin/bash

# Script for verifying contracts on Blockscout
# Usage: ./verify.sh [sponsor|batch|counter|both]

set -e

CHAIN_ID=8150
RPC_URL="https://rpc.testnet.alpenlabs.io"
EXPLORER_URL="https://explorer.testnet.alpenlabs.io/api"

# Use exported environment variables
# These should be set before running the script:
# export SPONSOR_WHITELIST_ADDRESS=<address>
# export BATCH_CALL_AND_SPONSOR_ADDRESS=<address>
# export COUNTER_ADDRESS=<address>

if [ -z "$ETHERSCAN_API_KEY" ]; then
    export ETHERSCAN_API_KEY="blockscout"
fi

# Function to check if a required environment variable is set
check_env_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo "❌ Error: Required environment variable $var_name is not set"
        echo "   Please set it before running this script:"
        echo "   export $var_name=<address>"
        exit 1
    fi
    
    # Basic validation: check if it looks like an Ethereum address
    if [[ ! "$var_value" =~ ^0x[0-9a-fA-F]{40}$ ]]; then
        echo "❌ Error: $var_name does not appear to be a valid Ethereum address: $var_value"
        exit 1
    fi
}

# Verify required environment variables based on the command
verify_env_vars() {
    local command="${1:-both}"
    
    case "$command" in
        sponsor)
            check_env_var "SPONSOR_WHITELIST_ADDRESS"
            ;;
        batch)
            check_env_var "BATCH_CALL_AND_SPONSOR_ADDRESS"
            check_env_var "SPONSOR_WHITELIST_ADDRESS"
            ;;
        counter)
            check_env_var "COUNTER_ADDRESS"
            ;;
        both)
            check_env_var "SPONSOR_WHITELIST_ADDRESS"
            check_env_var "BATCH_CALL_AND_SPONSOR_ADDRESS"
            ;;
    esac
}

verify_sponsor() {
    echo "Verifying SponsorWhitelist on Blockscout..."
    forge verify-contract \
        --chain-id $CHAIN_ID \
        --num-of-optimizations 200 \
        --watch \
        --verifier blockscout \
        --verifier-url $EXPLORER_URL \
        $SPONSOR_WHITELIST_ADDRESS \
        SponsorWhitelist \
        --constructor-args $(cast abi-encode "constructor(uint256,uint256)" 10 100)
    
    echo "✅ SponsorWhitelist verified on Blockscout"
    echo "   View on: https://explorer.testnet.alpenlabs.io/address/$SPONSOR_WHITELIST_ADDRESS"
}

verify_batch() {
    echo "Verifying BatchCallAndSponsor on Blockscout..."
    forge verify-contract \
        --chain-id $CHAIN_ID \
        --num-of-optimizations 200 \
        --watch \
        --verifier blockscout \
        --verifier-url $EXPLORER_URL \
        $BATCH_CALL_AND_SPONSOR_ADDRESS \
        BatchCallAndSponsor \
        --constructor-args $(cast abi-encode "constructor(address)" $SPONSOR_WHITELIST_ADDRESS)
    
    echo "✅ BatchCallAndSponsor verified on Blockscout"
    echo "   View on: https://explorer.testnet.alpenlabs.io/address/$BATCH_CALL_AND_SPONSOR_ADDRESS"
}

verify_counter() {
    echo "Verifying Counter on Blockscout..."
    forge verify-contract \
        --chain-id $CHAIN_ID \
        --num-of-optimizations 200 \
        --watch \
        --verifier blockscout \
        --verifier-url $EXPLORER_URL \
        $COUNTER_ADDRESS \
        Counter
    
    echo "✅ Counter verified on Blockscout"
    echo "   View on: https://explorer.testnet.alpenlabs.io/address/$COUNTER_ADDRESS"
}

# Main execution
COMMAND="${1:-both}"

# Verify environment variables before proceeding
verify_env_vars "$COMMAND"

case "$COMMAND" in
    sponsor)
        verify_sponsor
        ;;
    batch)
        verify_batch
        ;;
    counter)
        verify_counter
        ;;
    both)
        verify_sponsor
        echo ""
        verify_batch
        ;;
    *)
        echo "Usage: $0 [sponsor|batch|counter|both]"
        exit 1
        ;;
esac
