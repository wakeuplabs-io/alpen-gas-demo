// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import {Script, console} from "forge-std/Script.sol";
import {BatchCallAndSponsor} from "../src/BatchCall.sol";

contract BatchCallAndSponsorScript is Script {
    BatchCallAndSponsor public batchCallAndSponsor;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        batchCallAndSponsor = new BatchCallAndSponsor();

        console.log("BatchCallAndSponsor deployed at:", address(batchCallAndSponsor));

        vm.stopBroadcast();
    }
}
