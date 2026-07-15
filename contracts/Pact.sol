// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Pact
 * @notice Onchain commitment platform built on Monad.
 *         Transforms personal intentions into immutable, rule-enforced commitments.
 * @dev Modular rule engine — new rules can be added without rewriting the protocol.
 */
contract Pact is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── ENUMS ────────────────────────────────────────────────────────────────

    /**
     * @dev Rule types for commitment enforcement.
     *      Encoded as uint8 to minimize gas cost.
     *      TimeLock     — funds unlock after a specific timestamp
     *      Cooldown     — user must wait N seconds after requesting release
     *      FriendApproval  — a single trusted friend must approve
     *      TrustedGuardians — M-of-N guardians must approve
     *      SavingsGoal  — pact must accumulate a target amount
     */
    enum RuleType { TimeLock, Cooldown, FriendApproval, TrustedGuardians, SavingsGoal }

    /**
     * @dev Lifecycle state of a pact.
     */
    enum PactStatus { Active, Fulfilled, Broken, Canceled }

    // ─── STRUCTS ──────────────────────────────────────────────────────────────

    struct PactData {
        address owner;
        address token;               // address(0) = native MON
        uint256 amount;              // current locked amount
        RuleType ruleType;
        bytes ruleParams;            // ABI-encoded rule-specific parameters
        string name;                 // commitment name
        string message;              // Future Me message
        uint256 createdAt;
        uint256 releaseRequestedAt;  // timestamp of release request (0 = not requested)
        uint8 guardianThreshold;     // required approvals
        uint8 guardianApprovalCount; // approvals received
        PactStatus status;
    }

    // ─── STATE ────────────────────────────────────────────────────────────────

    uint256 public pactCount;

    /// @dev Core pact storage
    mapping(uint256 => PactData) private _pacts;

    /// @dev Guardian list per pact
    mapping(uint256 => address[]) private _guardians;

    /// @dev Quick guardian membership lookup
    mapping(uint256 => mapping(address => bool)) private _isGuardian;

    /// @dev Guardian approval status per pact
    mapping(uint256 => mapping(address => bool)) private _guardianApproved;

    /// @dev All pact IDs owned by a user
    mapping(address => uint256[]) private _userPacts;

    /// @dev Onchain commitment score (10 pts per fulfilled pact)
    mapping(address => uint256) public commitmentScore;

    // ─── EVENTS ───────────────────────────────────────────────────────────────

    event PactCreated(uint256 indexed pactId, address indexed owner, address token, RuleType ruleType);
    event DepositMade(uint256 indexed pactId, address token, uint256 amount);
    event GuardianAssigned(uint256 indexed pactId, address indexed guardian);
    event GuardianApproved(uint256 indexed pactId, address indexed guardian);
    event ReleaseRequested(uint256 indexed pactId, address indexed requester, uint256 timestamp);
    event ReleaseApproved(uint256 indexed pactId, address indexed guardian);
    event PactReleased(uint256 indexed pactId, address indexed to, uint256 amount);
    event PactBroken(uint256 indexed pactId);
    event CommitmentCompleted(uint256 indexed pactId, address indexed owner, uint256 newScore);

    // ─── MODIFIERS ────────────────────────────────────────────────────────────

    modifier onlyPactOwner(uint256 pactId) {
        require(_pacts[pactId].owner == msg.sender, "Pact: not owner");
        _;
    }

    modifier pactExists(uint256 pactId) {
        require(_pacts[pactId].owner != address(0), "Pact: does not exist");
        _;
    }

    modifier pactActive(uint256 pactId) {
        require(_pacts[pactId].status == PactStatus.Active, "Pact: not active");
        _;
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────

    /**
     * @notice Create a new commitment pact.
     * @param token         ERC20 token address, or address(0) for native MON
     * @param ruleType      Enforcement rule (see RuleType enum)
     * @param ruleParams    ABI-encoded rule parameters (see _validateRuleParams)
     * @param name          Short commitment name (max 64 chars)
     * @param message       Future Me message stored onchain (max 1024 chars)
     * @param guardianThreshold  Required guardian approvals (0 for non-guardian rules)
     * @return pactId       Unique ID of the created pact
     */
    function createPact(
        address token,
        RuleType ruleType,
        bytes calldata ruleParams,
        string calldata name,
        string calldata message,
        uint8 guardianThreshold
    ) external returns (uint256) {
        require(bytes(name).length > 0 && bytes(name).length <= 64, "Pact: invalid name length");
        require(bytes(message).length <= 1024, "Pact: message too long");

        _validateRuleParams(ruleType, ruleParams);

        if (guardianThreshold > 0) {
            require(
                ruleType == RuleType.FriendApproval || ruleType == RuleType.TrustedGuardians,
                "Pact: threshold only for guardian rules"
            );
        }

        pactCount++;
        uint256 pactId = pactCount;

        _pacts[pactId] = PactData({
            owner: msg.sender,
            token: token,
            amount: 0,
            ruleType: ruleType,
            ruleParams: ruleParams,
            name: name,
            message: message,
            createdAt: block.timestamp,
            releaseRequestedAt: 0,
            guardianThreshold: guardianThreshold,
            guardianApprovalCount: 0,
            status: PactStatus.Active
        });

        _userPacts[msg.sender].push(pactId);

        emit PactCreated(pactId, msg.sender, token, ruleType);
        return pactId;
    }

    /**
     * @dev Validates rule-specific parameters at creation time.
     *      TimeLock: abi.encode(uint256 unlockTimestamp)   — must be future
     *      Cooldown: abi.encode(uint256 cooldownSeconds)   — 1s … 365 days
     *      FriendApproval / TrustedGuardians: empty bytes
     *      SavingsGoal: abi.encode(uint256 targetAmount)  — must be > 0
     */
    function _validateRuleParams(RuleType ruleType, bytes calldata params) internal view {
        if (ruleType == RuleType.TimeLock) {
            require(params.length == 32, "Pact: invalid TimeLock params");
            uint256 unlockTime = abi.decode(params, (uint256));
            require(unlockTime > block.timestamp, "Pact: unlock time must be future");
        } else if (ruleType == RuleType.Cooldown) {
            require(params.length == 32, "Pact: invalid Cooldown params");
            uint256 cooldown = abi.decode(params, (uint256));
            require(cooldown > 0 && cooldown <= 365 days, "Pact: cooldown out of range");
        } else if (ruleType == RuleType.SavingsGoal) {
            require(params.length == 32, "Pact: invalid SavingsGoal params");
            uint256 goal = abi.decode(params, (uint256));
            require(goal > 0, "Pact: savings goal must be > 0");
        }
        // FriendApproval / TrustedGuardians: no required params
    }

    // ─── DEPOSIT ──────────────────────────────────────────────────────────────

    /**
     * @notice Deposit native MON into a pact.
     */
    function deposit(uint256 pactId)
        external
        payable
        nonReentrant
        pactExists(pactId)
        pactActive(pactId)
    {
        PactData storage p = _pacts[pactId];
        require(p.token == address(0), "Pact: use depositERC20 for tokens");
        require(msg.value > 0, "Pact: must deposit > 0");
        p.amount += msg.value;
        emit DepositMade(pactId, address(0), msg.value);
    }

    /**
     * @notice Deposit ERC20 tokens into a pact (requires prior ERC20.approve).
     */
    function depositERC20(uint256 pactId, uint256 amount)
        external
        nonReentrant
        pactExists(pactId)
        pactActive(pactId)
    {
        PactData storage p = _pacts[pactId];
        require(p.token != address(0), "Pact: use deposit for native token");
        require(amount > 0, "Pact: must deposit > 0");
        uint256 before = IERC20(p.token).balanceOf(address(this));
        IERC20(p.token).safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = IERC20(p.token).balanceOf(address(this)) - before;
        p.amount += received;
        emit DepositMade(pactId, p.token, received);
    }

    // ─── GUARDIANS ────────────────────────────────────────────────────────────

    /**
     * @notice Assign trusted guardian addresses to a guardian-rule pact.
     * @param pactId    Target pact
     * @param guardians Array of guardian wallet addresses (1–5)
     */
    function assignGuardians(uint256 pactId, address[] calldata guardians)
        external
        onlyPactOwner(pactId)
        pactExists(pactId)
        pactActive(pactId)
    {
        PactData storage p = _pacts[pactId];
        require(
            p.ruleType == RuleType.FriendApproval || p.ruleType == RuleType.TrustedGuardians,
            "Pact: rule does not use guardians"
        );
        require(guardians.length > 0 && guardians.length <= 5, "Pact: 1-5 guardians only");
        require(
            p.guardianThreshold > 0 && p.guardianThreshold <= uint8(guardians.length),
            "Pact: invalid threshold"
        );
        require(_guardians[pactId].length == 0, "Pact: guardians already set; use updateGuardians");

        for (uint256 i = 0; i < guardians.length; i++) {
            address g = guardians[i];
            require(g != address(0), "Pact: zero address guardian");
            require(g != msg.sender, "Pact: owner cannot be guardian");
            require(!_isGuardian[pactId][g], "Pact: duplicate guardian");
            _guardians[pactId].push(g);
            _isGuardian[pactId][g] = true;
            emit GuardianAssigned(pactId, g);
        }
    }

    /**
     * @notice Replace all guardians. Resets all pending approvals and release request.
     */
    function updateGuardians(uint256 pactId, address[] calldata newGuardians)
        external
        onlyPactOwner(pactId)
        pactExists(pactId)
        pactActive(pactId)
    {
        require(newGuardians.length > 0 && newGuardians.length <= 5, "Pact: 1-5 guardians only");

        // Clear old guardians
        address[] storage existing = _guardians[pactId];
        for (uint256 i = 0; i < existing.length; i++) {
            _isGuardian[pactId][existing[i]] = false;
            _guardianApproved[pactId][existing[i]] = false;
        }
        delete _guardians[pactId];

        PactData storage p = _pacts[pactId];
        p.guardianApprovalCount = 0;
        p.releaseRequestedAt = 0;

        // Set new guardians
        for (uint256 i = 0; i < newGuardians.length; i++) {
            address g = newGuardians[i];
            require(g != address(0), "Pact: zero address guardian");
            require(g != msg.sender, "Pact: owner cannot be guardian");
            require(!_isGuardian[pactId][g], "Pact: duplicate guardian");
            _guardians[pactId].push(g);
            _isGuardian[pactId][g] = true;
            emit GuardianAssigned(pactId, g);
        }
    }

    // ─── RELEASE ──────────────────────────────────────────────────────────────

    /**
     * @notice Request release of funds. Required for Cooldown and Guardian rules.
     *         For guardian rules, this also notifies guardians to approve.
     */
    function requestRelease(uint256 pactId)
        external
        onlyPactOwner(pactId)
        pactExists(pactId)
        pactActive(pactId)
    {
        PactData storage p = _pacts[pactId];
        require(p.amount > 0, "Pact: no funds to release");
        require(p.releaseRequestedAt == 0, "Pact: release already requested");
        p.releaseRequestedAt = block.timestamp;
        emit ReleaseRequested(pactId, msg.sender, block.timestamp);
    }

    /**
     * @notice Guardian approves a pending release request.
     *         Protected against replay: each guardian can approve exactly once per request.
     */
    function approveRelease(uint256 pactId)
        external
        pactExists(pactId)
        pactActive(pactId)
    {
        PactData storage p = _pacts[pactId];
        require(_isGuardian[pactId][msg.sender], "Pact: not a guardian");
        require(!_guardianApproved[pactId][msg.sender], "Pact: already approved");
        require(p.releaseRequestedAt > 0, "Pact: no release requested");

        _guardianApproved[pactId][msg.sender] = true;
        p.guardianApprovalCount++;
        emit GuardianApproved(pactId, msg.sender);
        emit ReleaseApproved(pactId, msg.sender);
    }

    /**
     * @notice Release locked funds to owner after all rule conditions are satisfied.
     *         Protected against reentrancy. Validates all rule conditions before transfer.
     */
    function release(uint256 pactId)
        external
        nonReentrant
        onlyPactOwner(pactId)
        pactExists(pactId)
        pactActive(pactId)
    {
        PactData storage p = _pacts[pactId];
        require(p.amount > 0, "Pact: nothing to release");

        // Validate all rule conditions before any state change
        _validateReleaseConditions(pactId, p);

        uint256 amount = p.amount;
        p.amount = 0;
        p.status = PactStatus.Fulfilled;

        // Increment commitment score before external call
        commitmentScore[p.owner] += 10;
        uint256 newScore = commitmentScore[p.owner];

        emit CommitmentCompleted(pactId, p.owner, newScore);

        // Transfer funds — checks-effects-interactions pattern
        if (p.token == address(0)) {
            (bool sent,) = payable(p.owner).call{value: amount}("");
            require(sent, "Pact: ETH transfer failed");
        } else {
            IERC20(p.token).safeTransfer(p.owner, amount);
        }

        emit PactReleased(pactId, p.owner, amount);
    }

    /**
     * @dev Validates that all rule-specific conditions are met for release.
     *      Reverts with a descriptive message if any condition fails.
     */
    function _validateReleaseConditions(uint256 pactId, PactData storage p) internal view {
        RuleType rt = p.ruleType;

        if (rt == RuleType.TimeLock) {
            uint256 unlockTime = abi.decode(p.ruleParams, (uint256));
            require(block.timestamp >= unlockTime, "Pact: time lock not expired");

        } else if (rt == RuleType.Cooldown) {
            require(p.releaseRequestedAt > 0, "Pact: must call requestRelease first");
            uint256 cooldown = abi.decode(p.ruleParams, (uint256));
            require(
                block.timestamp >= p.releaseRequestedAt + cooldown,
                "Pact: cooldown period not complete"
            );

        } else if (rt == RuleType.FriendApproval || rt == RuleType.TrustedGuardians) {
            require(_guardians[pactId].length > 0, "Pact: no guardians assigned");
            require(
                p.guardianApprovalCount >= p.guardianThreshold,
                "Pact: insufficient guardian approvals"
            );

        } else if (rt == RuleType.SavingsGoal) {
            uint256 goal = abi.decode(p.ruleParams, (uint256));
            require(p.amount >= goal, "Pact: savings goal not yet reached");
        }
    }

    /**
     * @notice Cancel a pact that has no locked funds.
     *         Cannot cancel after any deposit has been made.
     */
    function cancelPact(uint256 pactId)
        external
        nonReentrant
        onlyPactOwner(pactId)
        pactExists(pactId)
        pactActive(pactId)
    {
        PactData storage p = _pacts[pactId];
        require(p.amount == 0, "Pact: cannot cancel with locked funds");
        p.status = PactStatus.Canceled;
        emit PactBroken(pactId);
    }

    // ─── VIEWS ────────────────────────────────────────────────────────────────

    function getPact(uint256 pactId) external view returns (PactData memory) {
        return _pacts[pactId];
    }

    function getUserPacts(address user) external view returns (uint256[] memory) {
        return _userPacts[user];
    }

    function getGuardians(uint256 pactId) external view returns (address[] memory) {
        return _guardians[pactId];
    }

    function hasGuardianApproved(uint256 pactId, address guardian) external view returns (bool) {
        return _guardianApproved[pactId][guardian];
    }

    function calculateCommitmentScore(address user) external view returns (uint256) {
        return commitmentScore[user];
    }

    // Allow the contract to receive ETH for deposit refunds
    receive() external payable {}
}
