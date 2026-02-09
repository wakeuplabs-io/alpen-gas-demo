// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SponsorWhitelist.sol";

contract BatchCallAndSponsor {
    using ECDSA for bytes32;

    // TODO: make it immutable
    SponsorWhitelist public sponsorWhitelist;

    /// @notice A nonce used for replay protection.
    uint256 public nonce;

    /// @notice Represents a single call within a batch.
    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    /// @notice Emitted for every individual call executed.
    event CallExecuted(
        address indexed sender,
        address indexed to,
        uint256 value,
        bytes data
    );
    /// @notice Emitted when a full batch is executed.
    event BatchExecuted(uint256 indexed nonce, Call[] calls);

    error SponsorWhitelistNotSet();

    constructor(address _sponsorWhitelist) {
        sponsorWhitelist = SponsorWhitelist(_sponsorWhitelist);
    }

    /**
     * @notice Executes a batch of calls using an off–chain signature.
     * @param calls An array of Call structs containing destination, ETH value, and calldata.
     * @param signature The ECDSA signature over the current nonce and the call data.
     *
     * The signature must be produced off–chain by signing:
     * The signing key should be the account's key (which becomes the smart account's own identity after upgrade).
     */
    function execute(
        Call[] calldata calls,
        bytes calldata signature,
        address sponsorWhitelistAddress
    ) external payable {
        if (sponsorWhitelistAddress == address(0)) {
            revert SponsorWhitelistNotSet();
        }

        sponsorWhitelist = SponsorWhitelist(sponsorWhitelistAddress);

        address wallet = address(this);

        address[] memory targetContracts = new address[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            targetContracts[i] = calls[i].to;
        }

        SponsorWhitelist(sponsorWhitelistAddress).validateSponsorship(wallet, targetContracts);

        bytes memory encodedCalls;
        for (uint256 i = 0; i < calls.length; i++) {
            encodedCalls = abi.encodePacked(
                encodedCalls,
                calls[i].to,
                calls[i].value,
                calls[i].data
            );
        }
        bytes32 digest = keccak256(abi.encodePacked(nonce, encodedCalls));

        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            digest
        );

        address recovered = ECDSA.recover(ethSignedMessageHash, signature);
        require(recovered == address(this), "Invalid signature");

        _executeBatch(calls);
    }

    /**
     * @notice Executes a batch of calls directly.
     * @dev This function is intended for use when the smart account itself (i.e. address(this))
     * calls the contract. It checks that msg.sender is the contract itself.
     * @param calls An array of Call structs containing destination, ETH value, and calldata.
     */
    function execute(Call[] calldata calls) external payable {
        require(msg.sender == address(this), "Invalid authority");

        if (address(sponsorWhitelist) != address(0)) {
            address wallet = address(this);
            address[] memory targetContracts = new address[](calls.length);
            for (uint256 i = 0; i < calls.length; i++) {
                targetContracts[i] = calls[i].to;
            }

            sponsorWhitelist.validateSponsorship(wallet, targetContracts);
        }

        _executeBatch(calls);
    }

    /**
     * @dev Internal function that handles batch execution and nonce incrementation.
     * @param calls An array of Call structs.
     */
    function _executeBatch(Call[] calldata calls) internal {
        uint256 currentNonce = nonce;
        nonce++; // Increment nonce to protect against replay attacks

        for (uint256 i = 0; i < calls.length; i++) {
            _executeCall(calls[i]);
        }

        emit BatchExecuted(currentNonce, calls);
    }

    /**
     * @dev Internal function to execute a single call.
     * @param callItem The Call struct containing destination, value, and calldata.
     */
    function _executeCall(Call calldata callItem) internal {
        (bool success, ) = callItem.to.call{value: callItem.value}(
            callItem.data
        );
        require(success, "Call reverted");
        emit CallExecuted(
            msg.sender,
            callItem.to,
            callItem.value,
            callItem.data
        );
    }

    // Allow the contract to receive ETH (e.g. from DEX swaps or other transfers).
    fallback() external payable {}

    receive() external payable {}
}

