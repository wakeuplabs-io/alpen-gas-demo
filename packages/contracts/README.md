# Contracts Package

Smart contracts for gas sponsorship on the Alpen blockchain, built with Foundry.

## Technologies

- **Framework**: [Foundry](https://book.getfoundry.sh/)
- **Language**: Solidity 0.8.27
- **EVM Version**: Cancun
- **Testing**: Forge (Foundry's testing framework)

## Local Development Setup

### Step 1: Install Foundry

If you don't have Foundry installed:

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify installation:

```bash
forge --version
anvil --version
cast --version
```

### Step 2: Install Dependencies

```bash
cd packages/contracts

# Install OpenZeppelin contracts (if not already installed)
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

### Step 3: Build Contracts

```bash
forge build
```

This compiles all contracts and outputs artifacts to `out/`.

### Step 4: Run Tests

```bash
forge test
```

For verbose output:

```bash
forge test -vvv
```

## Project Structure

```
packages/contracts/
├── src/
│   ├── Counter.sol              # Counter contract
│   ├── BatchCall.sol            # Batch call contract
│   └── SponsorWhitelist.sol     # Whitelist contract
├── test/
│   ├── Counter.t.sol            # Counter tests
│   └── SponsorWhitelist.t.sol    # Whitelist tests
├── script/
│   ├── Counter.s.sol            # Deployment script
│   ├── BatchCallAndSponsor.s.sol # Deployment script
│   ├── AllowContract.s.sol     # Add contract to allow list
│   └── verify.sh                # Verification script
├── foundry.toml                 # Foundry configuration
└── lib/                         # Dependencies (OpenZeppelin, etc.)
```

## Contracts Overview

### Counter.sol

Simple counter contract that can be incremented. Used as a demo contract for gas sponsorship.

### BatchCall.sol

Contract that allows batching multiple calls together.

### SponsorWhitelist.sol

Manages whitelist for gas sponsorship eligibility.

## Testing

### Run All Tests

```bash
forge test
```

### Run Specific Test File

```bash
forge test --match-path test/Counter.t.sol
```

## Deployment


### Deploy Counter Contract

1. Set up your RPC URL and private key:

```bash
export RPC_URL=https://rpc.testnet.alpenlabs.io
export PRIVATE_KEY=your_private_key_here
```

2. Deploy the Counter contract:

```bash
forge script script/Counter.s.sol:CounterScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

3. Verify the Counter contract:

```bash
export COUNTER_ADDRESS=<counter_address>
./script/verify.sh counter
```

4. Add Counter to the SponsorWhitelist allow list:

```bash
export SPONSOR_WHITELIST_ADDRESS=<sponsor_whitelist_address>
export COUNTER_ADDRESS=<counter_address>
forge script script/AllowContract.s.sol:AllowContractScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Deploy BatchCallAndSponsor and SponsorWhitelist

1. Set up your RPC URL and private key:

```bash
export RPC_URL=https://rpc.testnet.alpenlabs.io
export PRIVATE_KEY=your_private_key_here
```

2. Deploy both contracts (SponsorWhitelist and BatchCallAndSponsor):

```bash
forge script script/BatchCallAndSponsor.s.sol:BatchCallAndSponsorScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

The script will output the deployed addresses:
- `SponsorWhitelist deployed at: <address>`
- `BatchCallAndSponsor deployed at: <address>`

3. Save the deployed addresses as environment variables:

```bash
export SPONSOR_WHITELIST_ADDRESS=<sponsor_whitelist_address>
export BATCH_CALL_ADDRESS=<batch_call_address>
```

4. Verify the contracts on Blockscout:

```bash
# Verify both contracts
./script/verify.sh both

# Or verify individually
./script/verify.sh sponsor  # Verify SponsorWhitelist only
./script/verify.sh batch    # Verify BatchCallAndSponsor only
```

5. **Test contract configuration (dry-run)** - Verify contracts work before configuring backend:

```bash
# Make sure you have the contract addresses set
export SPONSOR_WHITELIST_ADDRESS=<sponsor_whitelist_address>
export BATCH_CALL_AND_SPONSOR_ADDRESS=<batch_call_address>
export COUNTER_ADDRESS=<counter_address>

# Run dry-run tests
./script/test-contracts.sh
```

This script uses `cast call` to simulate contract interactions without sending transactions. It verifies:
- Counter contract is readable
- Counter is properly whitelisted
- Whitelist configuration is correct
- Contracts are properly deployed

If all tests pass, you can proceed to configure the backend API.

### Missing Dependencies

If tests fail due to missing dependencies:

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```
