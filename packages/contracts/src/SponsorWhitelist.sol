// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

contract SponsorWhitelist {
    address public owner;

    mapping(address => bool) public allowedContracts;
    mapping(address => uint256) public dailyUsage;
    mapping(address => uint256) public lastUsageDay;

    uint256 public dailyLimit;
    uint256 public lastGlobalUsageTimestamp;
    uint256 public globalDailyLimit;
    uint256 public globalDailyUsage;
    uint256 public constant DAY_IN_SECONDS = 86400;

    event ContractAllowed(address indexed contractAddress, bool allowed);
    event DailyLimitUpdated(uint256 newLimit);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error ContractNotAllowed(address contractAddress);
    error DailyLimitReached(address wallet);
    error WalletNotEligible(address wallet);
    error GlobalDailyLimitReached();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(uint256 _dailyLimit, uint256 _globalDailyLimit) {
        owner = msg.sender;
        dailyLimit = _dailyLimit;
        globalDailyLimit = _globalDailyLimit;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function setDailyLimit(uint256 _dailyLimit) external onlyOwner {
        dailyLimit = _dailyLimit;
        emit DailyLimitUpdated(_dailyLimit);
    }

    function allowContract(address contractAddress) external onlyOwner {
        allowedContracts[contractAddress] = true;
        emit ContractAllowed(contractAddress, true);
    }

    function disallowContract(address contractAddress) external onlyOwner {
        allowedContracts[contractAddress] = false;
        emit ContractAllowed(contractAddress, false);
    }

    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / DAY_IN_SECONDS;
    }

    function getTodayUsage(address wallet) public view returns (uint256) {
        uint256 currentDay = getCurrentDay();
        if (lastUsageDay[wallet] == currentDay) {
            return dailyUsage[wallet];
        }
        return 0;
    }

    function getTodayGlobalUsage() public view returns (uint256) {
        uint256 currentDay = getCurrentDay();
        if (lastGlobalUsageTimestamp / DAY_IN_SECONDS == currentDay) {
            return globalDailyUsage;
        }
        return 0;
    }

    function checkEligibility(address wallet) external view returns (bool eligible, string memory reason) {
        if (address(wallet).balance > 0) {
            return (false, "WalletNotEligible");
        }

        uint256 currentDay = getCurrentDay();
        if (lastUsageDay[wallet] == currentDay) {
            if (dailyUsage[wallet] >= dailyLimit) {
                return (false, "DailyLimitReached");
            }
        }

        return (true, "");
    }

    function validateSponsorship(address wallet, address[] calldata targetContracts) external {
        if (address(wallet).balance > 0) {
            revert WalletNotEligible(wallet);
        }


        uint256 currentDay = getCurrentDay();
        uint256 lastGlobalUsageDay = lastGlobalUsageTimestamp / DAY_IN_SECONDS;
        if (lastGlobalUsageDay != currentDay) {
            globalDailyUsage = 0;
        }

        if (lastUsageDay[wallet] != currentDay) {
            dailyUsage[wallet] = 0;
            lastUsageDay[wallet] = currentDay;
        }

        if (dailyUsage[wallet] >= dailyLimit) {
            revert DailyLimitReached(wallet);
        }

        if (globalDailyUsage >= globalDailyLimit) {
            revert GlobalDailyLimitReached();
        }

         for (uint256 i = 0; i < targetContracts.length; i++) {
            if (!allowedContracts[targetContracts[i]]) {
                revert ContractNotAllowed(targetContracts[i]);
            }
        }

        globalDailyUsage++;
        dailyUsage[wallet]++;
        lastGlobalUsageTimestamp = block.timestamp;
    }
}

