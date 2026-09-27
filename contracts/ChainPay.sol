// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Non-custodial ETH forwarding. No personal data or administrator.
contract ChainPay {
    mapping(bytes32 => bool) public completed;
    bool private entered;
    event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amount, uint256 timestamp);
    error InvalidPayment();
    error AlreadyPaid();
    error TransferFailed();
    error Reentrancy();

    function pay(bytes32 paymentId, address payable merchant) external payable {
        if (entered) revert Reentrancy();
        if (msg.value == 0 || merchant == address(0) || merchant == msg.sender || paymentId == bytes32(0)) revert InvalidPayment();
        // Scope replay protection to the payer: another address cannot consume an intent.
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
