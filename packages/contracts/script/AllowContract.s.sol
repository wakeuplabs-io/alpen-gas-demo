// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import {Script, console} from "forge-std/Script.sol";
import {SponsorWhitelist} from "../src/SponsorWhitelist.sol";

/**
 * @notice Script to add a contract to the SponsorWhitelist allow list.
 * 
 * Usage:
 * 1. Set environment variables:
 *    export SPONSOR_WHITELIST_ADDRESS=<deployed_sponsor_whitelist_address>
 *    export COUNTER_ADDRESS=<counter_address_to_whitelist>
 *    export RPC_URL=https://rpc.testnet.alpenlabs.io
 *    export PRIVATE_KEY=<your_private_key>
 * 
 * 2. Run the script:
 *    forge script script/AllowContract.s.sol:AllowContractScript \
 *      --rpc-url $RPC_URL \
 *      --private-key $PRIVATE_KEY \
 *      --broadcast
 */
contract AllowContractScript is Script {
    function setUp() public {}

    function run() public {
        address sponsorWhitelistAddress = vm.envAddress("SPONSOR_WHITELIST");
        address counterAddress = vm.envAddress("COUNTER");

        SponsorWhitelist sponsorWhitelist = SponsorWhitelist(sponsorWhitelistAddress);

        console.log("SponsorWhitelist address:", sponsorWhitelistAddress);
        console.log("Counter address to whitelist:", counterAddress);

        // Check if already allowed
        bool isAllowed = sponsorWhitelist.allowedContracts(counterAddress);
        if (isAllowed) {
            console.log("Counter is already whitelisted");
            return;
        }

        vm.startBroadcast();

        // Add Counter to allow list
        sponsorWhitelist.allowContract(counterAddress);
        console.log("Counter successfully added to allow list");

        // Verify it was added
        bool nowAllowed = sponsorWhitelist.allowedContracts(counterAddress);
        require(nowAllowed, "Failed to add contract to allow list");

        vm.stopBroadcast();
    }
}
