#!/bin/bash

# Script for verifying contracts on Blockscout
# Usage: ./verify.sh [sponsor|batch|counter|both]

set -e

CHAIN_ID=8150
RPC_URL="https://rpc.testnet.alpenlabs.io"
EXPLORER_URL="https://explorer.testnet.alpenlabs.io/api"

# Use exported environment variables
# These should be set before running the script:
# export SPONSOR_WHITELIST=<address>
# export BATCH_CALL=<address>
# export COUNTER=<address>

if [ -z "$ETHERSCAN_API_KEY" ]; then
    export ETHERSCAN_API_KEY="blockscout"
fi

verify_sponsor() {
    echo "Verifying SponsorWhitelist on Blockscout..."
    forge verify-contract \
        --chain-id $CHAIN_ID \
        --num-of-optimizations 200 \
        --watch \
        --etherscan-api-key $ETHERSCAN_API_KEY \
        --verifier blockscout \
        --verifier-url $EXPLORER_URL \
        $SPONSOR_WHITELIST \
        SponsorWhitelist \
        --constructor-args $(cast abi-encode "constructor(uint256,uint256)" 10 100)
    
    echo "✅ SponsorWhitelist verified on Blockscout"
    echo "   View on: https://explorer.testnet.alpenlabs.io/address/$SPONSOR_WHITELIST"
}

verify_batch() {
    echo "Verifying BatchCallAndSponsor on Blockscout..."
    forge verify-contract \
        --chain-id $CHAIN_ID \
        --num-of-optimizations 200 \
        --watch \
        --etherscan-api-key $ETHERSCAN_API_KEY \
        --verifier blockscout \
        --verifier-url $EXPLORER_URL \
        $BATCH_CALL \
        BatchCallAndSponsor \
        --constructor-args $(cast abi-encode "constructor(address)" $SPONSOR_WHITELIST)
    
    echo "✅ BatchCallAndSponsor verified on Blockscout"
    echo "   View on: https://explorer.testnet.alpenlabs.io/address/$BATCH_CALL"
}

verify_counter() {
    echo "Verifying Counter on Blockscout..."
    forge verify-contract \
        --chain-id $CHAIN_ID \
        --num-of-optimizations 200 \
        --watch \
        --etherscan-api-key $ETHERSCAN_API_KEY \
        --verifier blockscout \
        --verifier-url $EXPLORER_URL \
        $COUNTER \
        Counter
    
    echo "✅ Counter verified on Blockscout"
    echo "   View on: https://explorer.testnet.alpenlabs.io/address/$COUNTER"
}

case "${1:-both}" in
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
