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

### Deploy to Testnet

1. Set up your RPC URL and private key:

```bash
export RPC_URL=https://rpc.alpen.dev
export PRIVATE_KEY=your_private_key_here
```

2. Deploy the contract:

```bash
forge script script/Counter.s.sol:CounterScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

3. Verify the contract:

```bash
./script/verify.sh <deployed_address> Counter ""
```

### Missing Dependencies

If tests fail due to missing dependencies:

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```
