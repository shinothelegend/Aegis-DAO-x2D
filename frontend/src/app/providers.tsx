'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { 
  getDefaultConfig, 
  RainbowKitProvider, 
  darkTheme, 
  Theme 
} from '@rainbow-me/rainbowkit';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// Setup Multi-Wallet configuration using RainbowKit's getDefaultConfig helper
export const config = getDefaultConfig({
  appName: 'Aegis-DAO',
  projectId: 'e89aa8b027e64db6929153c03190ca3e', // WalletConnect generic project ID
  chains: [sepolia],
  ssr: true, // SSR support enabled for Next.js App Router
});

// Custom themed configuration matching "Celestial Cryptography" design system
const customDarkTheme: Theme = {
  ...darkTheme({
    accentColor: '#06B6D4', // Governance Cyan accent color
    accentColorForeground: '#030303', // Text on accent color
    overlayBlur: 'large', // Default overlay blur base
  }),
  colors: {
    ...darkTheme().colors,
    modalBackground: '#151A22', // Diffused gunmetal background
    modalText: '#F3F4F6', // Off-White primary text
    modalTextSecondary: '#9CA3AF', // Slate Gray secondary text
  },
  radii: {
    actionButton: '4px', // Sharp, technical border radius
    connectButton: '4px',
    menuButton: '4px',
    modal: '4px',
    modalMobile: '4px',
  },
  blurs: {
    modalOverlay: 'blur(12px)', // Backdrop blur style matching backdrop-blur-md
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customDarkTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
