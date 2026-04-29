// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================
// BLOCKCHAIN VOTING SMART CONTRACT
// University Coursework Demo
//
// This contract allows:
// - One vote per Ethereum address (wallet)
// - Stores vote counts on the blockchain
// - Results are publicly readable by anyone
// ============================================================

contract BlockchainVoting {

    // ── STRUCTS ──
    // A struct is like a custom data type (similar to a class in Python/JS)
    struct Candidate {
        uint256 id;        // Unique ID for the candidate
        string name;       // Candidate's name
        string party;      // Political party name
        uint256 voteCount; // Number of votes received
    }

    // ── STATE VARIABLES ──
    // These are stored permanently on the blockchain

    // The address of whoever deployed this contract (admin)
    address public owner;

    // Whether the election is currently open
    bool public electionOpen;

    // Total number of candidates
    uint256 public candidateCount;

    // Maps candidate ID → Candidate struct
    // Think of this like a dictionary/object
    mapping(uint256 => Candidate) public candidates;

    // Maps wallet address → true/false (has voted?)
    // Ensures ONE vote per address
    mapping(address => bool) public hasVoted;

    // Maps wallet address → which candidate ID they voted for
    mapping(address => uint256) public votedFor;

    // ── EVENTS ──
    // Events are logs emitted to the blockchain (like console.log but permanent)
    // Frontend apps can "listen" for these events

    event CandidateAdded(uint256 indexed id, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event ElectionStatusChanged(bool isOpen);

    // ── MODIFIERS ──
    // Modifiers add reusable conditions to functions

    // Only the contract owner (deployer) can call functions with this modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can do this");
        _;
    }

    // Only allows voting when election is open
    modifier electionIsOpen() {
        require(electionOpen, "The election is not currently open");
        _;
    }

    // ── CONSTRUCTOR ──
    // Runs ONCE when the contract is deployed to the blockchain
    constructor() {
        owner = msg.sender;     // Set deployer as owner
        electionOpen = false;   // Election starts closed

        // Add the 3 default candidates
        _addCandidate("Alice Johnson", "Green Future Party");
        _addCandidate("Michael Lee", "Digital Progress Party");
        _addCandidate("Sarah Ahmed", "People First Alliance");
    }

    // ── INTERNAL FUNCTIONS ──
    // Private helper — only callable from within this contract

    function _addCandidate(string memory _name, string memory _party) internal {
        candidateCount++;                  // Increment counter (starts at 1)
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            voteCount: 0
        });
        emit CandidateAdded(candidateCount, _name);  // Log the event
    }

    // ── PUBLIC FUNCTIONS ──

    /**
     * @notice Opens or closes the election
     * @dev Only the owner can call this
     * @param _open true = open, false = closed
     */
    function setElectionStatus(bool _open) public onlyOwner {
        electionOpen = _open;
        emit ElectionStatusChanged(_open);
    }

    /**
     * @notice Cast a vote for a candidate
     * @dev One vote per address enforced. Election must be open.
     * @param _candidateId The ID of the candidate to vote for (1, 2, or 3)
     */
    function vote(uint256 _candidateId) public electionIsOpen {
        // Check: voter hasn't already voted
        require(!hasVoted[msg.sender], "You have already voted");

        // Check: candidate ID is valid
        require(
            _candidateId > 0 && _candidateId <= candidateCount,
            "Invalid candidate ID"
        );

        // Record the vote
        hasVoted[msg.sender] = true;          // Mark address as voted
        votedFor[msg.sender] = _candidateId; // Store their choice

        // Increment the candidate's vote count
        candidates[_candidateId].voteCount++;

        // Emit event for the frontend to listen to
        emit VoteCast(msg.sender, _candidateId);
    }

    /**
     * @notice Get all vote counts at once
     * @return Array of vote counts indexed by candidate ID (1-based)
     */
    function getAllVotes() public view returns (uint256[] memory) {
        uint256[] memory votes = new uint256[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            votes[i - 1] = candidates[i].voteCount;
        }
        return votes;
    }

    /**
     * @notice Get a single candidate's details
     * @param _id Candidate ID
     * @return id, name, party, voteCount
     */
    function getCandidate(uint256 _id)
        public
        view
        returns (
            uint256 id,
            string memory name,
            string memory party,
            uint256 voteCount
        )
    {
        require(_id > 0 && _id <= candidateCount, "Invalid candidate ID");
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.party, c.voteCount);
    }

    /**
     * @notice Check if an address has voted
     * @param _addr The wallet address to check
     */
    function checkHasVoted(address _addr) public view returns (bool) {
        return hasVoted[_addr];
    }

    /**
     * @notice Get the winner (candidate with most votes)
     * @dev Returns candidate ID of the winner
     */
    function getWinner() public view returns (uint256 winnerId, string memory winnerName, uint256 winnerVotes) {
        require(!electionOpen, "Election is still open");
        uint256 maxVotes = 0;
        for (uint256 i = 1; i <= candidateCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
                winnerName = candidates[i].name;
                winnerVotes = candidates[i].voteCount;
            }
        }
    }
}
