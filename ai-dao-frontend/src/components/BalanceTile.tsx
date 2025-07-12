import React, { useEffect, useState } from "react";
import { useAccounts, useSuiClient } from "@mysten/dapp-kit";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";

export const BalanceTile: React.FC = () => {
  const accounts = useAccounts();
  const client = useSuiClient();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addr = accounts[0]?.address ?? "";

  useEffect(() => {
    if (!addr) {
      setBalance(null);
      return;
    }

    setLoading(true);
    client
      .getBalance({ owner: addr, coinType: SUI_TYPE_ARG })
      .then((b) => {
        const sui = Number(b.totalBalance) / 1e9;
        setBalance(sui.toFixed(2));
      })
      .catch((e) => {
        console.error("RPC getBalance error:", e);
        setBalance(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [addr, client]);

  if (!addr || loading) return null;

  return (
    <div
      className="px-5 flex justify-center items-center text-sm py-1 rounded-xl font-medium text-gray-800 bg-white shadow-inner"
      style={{ height: 50 }}
    >
      {balance ?? "0.00"} SUI
    </div>
  );
};
