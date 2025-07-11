import React from "react";
import {
  WalletProvider, // Zmienione na WalletProvider
  ConnectButton,
  useWallets, // Zmienione na useWallets
} from "@mysten/dapp-kit";
import "@mysten/wallet-kit/style.css";

// Wrap your application at root with this provider
export const WalletProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <WalletProvider> {/* Usunięto defaultNetwork i appName */}
    {children}
  </WalletProvider>
);

// Simple Connect/Disconnect button
const WalletConnect: React.FC = () => {
  const wallets = useWallets(); // Zmienione na useWallets
  const currentAccount = wallets.length > 0 ? wallets[0] : null; // Wybierz pierwszy portfel, jeśli jest dostępny

  // Sprawdzenie, co zawiera currentAccount
  console.log(currentAccount); 

  return (
    <div>
      <ConnectButton />
      {currentAccount && (
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          {/* Zmiana z "address" na inną właściwość, jeśli jest dostępna */}
          Connected: {currentAccount.accounts?.[0]?.address?.slice(0, 6)}...
          {currentAccount.accounts?.[0]?.address?.slice(-4)}
        </p>
      )}
    </div>
  );
};

export default WalletConnect;
