import { Button } from "@/components/ui/button";
import { Wallet, Power } from "lucide-react";

interface WalletButtonProps {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  address?: string;
  balance?: string;
  networkStatus?: "connected" | "disconnected" | "connecting";
}

const WalletButton = ({
  isConnected = false,
  onConnect = () => {},
  onDisconnect = () => {},
  address = "0x1234...5678",
  balance = "0.00 ETH",
  networkStatus = "disconnected",
}: WalletButtonProps) => {
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

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-sm text-slate-200 hidden sm:inline">
            {address}
          </span>
          <span className="text-sm text-slate-400 hidden sm:inline">
            {balance}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDisconnect}
          className="text-slate-200 hover:text-slate-100"
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
