import React from 'react';
import { WalletProvider, SuiClientProvider, ConnectButton } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';

export const WalletProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <WalletProvider>
    <SuiClientProvider>
      {children}
    </SuiClientProvider>
  </WalletProvider>
);

const WalletConnect: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      <ConnectButton className="button px-4 py-2 rounded-full font-medium" />
    </div>
  );
};

export default WalletConnect;
