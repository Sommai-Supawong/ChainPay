// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Non-custodial ETH settlement. Application metadata remains off-chain.
contract ChainPayV2 {
    mapping(bytes32 => bool) public completed;
    bool private entered;

    event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amount, uint256 timestamp);
    error ZeroAmount();
    error InvalidMerchant();
    error InvalidPaymentId();
    error AlreadyPaid();
    error TransferFailed();
    error Reentrancy();

    function version() external pure returns (uint256) { return 2; }

    function pay(bytes32 paymentId, address payable merchant) external payable {
        if (entered) revert Reentrancy();
        if (msg.value == 0) revert ZeroAmount();
        if (merchant == address(0) || merchant == address(this) || merchant == msg.sender) revert InvalidMerchant();
        if (paymentId == bytes32(0)) revert InvalidPaymentId();

        // Preserve V1's payer-scoped replay rule. A separate intent has a separate ID.
        bytes32 key = keccak256(abi.encode(msg.sender, paymentId));
        if (completed[key]) revert AlreadyPaid();
        entered = true;
        completed[key] = true;
        (bool ok,) = merchant.call{value: msg.value}("");
        if (!ok) revert TransferFailed();
        emit PaymentCompleted(paymentId, msg.sender, merchant, msg.value, block.timestamp);
        entered = false;
    }
}
