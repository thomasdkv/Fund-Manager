import { Button } from "@/components/ui/button";
import { Wallet, Power } from "lucide-react";
import { useEffect, useState } from "react";

interface WalletButtonProps {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  address?: string;
  networkStatus?: "connected" | "disconnected" | "connecting";
  provider?: any;
  account?: any;
}

const WalletButton = ({
  isConnected = false,
  onConnect = () => {},
  onDisconnect = () => {},
  address = "0x1234...5678",
  networkStatus = "disconnected",
  provider,
  account,
}: WalletButtonProps) => {
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !account || !address) return;

      try {
        // Get balance using StarkNet account
        const balanceResult = await account.getBalance();

        // Convert balance from wei to ETH (1 ETH = 10^18 wei)
        const balanceInEth = Number(balanceResult.balance) / 10 ** 18;
        setBalance(balanceInEth.toFixed(4));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("0");
      }
    };

    fetchBalance();

    // Set up interval to refresh balance every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);

    return () => clearInterval(intervalId);
  }, [isConnected, account, address]);

  const getStatusColor = () => {
    switch (networkStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-sm text-slate-200 hidden sm:inline">
            {formatAddress(address)}
          </span>
          <span className="text-sm text-purple-400 hidden sm:inline">
            {balance} ETH
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDisconnect}
          className="text-slate-200 hover:text-slate-100 hover:bg-slate-700"
        >
          <Power className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onConnect}
      className="bg-purple-600 hover:bg-purple-700 text-white"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
};

export default WalletButton;
