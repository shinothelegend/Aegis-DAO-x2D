'use client';

import React, { useState, useEffect } from 'react';
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useWriteContract, 
  usePublicClient 
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther, formatEther } from 'viem';
import { Identity, Group, generateProof } from '@semaphore-protocol/core';
import { motion } from 'framer-motion';
import { 
  Vote, 
  Shield, 
  UserCheck, 
  Plus, 
  Coins, 
  Zap, 
  RefreshCw, 
  Layers, 
  Lock, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  EyeOff,
  Sparkles,
  Info
} from 'lucide-react';

import { 
  AEGIS_DAO_ADDRESS, 
  AEGIS_DAO_ABI, 
  MOCK_ERC20_ADDRESS, 
  MOCK_ERC20_ABI, 
  MOCK_ENTRYPOINT_ADDRESS, 
  MOCK_ENTRYPOINT_ABI 
} from '../../config';
import { generatePrecommitment } from '../../kohaku-helper';
import { StarsBackground } from '../components/stars-background';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Framer Motion Animation Settings
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 70,
      damping: 14
    }
  }
} as const;

export default function AegisDashboard() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Loading States
  const [loading, setLoading] = useState<boolean>(false);
  const [proposalCount, setProposalCount] = useState<number>(0);
  const [proposals, setProposals] = useState<any[]>([]);
  const [daoMembers, setDaoMembers] = useState<bigint[]>([]);
  
  // ZK Identity States
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [identityCommitment, setIdentityCommitment] = useState<string>("");
  const [identitySecret, setIdentitySecret] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [joining, setJoining] = useState<boolean>(false);

  // Voting Progress
  const [votingProposalId, setVotingProposalId] = useState<number | null>(null);
  const [votingStatus, setVotingStatus] = useState<string>("");

  // Create Proposal Form
  const [newProposalDesc, setNewProposalDesc] = useState<string>("");
  const [creatingProposal, setCreatingProposal] = useState<boolean>(false);

  // Shield Treasury States
  const [erc20Balance, setErc20Balance] = useState<string>("0");
  const [erc20Allowance, setErc20Allowance] = useState<string>("0");
  const [shieldAmount, setShieldAmount] = useState<string>("10");
  const [shieldStatus, setShieldStatus] = useState<string>("");
  const [isShielding, setIsShielding] = useState<boolean>(false);
  const [shieldLogs, setShieldLogs] = useState<any[]>([]);
  const [minting, setMinting] = useState<boolean>(false);

  // Load DAO and proposal data
  const loadDAOState = async () => {
    if (!publicClient) return;
    try {
      setLoading(true);
      // 1. Fetch proposal count
      const count = await publicClient.readContract({
        address: AEGIS_DAO_ADDRESS,
        abi: AEGIS_DAO_ABI,
        functionName: 'proposalCount'
      }) as bigint;
      const countNum = Number(count);
      setProposalCount(countNum);

      // 2. Fetch proposals
      const props = [];
      for (let i = 1; i <= countNum; i++) {
        const propData = await publicClient.readContract({
          address: AEGIS_DAO_ADDRESS,
          abi: AEGIS_DAO_ABI,
          functionName: 'getProposal',
          args: [BigInt(i)]
        }) as [string, bigint, bigint, boolean];

        props.push({
          id: i,
          description: propData[0],
          yesVotes: Number(propData[1]),
          noVotes: Number(propData[2]),
          isActive: propData[3]
        });
      }
      setProposals(props.reverse()); // Newest first

      // 3. Fetch DAO group members via events
      const logs = await publicClient.getLogs({
        address: AEGIS_DAO_ADDRESS,
        event: {
          type: 'event',
          name: 'MemberJoined',
          inputs: [{ type: 'uint256', name: 'commitment', indexed: true }]
        },
        fromBlock: 0n
      });

      const members = logs.map(log => log.args.commitment) as bigint[];
      setDaoMembers(members);
    } catch (err: any) {
      console.warn("Failed to load DAO state:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Load ERC20 Balance and Allowance
  const loadERC20State = async () => {
    if (!publicClient || !address) return;
    try {
      const bal = await publicClient.readContract({
        address: MOCK_ERC20_ADDRESS,
        abi: MOCK_ERC20_ABI,
        functionName: 'balanceOf',
        args: [address]
      }) as bigint;
      setErc20Balance(formatEther(bal));

      const allowance = await publicClient.readContract({
        address: MOCK_ERC20_ADDRESS,
        abi: MOCK_ERC20_ABI,
        functionName: 'allowance',
        args: [address, MOCK_ENTRYPOINT_ADDRESS]
      }) as bigint;
      setErc20Allowance(formatEther(allowance));
    } catch (err: any) {
      console.warn("Failed to load ERC20 state:", err.message || err);
    }
  };

  // Generate ZK Identity locally
  const generateZKIdentity = () => {
    const newIdentity = new Identity();
    setIdentity(newIdentity);
    setIdentityCommitment(newIdentity.commitment.toString());
    // Single secret in Semaphore V4 represents the private key seed
    const secretHex = Buffer.from(newIdentity.privateKey).toString('hex');
    setIdentitySecret(secretHex);
    
    // Save to local storage for convenience
    localStorage.setItem('aegis_identity_private_key', secretHex);
  };

  // Load identity from storage
  const loadSavedIdentity = () => {
    const savedKey = localStorage.getItem('aegis_identity_private_key');
    if (savedKey) {
      try {
        const savedIdentity = new Identity(savedKey);
        setIdentity(savedIdentity);
        setIdentityCommitment(savedIdentity.commitment.toString());
        setIdentitySecret(savedKey);
      } catch (err) {
        console.error("Failed to load saved identity:", err);
      }
    }
  };

  // Join the Semaphore group
  const joinDAO = async () => {
    if (!identityCommitment) return;
    try {
      setJoining(true);
      const tx = await writeContractAsync({
        address: AEGIS_DAO_ADDRESS,
        abi: AEGIS_DAO_ABI,
        functionName: 'joinDAO',
        args: [BigInt(identityCommitment)]
      });
      console.log("Joined DAO Tx:", tx);
      // Wait for block verification
      setTimeout(() => {
        loadDAOState();
        setJoining(false);
      }, 4000);
    } catch (err) {
      console.error("Failed to join DAO:", err);
      setJoining(false);
    }
  };

  // Create proposal
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposalDesc) return;
    try {
      setCreatingProposal(true);
      const tx = await writeContractAsync({
        address: AEGIS_DAO_ADDRESS,
        abi: AEGIS_DAO_ABI,
        functionName: 'createProposal',
        args: [newProposalDesc]
      });
      console.log("Create proposal Tx:", tx);
      setNewProposalDesc("");
      setTimeout(() => {
        loadDAOState();
        setCreatingProposal(false);
      }, 4000);
    } catch (err) {
      console.error("Failed to create proposal:", err);
      setCreatingProposal(false);
    }
  };

  // Cast vote using Semaphore ZK proof
  const handleVote = async (proposalId: number, voteValue: number) => {
    if (!identity) {
      alert("Please generate or load a ZK Identity first.");
      return;
    }
    if (daoMembers.length === 0) {
      alert("No registered members found. Please join the DAO first.");
      return;
    }

    // Verify membership
    const isMember = daoMembers.some(m => m.toString() === identityCommitment);
    if (!isMember) {
      alert("Your ZK identity is not registered on-chain. Please click 'Join DAO' first.");
      return;
    }

    try {
      setVotingProposalId(proposalId);
      setVotingStatus("Constructing Semaphore Group...");

      // Reconstruct the Group Merkle tree with current commitments
      const group = new Group(daoMembers);

      setVotingStatus("Generating ZK Proof in browser...");

      // Generate ZK Proof
      const proof = await generateProof(
        identity,
        group,
        voteValue, // message (1 for yes, 0 for no)
        proposalId // scope (proposal ID preventing double-signaling)
      );

      setVotingStatus("Submitting ZK proof anonymously...");

      const pointsArray = Array.from(proof.points).map(p => BigInt(p.toString())) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

      await writeContractAsync({
        address: AEGIS_DAO_ADDRESS,
        abi: AEGIS_DAO_ABI,
        functionName: 'vote',
        args: [
          BigInt(proposalId),
          BigInt(voteValue),
          BigInt(proof.merkleTreeDepth),
          BigInt(proof.merkleTreeRoot),
          BigInt(proof.nullifier),
          pointsArray
        ]
      });

      setVotingStatus("Success! Vote registered.");
      setTimeout(() => {
        setVotingProposalId(null);
        setVotingStatus("");
        loadDAOState();
      }, 3000);
    } catch (err: any) {
      console.error("Anonymous voting failed:", err);
      alert(`Anonymous voting failed: ${err.message || err}`);
      setVotingProposalId(null);
      setVotingStatus("");
    }
  };

  // Mint mock ERC20 tokens
  const mintMockTokens = async () => {
    try {
      setMinting(true);
      const tx = await writeContractAsync({
        address: MOCK_ERC20_ADDRESS,
        abi: MOCK_ERC20_ABI,
        functionName: 'faucet'
      });
      console.log("Mint tokens Tx:", tx);
      setTimeout(() => {
        loadERC20State();
        setMinting(false);
      }, 4000);
    } catch (err) {
      console.error("Failed to mint tokens:", err);
      setMinting(false);
    }
  };

  // Shield ERC20 tokens using Kohaku precommitment logic
  const handleShield = async () => {
    if (!isConnected || !address) return;
    try {
      setIsShielding(true);
      const amountWei = parseEther(shieldAmount);

      // Approve if allowance is insufficient
      if (parseFloat(erc20Allowance) < parseFloat(shieldAmount)) {
        setShieldStatus("Approving Entrypoint contract to spend tokens...");
        const approveTx = await writeContractAsync({
          address: MOCK_ERC20_ADDRESS,
          abi: MOCK_ERC20_ABI,
          functionName: 'approve',
          args: [MOCK_ENTRYPOINT_ADDRESS, amountWei]
        });
        console.log("Approve Tx:", approveTx);
        setShieldStatus("Allowance approved. Waiting for confirmation...");
        await new Promise(r => setTimeout(r, 4000));
        await loadERC20State();
      }

      setShieldStatus("Deriving Privacy Pools precommitment locally...");
      const depositIndex = Math.floor(Math.random() * 1000000);
      
      const { precommitment } = generatePrecommitment(
        0, // Account index
        depositIndex,
        MOCK_ENTRYPOINT_ADDRESS,
        chainId || 11155111 // Dynamic chain ID from connected wallet, default to Sepolia (11155111)
      );

      setShieldStatus(`Depositing and shielding ${shieldAmount} aeUSD into treasury...`);

      const depositTx = await writeContractAsync({
        address: MOCK_ENTRYPOINT_ADDRESS,
        abi: MOCK_ENTRYPOINT_ABI,
        functionName: 'deposit',
        args: [
          MOCK_ERC20_ADDRESS,
          amountWei,
          BigInt(precommitment)
        ]
      });

      console.log("Deposit/Shield Tx:", depositTx);
      setShieldStatus("Tokens shielded successfully!");

      const newLog = {
        amount: shieldAmount,
        precommitment,
        txHash: depositTx,
        timestamp: new Date().toLocaleTimeString()
      };

      const logs = [newLog, ...shieldLogs];
      setShieldLogs(logs);
      localStorage.setItem("shield_logs", JSON.stringify(logs));

      setTimeout(() => {
        setIsShielding(false);
        setShieldStatus("");
        loadERC20State();
      }, 3000);
    } catch (err: any) {
      console.error("Confidential shielding failed:", err);
      alert(`Confidential shielding failed: ${err.message || err}`);
      setIsShielding(false);
      setShieldStatus("");
    }
  };

  // Trigger Vote Shooting Star Light Trail Animation on Click
  const handleVoteWithAnimation = (e: React.MouseEvent<HTMLButtonElement>, proposalId: number, voteValue: number) => {
    // Capture coordinates of the click relative to viewport
    const x = e.clientX;
    const y = e.clientY;
    
    // Dispatch custom event to trigger star trail in StarsBackground
    window.dispatchEvent(
      new CustomEvent('vote-streak', {
        detail: { x, y, type: voteValue === 1 ? 'yes' : 'no' }
      })
    );

    // Proceed to standard vote handling
    handleVote(proposalId, voteValue);
  };

  // Initial loads
  useEffect(() => {
    loadSavedIdentity();
    const storedLogs = localStorage.getItem("shield_logs");
    if (storedLogs) {
      setShieldLogs(JSON.parse(storedLogs));
    }
  }, []);

  useEffect(() => {
    if (publicClient) {
      loadDAOState();
      if (isConnected) {
        loadERC20State();
      }
    }
  }, [publicClient, isConnected, address]);

  // Check if identity is registered
  useEffect(() => {
    if (identityCommitment && daoMembers.length > 0) {
      const registered = daoMembers.some(m => m.toString() === identityCommitment);
      setIsJoined(registered);
    } else {
      setIsJoined(false);
    }
  }, [identityCommitment, daoMembers]);

  return (
    <div className="relative min-h-screen flex flex-col text-slate-200 overflow-x-hidden font-sans">
      {/* Module A: The Continuous Cosmos Background */}
      <StarsBackground speed={160} factor={0.08} pointerEvents={true} />

      {/* 1. Top Navigation Bar (Header) */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
            <Shield className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-shimmer tracking-tight font-medium select-none">
              Aegis-DAO
            </h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-[0.2em] uppercase select-none">
              Aetherial Consensus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                  className="flex items-center gap-3"
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="px-5 py-2.5 text-xs font-semibold bg-zinc-950 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-white hover:bg-cyan-500/10 rounded-full transition-all duration-300 shadow-[0_0_20px_-10px_#06B6D4] cursor-pointer"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="px-5 py-2.5 text-xs font-semibold bg-red-950/40 border border-red-500/50 hover:border-red-400 text-red-400 rounded-full transition-all duration-300 cursor-pointer shadow-[0_0_20px_-10px_#EF4444]"
                        >
                          Wrong Network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-3">
                        {/* Chain Selector */}
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="hidden md:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-zinc-900 border border-white/10 hover:border-white/20 text-slate-300 rounded-full transition-all duration-300 cursor-pointer"
                        >
                          {chain.hasIcon && chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          {chain.name}
                        </button>

                        {/* Account Details in JetBrains Mono */}
                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="px-5 py-2.5 text-xs font-mono font-bold bg-zinc-900 border border-white/10 hover:border-white/20 text-slate-200 rounded-full transition-all duration-300 cursor-pointer"
                        >
                          {account.displayName}
                          {account.displayBalance ? ` (${account.displayBalance})` : ''}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      {/* 2. Main Content Section (The Aegis Shell) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8 relative z-10">
        
        {isConnected && chainId !== 11155111 && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-3xl p-5 flex gap-4 items-center">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-400 animate-pulse" />
            <div>
              <h4 className="font-bold text-sm">Wrong Network Connected</h4>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Please switch your wallet to the **Sepolia Testnet** (Chain ID: 11155111) to communicate with the deployed Aegis-DAO consensus contracts for the hackathon.
              </p>
            </div>
          </div>
        )}

        {/* Banner Summary Area */}
        <section className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden">
          {/* subtle decoration orb background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col gap-1.5 relative z-10">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
              Privacy-Preserving Consensus Core
            </h2>
            <p className="text-slate-400 text-sm max-w-xl font-light">
              Cast fully anonymous, Sybil-resistant votes using Semaphore ZK proof technology and shielded funding pools via Kohaku Privacy Pools.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto font-mono text-center md:text-left relative z-10">
            <div className="bg-black/50 border border-white/5 p-4 rounded-2xl">
              <span className="text-slate-500 text-[10px] uppercase tracking-[0.15em] block mb-1">DAO Sigils</span>
              <span className="text-cyan-400 text-xl font-bold font-mono">{daoMembers.length}</span>
            </div>
            <div className="bg-black/50 border border-white/5 p-4 rounded-2xl">
              <span className="text-slate-500 text-[10px] uppercase tracking-[0.15em] block mb-1">Proposals</span>
              <span className="text-purple-400 text-xl font-bold font-mono">{proposalCount}</span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-black/50 border border-white/5 p-4 rounded-2xl">
              <span className="text-slate-500 text-[10px] uppercase tracking-[0.15em] block mb-1">Treasury</span>
              <span className="text-emerald-400 text-xl font-bold font-mono">{parseFloat(erc20Balance).toFixed(2)} aeUSD</span>
            </div>
          </div>
        </section>

        {/* Grid Area with Staggered Entrance */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Left Column: Active Proposals */}
          <motion.div className="flex flex-col gap-6" variants={cardVariants}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif text-shimmer tracking-tight font-medium flex items-center gap-2.5">
                <Vote className="h-5 w-5 text-cyan-400" />
                Consensus Proposals
              </h3>
              <button 
                onClick={loadDAOState}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 bg-zinc-950/60 rounded-xl transition duration-300"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {proposals.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center text-slate-500 border border-white/5">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                <p className="text-sm font-semibold mb-1">No Active Consensus</p>
                <p className="text-xs max-w-xs mx-auto">Create a proposal using the ZK Identity panel or publish a consensus test to populate proposals.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Render up to 3 proposal cards strictly */}
                {proposals.slice(0, 3).map((prop) => (
                  <div 
                    key={prop.id} 
                    className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/30"
                  >
                    {/* Voting Progress Loader Overlay */}
                    {votingProposalId === prop.id && (
                      <div className="absolute inset-0 bg-black/95 rounded-3xl z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
                        <p className="text-sm font-semibold text-white mb-1">ZK consensus proof executing</p>
                        <p className="text-xs text-cyan-400 font-mono animate-pulse">{votingStatus}</p>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold text-cyan-400 font-mono tracking-widest uppercase">Proposal #{prop.id}</span>
                        <h4 className="text-lg font-serif text-white leading-snug">{prop.description}</h4>
                      </div>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-semibold border ${prop.isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-zinc-900 border-white/5'}`}>
                        {prop.isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>

                    {/* Progress Bar Tally */}
                    <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 mb-5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          YES: {prop.yesVotes}
                        </span>
                        <span className="text-rose-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                          NO: {prop.noVotes}
                        </span>
                      </div>
                      {/* Bar layout */}
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div 
                          style={{ width: `${prop.yesVotes + prop.noVotes === 0 ? 50 : (prop.yesVotes / (prop.yesVotes + prop.noVotes)) * 100}%` }}
                          className="bg-emerald-500 h-full transition-all duration-500"
                        ></div>
                        <div 
                          style={{ width: `${prop.yesVotes + prop.noVotes === 0 ? 50 : (prop.noVotes / (prop.yesVotes + prop.noVotes)) * 100}%` }}
                          className="bg-rose-500 h-full transition-all duration-500"
                        ></div>
                      </div>
                    </div>

                    {/* Action buttons with hover glow */}
                    {prop.isActive && (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => handleVoteWithAnimation(e, prop.id, 1)}
                          disabled={!identity || !isJoined || votingProposalId !== null}
                          className="flex-1 py-3 text-xs font-bold bg-zinc-950 border border-white/10 hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-2xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-40 hover:shadow-[0_0_20px_-10px_#06B6D4] cursor-pointer"
                        >
                          Vote YES
                        </button>
                        <button 
                          onClick={(e) => handleVoteWithAnimation(e, prop.id, 0)}
                          disabled={!identity || !isJoined || votingProposalId !== null}
                          className="flex-1 py-3 text-xs font-bold bg-zinc-950 border border-white/10 hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-2xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-40 hover:shadow-[0_0_20px_-10px_#06B6D4] cursor-pointer"
                        >
                          Vote NO
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Proposal Creator integrated inside layout */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <Plus className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Create Proposal</h3>
              </div>

              <form onSubmit={handleCreateProposal} className="flex flex-col gap-4">
                <div>
                  <textarea 
                    value={newProposalDesc}
                    onChange={(e) => setNewProposalDesc(e.target.value)}
                    placeholder="Should the DAO treasury deploy a privacy pool liquidity pool?"
                    rows={2}
                    className="w-full bg-black/60 border border-white/10 focus:border-cyan-500 text-slate-200 p-3 rounded-xl text-xs focus:outline-none transition duration-300 resize-none placeholder-slate-600 font-sans"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={creatingProposal || !newProposalDesc || !isConnected}
                  className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 disabled:opacity-50 font-bold rounded-xl transition duration-300 text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_20px_-10px_#06B6D4] cursor-pointer"
                >
                  {creatingProposal ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Publishing Proposal...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Publish Proposal
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
          
          {/* Right Column: Shield Treasury (Kohaku Integration) */}
          <motion.div className="flex flex-col gap-6" variants={cardVariants}>
            <h3 className="text-xl font-serif text-shimmer tracking-tight font-medium flex items-center gap-2.5">
              <Coins className="h-5 w-5 text-purple-400" />
              Shield Pool Treasury
            </h3>

            {/* Treasury Card Container with Violet Glow blur behind it */}
            <div className="relative group">
              {/* Violet Glow Blur Backdrop */}
              <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none transition duration-1000 z-0"></div>
              
              <div className="relative z-10 glass-panel rounded-3xl p-6 border border-white/10 overflow-hidden flex flex-col gap-6 shadow-2xl">
                
                {/* 1,420.75 ETH Pool label - Wide tracking Inter */}
                <div className="text-center py-4 border-b border-white/5">
                  <span className="text-[10px] text-purple-400 font-mono tracking-[0.25em] uppercase block mb-1">Shield Pool Balance</span>
                  <span className="font-sans text-2xl md:text-3xl font-light text-white tracking-[0.2em] block">
                    1,420.75 ETH Pool
                  </span>
                </div>

                {/* Real contract stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-black/40 border border-white/5 rounded-2xl text-center md:text-left">
                    <span className="text-slate-500 text-[10px] block mb-0.5 font-mono uppercase tracking-wider">aeUSD Wallet</span>
                    <span className="text-white text-sm font-bold font-mono">{parseFloat(erc20Balance).toFixed(2)} aeUSD</span>
                  </div>
                  <div className="p-3.5 bg-black/40 border border-white/5 rounded-2xl text-center md:text-left">
                    <span className="text-slate-500 text-[10px] block mb-0.5 font-mono uppercase tracking-wider">Approved Pool</span>
                    <span className="text-white text-sm font-bold font-mono">{parseFloat(erc20Allowance).toFixed(2)} aeUSD</span>
                  </div>
                </div>

                {/* Mint Faucet Section */}
                <div className="flex justify-between items-center p-3.5 bg-zinc-950/60 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-xs text-slate-400 font-light">Need test tokens for shielding?</span>
                  </div>
                  <button 
                    onClick={mintMockTokens}
                    disabled={minting || !isConnected}
                    className="px-4 py-2 text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl transition duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    {minting ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="h-3 w-3 text-yellow-400" />
                    )}
                    Mint aeUSD
                  </button>
                </div>

                {/* Shield input Form */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block mb-1.5">Amount to Shield (aeUSD)</label>
                    <input 
                      type="number"
                      value={shieldAmount}
                      onChange={(e) => setShieldAmount(e.target.value)}
                      placeholder="10"
                      className="w-full bg-black/50 border border-white/10 focus:border-purple-500 text-slate-200 p-3.5 rounded-xl text-sm font-mono focus:outline-none transition duration-300"
                    />
                  </div>

                  {/* Violet action button with pulsing outer glow */}
                  <button 
                    onClick={handleShield}
                    disabled={isShielding || !isConnected || parseFloat(shieldAmount) <= 0}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-sm flex items-center justify-center gap-2 disabled:opacity-40 animate-pulse cursor-pointer shadow-[0_0_20px_-10px_#8B5CF6]"
                  >
                    {isShielding ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Shielding Funds...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Shield Funds to Pool
                      </>
                    )}
                  </button>

                  {isShielding && (
                    <p className="text-xs text-purple-400 font-mono text-center animate-pulse mt-1">
                      {shieldStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shielded History Logs */}
            <div className="flex flex-col gap-4">
              <span className="text-xs text-purple-400 font-mono tracking-widest uppercase block mb-1">Confidential Logs (Local)</span>
              
              {shieldLogs.length === 0 ? (
                <div className="glass-panel rounded-3xl p-8 text-center text-slate-500 border border-white/5">
                  <span className="text-xs">No local shielded logs found. Shield tokens to view commitments.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {shieldLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border border-white/5 hover:border-purple-500/20 transition duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white font-mono">Shielded {log.amount} aeUSD</span>
                          <span className="text-[10px] font-mono text-slate-500 break-all truncate max-w-[200px] md:max-w-none block">Sigil Ref: {log.precommitment}</span>
                        </div>
                      </div>
                      <div className="flex flex-col text-right font-mono text-[10px] text-slate-500 shrink-0">
                        <span>{log.timestamp}</span>
                        <span className="text-purple-400 truncate max-w-[120px]">{log.txHash.slice(0, 10)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>

        {/* 3. ZK Identity Generator (Bottom Panel) */}
        <div className="w-full relative group">
          {/* Subtle floating glow blobs behind this bottom card */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none animate-float-1"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none animate-float-2"></div>
          
          <div className="relative z-10 glass-panel rounded-3xl p-6 border border-white/10 overflow-hidden flex flex-col gap-6 shadow-2xl">
            
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-serif text-shimmer tracking-tight font-medium">
                  GENERATE YOUR AEGIS SIGIL
                </h3>
                <p className="text-slate-400 text-xs font-light max-w-xl">
                  Your cryptographic ZK sigil hides your identity on-chain while verifying your membership in the DAO's consensus rounds.
                </p>
              </div>

              {!identity ? (
                <button 
                  onClick={generateZKIdentity}
                  className="w-full md:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_-10px_#8B5CF6]"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate ZK Sigil
                </button>
              ) : (
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  {!isJoined && (
                    <button 
                      onClick={joinDAO}
                      disabled={joining || !isConnected}
                      className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300 disabled:opacity-50 font-bold rounded-xl transition duration-300 text-xs flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_-10px_#06B6D4]"
                    >
                      {joining ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Registering Sigil...
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Register Sigil on Chain
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={generateZKIdentity}
                    className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-300 font-semibold rounded-xl transition duration-300 text-xs cursor-pointer"
                  >
                    Regenerate Sigil
                  </button>
                </div>
              )}
            </div>

            {identity && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5 font-mono text-xs">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Sigil Commitment (On-Chain PubKey)</span>
                  <span className="text-cyan-400 break-all select-all font-semibold">{identityCommitment}</span>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5 font-mono text-xs">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block flex items-center gap-1">
                    <EyeOff className="h-3 w-3 text-purple-400 animate-pulse" />
                    Private Key Seed (Secret Key)
                  </span>
                  <span className="text-purple-400 break-all select-all font-semibold">{identitySecret.slice(0, 16)}...{identitySecret.slice(-16)}</span>
                </div>
              </div>
            )}

            {identity && (
              <div className="flex justify-between items-center gap-4 border-t border-white/5 pt-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Consensus Status:</span>
                  {isJoined ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle className="h-3 w-3" />
                      Active Sigil
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <AlertCircle className="h-3 w-3" />
                      Sigil Unregistered
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => {
                    localStorage.removeItem('aegis_identity_private_key');
                    setIdentity(null);
                    setIdentityCommitment("");
                    setIdentitySecret("");
                  }}
                  className="text-rose-400/80 hover:text-rose-400 underline transition duration-200 cursor-pointer"
                >
                  Clear Local Sigil Cache
                </button>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#030303] border-t border-white/5 px-6 py-6 text-center text-slate-600 text-[10px] font-mono relative z-10 select-none">
        &copy; 2026 Aegis-DAO. Developed for IITG.eth Hackathon. Powered by Semaphore ZK Protocol & Kohaku Privacy Pools.
      </footer>
    </div>
  );
}
