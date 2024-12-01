import { CircleDollarSign } from "lucide-react";
import WalletButton from "./WalletButton";

interface HeaderProps {
  isWalletConnected?: boolean;
  onWalletConnect?: () => void;
  onWalletDisconnect?: () => void;
  walletAddress?: string;
  walletBalance?: string;
  networkStatus?: "connected" | "disconnected" | "connecting";
}

const Header = ({
  isWalletConnected = false,
  onWalletConnect = () => {},
  onWalletDisconnect = () => {},
  walletAddress = "0x1234...5678",
  walletBalance = "0.00 ETH",
  networkStatus = "disconnected",
}: HeaderProps) => {
  return (
    <header className="w-full h-[72px] bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CircleDollarSign className="h-8 w-8 text-purple-500" />
        <h1 className="text-xl font-bold text-slate-100 hidden sm:block">
          StarkNet Fund Manager
        </h1>
      </div>

      <WalletButton
        isConnected={isWalletConnected}
        onConnect={onWalletConnect}
        onDisconnect={onWalletDisconnect}
        address={walletAddress}
        balance={walletBalance}
        networkStatus={networkStatus}
      />
    </header>
  );
};

export default Header;
