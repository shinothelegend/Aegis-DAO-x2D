'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Coins, 
  Sparkles, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { StarsBackground } from './components/stars-background';

// Staggered Entrance Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
} as const;

const itemVariants = {
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

export default function AegisLandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col text-slate-200 overflow-x-hidden font-sans bg-[#030303]">
      {/* Module A: The Continuous Cosmos Background */}
      <StarsBackground speed={150} factor={0.08} pointerEvents={true} />

      {/* 1. Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl">
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

        <div>
          <Link href="/app" passHref legacyBehavior>
            <a className="px-6 py-2.5 text-xs font-semibold bg-zinc-950 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-white hover:bg-cyan-500/10 rounded-full transition-all duration-300 cyan-glow flex items-center gap-1.5 cursor-pointer">
              Launch App
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section (The Hook) */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 overflow-hidden z-10">
        {/* Module A (Decoration): Massive, soft Violet and Cyan blurred floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-float-1 z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-float-2 z-0"></div>

        <motion.div 
          className="relative z-10 max-w-4xl flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-300 text-xs font-mono tracking-wide mb-2 uppercase">
            <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
            ZK Governance & Shielded Pools
          </div>

          {/* Headline - Henny Penny (font-serif) with Text Shimmer */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-shimmer tracking-tight font-medium leading-none max-w-3xl">
            Governance Without Compromise.
          </h2>

          {/* Subheadline - Inter */}
          <p className="text-slate-400 text-base md:text-xl font-light max-w-2xl leading-relaxed">
            A privacy-first decentralized autonomous organization powered by Zero-Knowledge Proofs and Shielded Treasuries. Verify membership, cast consensus votes, and shield pool assets anonymously.
          </p>

          {/* CTA: Massive, glowing Violet button */}
          <div className="mt-4">
            <Link href="/app" passHref legacyBehavior>
              <a className="inline-flex items-center gap-2 px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full text-sm transition-all duration-300 shadow-[0_0_30px_-5px_#8B5CF6] hover:shadow-[0_0_40px_0_#8B5CF6] transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 3. Features Section (The Pillars) */}
      <section className="relative z-10 py-24 px-6 max-w-7xl w-full mx-auto flex flex-col gap-16 border-t border-white/5">
        
        {/* Title */}
        <div className="text-center flex flex-col gap-3">
          <span className="text-[10px] text-cyan-400 font-mono tracking-[0.25em] uppercase block">Security Architecture</span>
          <h3 className="text-3xl md:text-5xl font-serif text-shimmer font-medium tracking-tight">
            Ethereum Privacy at the Core.
          </h3>
        </div>

        {/* 3-column CSS Grid with Staggered Entrance */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1 */}
          <motion.div 
            className="glass-panel rounded-3xl p-8 flex flex-col gap-6 relative group overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_-10px_#06B6D4]"
            variants={itemVariants}
          >
            {/* Ambient hover glowing backdrop */}
            <div className="absolute -inset-4 bg-cyan-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative z-10">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 inline-block mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-serif text-white mb-3">Anonymous Voting</h4>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                Powered by Semaphore V4. Cast votes on governance proposals anonymously without revealing your wallet address or compromise identity.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            className="glass-panel rounded-3xl p-8 flex flex-col gap-6 relative group overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_20px_-10px_#8B5CF6]"
            variants={itemVariants}
          >
            {/* Ambient hover glowing backdrop */}
            <div className="absolute -inset-4 bg-purple-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition duration-500"></div>

            <div className="relative z-10">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20 inline-block mb-6">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-serif text-white mb-3">Sybil Resistance</h4>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                One person, one vote. On-chain zero-knowledge identity commitments ensure fair consensus and prevent double-signaling attacks.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className="glass-panel rounded-3xl p-8 flex flex-col gap-6 relative group overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_20px_-10px_#10B981]"
            variants={itemVariants}
          >
            {/* Ambient hover glowing backdrop */}
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition duration-500"></div>

            <div className="relative z-10">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 inline-block mb-6">
                <Coins className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-serif text-white mb-3">Shielded Treasury</h4>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                Integrated with Kohaku Privacy Pools. Shield your ERC20 contributions from public tracking, breaking correlation of inflow deposits.
              </p>
            </div>
          </motion.div>
        </motion.div>

      </section>

      {/* 4. Footer */}
      <footer className="w-full bg-[#030303] border-t border-white/5 px-6 py-8 text-center text-slate-600 text-[10px] font-mono relative z-10 select-none">
        <p className="tracking-wider uppercase mb-1">Built for the DoraHacks IITG.eth Hackathon (Road to Devcon)</p>
        <p className="text-slate-700">&copy; 2026 Aegis-DAO. All rights reserved.</p>
      </footer>
    </div>
  );
}
