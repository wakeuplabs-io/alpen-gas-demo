// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import {Script, console} from "forge-std/Script.sol";
import {BatchCallAndSponsor} from "../src/BatchCall.sol";
import {SponsorWhitelist} from "../src/SponsorWhitelist.sol";

contract BatchCallAndSponsorScript is Script {
    BatchCallAndSponsor public batchCallAndSponsor;
    SponsorWhitelist public sponsorWhitelist;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        uint256 dailyLimit = 10;
        uint256 globalDailyLimit = 100;
        sponsorWhitelist = new SponsorWhitelist(dailyLimit, globalDailyLimit);
        console.log("SponsorWhitelist deployed at:", address(sponsorWhitelist));

        batchCallAndSponsor = new BatchCallAndSponsor(address(sponsorWhitelist));
        console.log("BatchCallAndSponsor deployed at:", address(batchCallAndSponsor));

        address counterAddress = vm.envAddress("COUNTER_ADDRESS");
        sponsorWhitelist.allowContract(counterAddress);
        console.log("Counter whitelisted at:", counterAddress);

        vm.stopBroadcast();
    }
}
