// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {SponsorWhitelist} from "../src/SponsorWhitelist.sol";

// Base contract with shared setup and constants
abstract contract SponsorWhitelistTestBase is Test {
    SponsorWhitelist public sponsorWhitelist;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public newOwner = address(0x4);
    address public contract1 = address(0x5);
    address public contract2 = address(0x6);
    
    uint256 public constant DAILY_LIMIT = 10;
    uint256 public constant GLOBAL_DAILY_LIMIT = 100;
    uint256 public constant DAY_IN_SECONDS = 86400;

    function setUp() public virtual {
        vm.prank(owner);
        sponsorWhitelist = new SponsorWhitelist(DAILY_LIMIT, GLOBAL_DAILY_LIMIT);
    }
}

contract SponsorWhitelistInitializationTest is SponsorWhitelistTestBase {
    function test_Constructor_SetsOwner() public {
        assertEq(sponsorWhitelist.owner(), owner);
    }

    function test_Constructor_SetsDailyLimit() public {
        assertEq(sponsorWhitelist.dailyLimit(), DAILY_LIMIT);
    }

    function test_Constructor_SetsGlobalDailyLimit() public {
        assertEq(sponsorWhitelist.globalDailyLimit(), GLOBAL_DAILY_LIMIT);
    }
}

contract SponsorWhitelistOwnershipTest is SponsorWhitelistTestBase {
    function test_TransferOwnership_Success() public {
        vm.prank(owner);
        sponsorWhitelist.transferOwnership(newOwner);
        
        assertEq(sponsorWhitelist.owner(), newOwner);
    }

    function test_TransferOwnership_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit SponsorWhitelist.OwnershipTransferred(owner, newOwner);
        
        vm.prank(owner);
        sponsorWhitelist.transferOwnership(newOwner);
    }

    function test_TransferOwnership_RevertsIfNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(SponsorWhitelist.NotOwner.selector);
        sponsorWhitelist.transferOwnership(newOwner);
    }
}

contract SponsorWhitelistDailyLimitConfigTest is SponsorWhitelistTestBase {
    function test_SetDailyLimit_Success() public {
        uint256 newLimit = 20;
        
        vm.prank(owner);
        sponsorWhitelist.setDailyLimit(newLimit);
        
        assertEq(sponsorWhitelist.dailyLimit(), newLimit);
    }

    function test_SetDailyLimit_EmitsEvent() public {
        uint256 newLimit = 20;
        
        vm.expectEmit(true, false, false, true);
        emit SponsorWhitelist.DailyLimitUpdated(newLimit);
        
        vm.prank(owner);
        sponsorWhitelist.setDailyLimit(newLimit);
    }

    function test_SetDailyLimit_RevertsIfNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(SponsorWhitelist.NotOwner.selector);
        sponsorWhitelist.setDailyLimit(20);
    }
}

contract SponsorWhitelistContractWhitelistTest is SponsorWhitelistTestBase {
    function test_AllowContract_Success() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        assertTrue(sponsorWhitelist.allowedContracts(contract1));
    }

    function test_AllowContract_EmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit SponsorWhitelist.ContractAllowed(contract1, true);
        
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
    }

    function test_DisallowContract_Success() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        vm.prank(owner);
        sponsorWhitelist.disallowContract(contract1);
        
        assertFalse(sponsorWhitelist.allowedContracts(contract1));
    }

    function test_DisallowContract_EmitsEvent() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        vm.expectEmit(true, false, false, true);
        emit SponsorWhitelist.ContractAllowed(contract1, false);
        
        vm.prank(owner);
        sponsorWhitelist.disallowContract(contract1);
    }

    function test_AllowContract_RevertsIfNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(SponsorWhitelist.NotOwner.selector);
        sponsorWhitelist.allowContract(contract1);
    }

    function test_DisallowContract_RevertsIfNotOwner() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        vm.prank(user1);
        vm.expectRevert(SponsorWhitelist.NotOwner.selector);
        sponsorWhitelist.disallowContract(contract1);
    }
}

