// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title A3Treasury
/// @notice Receive-first treasury for the AI Money Game.
/// @dev Minimal implementation with no external dependencies.
///      Production deployment requires independent review.
contract A3Treasury {
    address public owner;
    address public executor;

    bool public paused;
    uint16 public spendLimitBps;

    uint256 public cumulativeReceipts;
    uint256 public cumulativeSpend;

    mapping(address => bool) public allowlistedRecipient;

    event RevenueReceived(
        address indexed payer,
        uint256 amount,
        uint256 cumulativeReceipts
    );
    event Spent(
        address indexed recipient,
        uint256 amount,
        uint256 cumulativeSpend
    );
    event RecipientAllowlistUpdated(address indexed recipient, bool allowed);
    event ExecutorUpdated(address indexed executor);
    event SpendLimitUpdated(uint16 bps);
    event Paused();
    event Unpaused();
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    error NotOwner();
    error NotExecutor();
    error TreasuryPaused();
    error InvalidAddress();
    error InvalidSpendLimit();
    error RecipientNotAllowlisted();
    error SpendLimitExceeded();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyExecutor() {
        if (msg.sender != executor) revert NotExecutor();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert TreasuryPaused();
        _;
    }

    constructor(address initialOwner, address initialExecutor, uint16 initialSpendLimitBps) {
        if (initialOwner == address(0) || initialExecutor == address(0)) revert InvalidAddress();
        if (initialSpendLimitBps > 10_000) revert InvalidSpendLimit();

        owner = initialOwner;
        executor = initialExecutor;
        spendLimitBps = initialSpendLimitBps;
    }

    receive() external payable {
        cumulativeReceipts += msg.value;
        emit RevenueReceived(msg.sender, msg.value, cumulativeReceipts);
    }

    function availableToSpend() public view returns (uint256) {
        uint256 maxSpend = (cumulativeReceipts * spendLimitBps) / 10_000;
        if (maxSpend <= cumulativeSpend) return 0;
        return maxSpend - cumulativeSpend;
    }

    function spend(address payable recipient, uint256 amount)
        external
        onlyExecutor
        whenNotPaused
    {
        if (!allowlistedRecipient[recipient]) revert RecipientNotAllowlisted();
        if (amount > availableToSpend()) revert SpendLimitExceeded();

        cumulativeSpend += amount;

        (bool ok, ) = recipient.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Spent(recipient, amount, cumulativeSpend);
    }

    function setRecipient(address recipient, bool allowed) external onlyOwner {
        if (recipient == address(0)) revert InvalidAddress();
        allowlistedRecipient[recipient] = allowed;
        emit RecipientAllowlistUpdated(recipient, allowed);
    }

    function setExecutor(address newExecutor) external onlyOwner {
        if (newExecutor == address(0)) revert InvalidAddress();
        executor = newExecutor;
        emit ExecutorUpdated(newExecutor);
    }

    function setSpendLimitBps(uint16 newBps) external onlyOwner {
        if (newBps > 10_000) revert InvalidSpendLimit();
        spendLimitBps = newBps;
        emit SpendLimitUpdated(newBps);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
