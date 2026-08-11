// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AegisDAO is Ownable {
    ISemaphore public semaphore;
    uint256 public groupId;
    
    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        bool isActive;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    event ProposalCreated(uint256 indexed proposalId, string description);
    event MemberJoined(uint256 indexed commitment);
    event Voted(uint256 indexed proposalId, uint256 vote);

    constructor(address _semaphore) Ownable(msg.sender) {
        semaphore = ISemaphore(_semaphore);
        groupId = semaphore.createGroup(address(this));
    }

    function createProposal(string calldata _description) external onlyOwner {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: _description,
            yesVotes: 0,
            noVotes: 0,
            isActive: true
        });
        emit ProposalCreated(proposalCount, _description);
    }

    function deactivateProposal(uint256 _proposalId) external onlyOwner {
        require(proposals[_proposalId].isActive, "Proposal not active");
        proposals[_proposalId].isActive = false;
    }

    function joinDAO(uint256 identityCommitment) external {
        // Add member to the Semaphore group
        semaphore.addMember(groupId, identityCommitment);
        emit MemberJoined(identityCommitment);
    }

    function vote(
        uint256 _proposalId,
        uint256 _vote, // 1 for Yes, 0 for No
        uint256 _merkleTreeDepth,
        uint256 _merkleTreeRoot,
        uint256 _nullifier,
        uint256[8] calldata _proof
    ) external {
        require(proposals[_proposalId].isActive, "Proposal inactive");
        require(_vote == 0 || _vote == 1, "Invalid vote value");
        
        ISemaphore.SemaphoreProof memory proofObj = ISemaphore.SemaphoreProof({
            merkleTreeDepth: _merkleTreeDepth,
            merkleTreeRoot: _merkleTreeRoot,
            nullifier: _nullifier,
            message: _vote,
            scope: _proposalId, // externalNullifier is scope in V4
            points: _proof
        });

        semaphore.validateProof(
            groupId,
            proofObj
        );

        if (_vote == 1) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }

        emit Voted(_proposalId, _vote);
    }

    function getProposal(uint256 _proposalId) external view returns (
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        bool isActive
    ) {
        Proposal memory prop = proposals[_proposalId];
        return (prop.description, prop.yesVotes, prop.noVotes, prop.isActive);
    }
}