contract SponsorWhitelistEligibilityTest is SponsorWhitelistTestBase {
    function test_CheckEligibility_WalletWithBalance_ReturnsNotEligible() public {
        vm.deal(user1, 1 ether);
        
        (bool eligible, string memory reason) = sponsorWhitelist.checkEligibility(user1);
        
        assertFalse(eligible);
        assertEq(reason, "WalletNotEligible");
    }

    function test_CheckEligibility_WalletWithoutBalance_ReturnsEligible() public {
        (bool eligible, string memory reason) = sponsorWhitelist.checkEligibility(user1);
        
        assertTrue(eligible);
        assertEq(reason, "");
    }

    function test_CheckEligibility_WalletReachedDailyLimit_ReturnsNotEligible() public {
        // Setup: allow contract and use up daily limit
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        // Use up the daily limit
        for (uint256 i = 0; i < DAILY_LIMIT; i++) {
            vm.prank(contract1);
            sponsorWhitelist.validateSponsorship(user1, contracts);
            
            uint256 usageAfter = sponsorWhitelist.dailyUsage(user1);
            assertEq(usageAfter, i + 1, "Usage should increment by 1 each call");
        }
        
        uint256 finalUsage = sponsorWhitelist.dailyUsage(user1);
        uint256 finalLastDay = sponsorWhitelist.lastUsageDay(user1);
        uint256 currentDay = sponsorWhitelist.getCurrentDay();
        
        console.log("Final daily usage:", finalUsage);
        console.log("Final last usage day:", finalLastDay);
        console.log("Current day:", currentDay);
        console.log("Daily limit:", sponsorWhitelist.dailyLimit());
        
        assertEq(finalUsage, DAILY_LIMIT, "Final usage should equal daily limit");
        assertEq(finalLastDay, currentDay, "Last usage day should equal current day");
        
        (bool eligible, string memory reason) = sponsorWhitelist.checkEligibility(user1);
        
        console.log("=== Eligibility check result ===");
        console.log("Eligible:", eligible);
        console.log("Reason:", reason);
        
        assertFalse(eligible, "Should not be eligible after reaching daily limit");
        assertEq(reason, "DailyLimitReached", "Reason should be DailyLimitReached");
    }

    function test_CheckEligibility_WalletUnderDailyLimit_ReturnsEligible() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        (bool eligible, string memory reason) = sponsorWhitelist.checkEligibility(user1);
        
        assertTrue(eligible);
        assertEq(reason, "");
    }

    function test_CheckEligibility_NewDay_ResetsEligibility() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        // Use up the daily limit
        for (uint256 i = 0; i < DAILY_LIMIT; i++) {
            vm.prank(contract1);
            sponsorWhitelist.validateSponsorship(user1, contracts);
        }
        
        // Move to next day
        vm.warp(block.timestamp + DAY_IN_SECONDS);
        
        (bool eligible, string memory reason) = sponsorWhitelist.checkEligibility(user1);
        
        assertTrue(eligible);
        assertEq(reason, "");
    }
}

contract SponsorWhitelistValidationSuccessTest is SponsorWhitelistTestBase {
    function test_ValidateSponsorship_Success_IncrementsUsage() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        assertEq(sponsorWhitelist.dailyUsage(user1), 1);
        assertEq(sponsorWhitelist.globalDailyUsage(), 1);
    }

    function test_ValidateSponsorship_EmptyContractsArray_Success() public {
        address[] memory contracts = new address[](0);
        
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        assertEq(sponsorWhitelist.dailyUsage(user1), 1);
    }

    function test_ValidateSponsorship_MultipleContracts_AllAllowed_Success() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract2);
        
        address[] memory contracts = new address[](2);
        contracts[0] = contract1;
        contracts[1] = contract2;
        
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        assertEq(sponsorWhitelist.dailyUsage(user1), 1);
    }

    function test_ValidateSponsorship_DifferentUsers_TrackedSeparately() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user2, contracts);
        
        assertEq(sponsorWhitelist.dailyUsage(user1), 1);
        assertEq(sponsorWhitelist.dailyUsage(user2), 1);
        assertEq(sponsorWhitelist.globalDailyUsage(), 2);
    }

    function test_ValidateSponsorship_UpdatesLastUsageTimestamp() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        uint256 timestamp = 1000;
        vm.warp(timestamp);
        
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        assertEq(sponsorWhitelist.lastGlobalUsageTimestamp(), timestamp);
    }

    function test_ValidateSponsorship_SetsLastUsageDay() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        uint256 day = 10;
        vm.warp(day * DAY_IN_SECONDS);
        
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        assertEq(sponsorWhitelist.lastUsageDay(user1), day);
    }
}

