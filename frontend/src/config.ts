export const AEGIS_DAO_ADDRESS = "0xe60fD1C09E3E5699aA43A3Dd09bD17E4720B9759";
export const MOCK_ERC20_ADDRESS = "0x59Cf14825CA7d1a22213444b89120Bd3aC7FF710";
export const MOCK_ENTRYPOINT_ADDRESS = "0x66461eDa41aBD96323d3F1E73e75175816f42b0D";

export const AEGIS_DAO_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_semaphore",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "commitment",
        type: "uint256"
      }
    ],
    name: "MemberJoined",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string"
      }
    ],
    name: "ProposalCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "vote",
        type: "uint256"
      }
    ],
    name: "Voted",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_description",
        type: "string"
      }
    ],
    name: "createProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256"
      }
    ],
    name: "deactivateProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256"
      }
    ],
    name: "getProposal",
    outputs: [
      {
        internalType: "string",
        name: "description",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "yesVotes",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "noVotes",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "groupId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "identityCommitment",
        type: "uint256"
      }
    ],
    name: "joinDAO",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "proposalCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "proposals",
    outputs: [
      {
        internalType: "string",
        name: "description",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "yesVotes",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "noVotes",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "semaphore",
    outputs: [
      {
        internalType: "contract ISemaphore",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_vote",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_merkleTreeDepth",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_merkleTreeRoot",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_nullifier",
        type: "uint256"
      },
      {
        internalType: "uint256[8]",
        name: "_proof",
        type: "uint256[8]"
      }
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export const MOCK_ERC20_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export const MOCK_ENTRYPOINT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_depositor",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "_pool",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_commitment",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "Deposited",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "precommitment",
        type: "uint256"
      }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;
