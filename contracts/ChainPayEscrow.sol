// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Non-custodial Escrow system with milestones and dispute resolution.
contract ChainPayEscrow {
    struct Escrow {
        address client;
        address payable freelancer;
        uint256 totalAmount;
        uint256 releasedAmount;
        bool disputed;
        bool refunded;
    }

    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => mapping(uint256 => uint256)) public milestoneAmounts;
    mapping(bytes32 => mapping(uint256 => bool)) public milestoneReleased;
    mapping(bytes32 => uint256) public milestoneCounts;

    address public admin;
    bool private entered;

    event EscrowFunded(bytes32 indexed escrowId, address indexed client, address indexed freelancer, uint256 amount, uint256 timestamp);
    event PaymentReleased(bytes32 indexed escrowId, uint256 milestoneIndex, uint256 amount, uint256 timestamp);
    event DisputeOpened(bytes32 indexed escrowId, address indexed openedBy, uint256 timestamp);
    event DisputeResolved(bytes32 indexed escrowId, uint256 releaseAmount, uint256 refundAmount, uint256 timestamp);
    event RefundIssued(bytes32 indexed escrowId, uint256 amount, uint256 timestamp);

    error Reentrancy();
    error ZeroAmount();
    error InvalidFreelancer();
    error AlreadyFunded();
    error InvalidEscrow();
    error NotAuthorized();
    error AlreadyReleased();
    error InvalidMilestone();
    error TransferFailed();
    error IsDisputed();
    error NotDisputed();
    error InvalidAmounts();

    modifier nonReentrant() {
        if (entered) revert Reentrancy();
        entered = true;
        _;
        entered = false;
    }

    constructor() {
        admin = msg.sender;
    }

    function version() external pure returns (uint256) { return 1; }

    function fund(bytes32 escrowId, address payable freelancer, uint256[] calldata mAmounts) external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        if (escrows[escrowId].client != address(0)) revert AlreadyFunded();
        if (freelancer == address(0) || freelancer == address(this) || freelancer == msg.sender) revert InvalidFreelancer();
        
        uint256 sum = 0;
        for (uint256 i = 0; i < mAmounts.length; i++) {
            if (mAmounts[i] == 0) revert ZeroAmount();
            sum += mAmounts[i];
            milestoneAmounts[escrowId][i] = mAmounts[i];
        }
        if (sum != msg.value) revert InvalidAmounts();

        escrows[escrowId] = Escrow({
            client: msg.sender,
            freelancer: freelancer,
            totalAmount: msg.value,
            releasedAmount: 0,
            disputed: false,
            refunded: false
        });
        milestoneCounts[escrowId] = mAmounts.length;

        emit EscrowFunded(escrowId, msg.sender, freelancer, msg.value, block.timestamp);
    }

    function release(bytes32 escrowId, uint256 milestoneIndex) external nonReentrant {
        Escrow storage esc = escrows[escrowId];
        if (esc.client == address(0)) revert InvalidEscrow();
        if (msg.sender != esc.client) revert NotAuthorized();
        if (esc.disputed || esc.refunded) revert IsDisputed();
        if (milestoneIndex >= milestoneCounts[escrowId]) revert InvalidMilestone();
        if (milestoneReleased[escrowId][milestoneIndex]) revert AlreadyReleased();

        uint256 amount = milestoneAmounts[escrowId][milestoneIndex];
        milestoneReleased[escrowId][milestoneIndex] = true;
        esc.releasedAmount += amount;

        (bool ok, ) = esc.freelancer.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit PaymentReleased(escrowId, milestoneIndex, amount, block.timestamp);
    }

    function openDispute(bytes32 escrowId) external {
        Escrow storage esc = escrows[escrowId];
        if (esc.client == address(0)) revert InvalidEscrow();
        if (msg.sender != esc.client && msg.sender != esc.freelancer) revert NotAuthorized();
        if (esc.disputed || esc.refunded) revert IsDisputed();

        esc.disputed = true;
        emit DisputeOpened(escrowId, msg.sender, block.timestamp);
    }

    function resolveDispute(bytes32 escrowId, uint256 releaseAmt, uint256 refundAmt) external nonReentrant {
        if (msg.sender != admin) revert NotAuthorized();
        Escrow storage esc = escrows[escrowId];
        if (!esc.disputed) revert NotDisputed();
        if (esc.refunded) revert InvalidEscrow();

        uint256 remaining = esc.totalAmount - esc.releasedAmount;
        if (releaseAmt + refundAmt != remaining) revert InvalidAmounts();

        esc.disputed = false;
        esc.refunded = true; // Mark as done to prevent further actions

        if (releaseAmt > 0) {
            esc.releasedAmount += releaseAmt;
            (bool ok1, ) = esc.freelancer.call{value: releaseAmt}("");
            if (!ok1) revert TransferFailed();
        }

        if (refundAmt > 0) {
            (bool ok2, ) = esc.client.call{value: refundAmt}("");
            if (!ok2) revert TransferFailed();
        }

        emit DisputeResolved(escrowId, releaseAmt, refundAmt, block.timestamp);
    }
    
    function refund(bytes32 escrowId) external nonReentrant {
        Escrow storage esc = escrows[escrowId];
        if (esc.client == address(0)) revert InvalidEscrow();
        // Freelancer can refund the client, or admin can cancel/refund
        if (msg.sender != admin && msg.sender != esc.freelancer) revert NotAuthorized();
        if (esc.disputed || esc.refunded) revert IsDisputed();

        uint256 remaining = esc.totalAmount - esc.releasedAmount;
        if (remaining == 0) revert ZeroAmount();

        esc.refunded = true;
        
        (bool ok, ) = esc.client.call{value: remaining}("");
        if (!ok) revert TransferFailed();

        emit RefundIssued(escrowId, remaining, block.timestamp);
    }
}