contract SponsorWhitelistValidationErrorTest is SponsorWhitelistTestBase {
    function test_ValidateSponsorship_WalletWithBalance_Reverts() public {
        vm.deal(user1, 1 ether);
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        vm.prank(contract1);
        vm.expectRevert(
            abi.encodeWithSelector(SponsorWhitelist.WalletNotEligible.selector, user1)
        );
        sponsorWhitelist.validateSponsorship(user1, contracts);
    }

    function test_ValidateSponsorship_ContractNotAllowed_Reverts() public {
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        vm.prank(contract1);
        vm.expectRevert(
            abi.encodeWithSelector(SponsorWhitelist.ContractNotAllowed.selector, contract1)
        );
        sponsorWhitelist.validateSponsorship(user1, contracts);
    }

    function test_ValidateSponsorship_MultipleContracts_AllMustBeAllowed() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        // contract2 is not allowed
        
        address[] memory contracts = new address[](2);
        contracts[0] = contract1;
        contracts[1] = contract2;
        
        vm.prank(contract1);
        vm.expectRevert(
            abi.encodeWithSelector(SponsorWhitelist.ContractNotAllowed.selector, contract2)
        );
        sponsorWhitelist.validateSponsorship(user1, contracts);
    }

    function test_ValidateSponsorship_ReachesDailyLimit_Reverts() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        // Use up the daily limit
        for (uint256 i = 0; i < DAILY_LIMIT; i++) {
            vm.prank(contract1);
            sponsorWhitelist.validateSponsorship(user1, contracts);
        }
        
        // Next call should revert
        vm.prank(contract1);
        vm.expectRevert(
            abi.encodeWithSelector(SponsorWhitelist.DailyLimitReached.selector, user1)
        );
        sponsorWhitelist.validateSponsorship(user1, contracts);
    }

    function test_ValidateSponsorship_ReachesGlobalDailyLimit_Reverts() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        // Use up the global daily limit with different users
        for (uint256 i = 0; i < GLOBAL_DAILY_LIMIT; i++) {
            address user = address(uint160(i + 100)); // Different addresses
            vm.prank(contract1);
            sponsorWhitelist.validateSponsorship(user, contracts);
        }
        
        // Next call should revert
        vm.prank(contract1);
        vm.expectRevert(SponsorWhitelist.GlobalDailyLimitReached.selector);
        sponsorWhitelist.validateSponsorship(user1, contracts);
    }
}

contract SponsorWhitelistDailyLimitsTest is SponsorWhitelistTestBase {
    function test_ValidateSponsorship_NewDay_ResetsDailyUsage() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        // Use up the daily limit
        for (uint256 i = 0; i < DAILY_LIMIT; i++) {
            vm.prank(contract1);
            sponsorWhitelist.validateSponsorship(user1, contracts);
        }
        
        // Move to next day
        vm.warp(block.timestamp + DAY_IN_SECONDS);
        
        // Should work again
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        assertEq(sponsorWhitelist.dailyUsage(user1), 1);
    }

    function test_ValidateSponsorship_NewDay_ResetsGlobalDailyUsage() public {
        vm.prank(owner);
        sponsorWhitelist.allowContract(contract1);
        
        address[] memory contracts = new address[](1);
        contracts[0] = contract1;
        
        // Use up the global daily limit
        for (uint256 i = 0; i < GLOBAL_DAILY_LIMIT; i++) {
            address user = address(uint160(i + 100));
            vm.prank(contract1);
            sponsorWhitelist.validateSponsorship(user, contracts);
        }
        
        // Move to next day
        vm.warp(block.timestamp + DAY_IN_SECONDS);
        
        // Should work again
        vm.prank(contract1);
        sponsorWhitelist.validateSponsorship(user1, contracts);
        
        assertEq(sponsorWhitelist.globalDailyUsage(), 1);
    }
}

contract SponsorWhitelistUtilityTest is SponsorWhitelistTestBase {
    function test_GetCurrentDay_ReturnsCorrectDay() public {
        uint256 timestamp = 1728000; // Day 20
        vm.warp(timestamp);
        
        uint256 currentDay = sponsorWhitelist.getCurrentDay();
        assertEq(currentDay, timestamp / DAY_IN_SECONDS);
    }
}
