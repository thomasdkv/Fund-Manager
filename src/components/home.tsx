import { useState, useCallback, useEffect } from "react";
import { connectBraavos } from "@/lib/wallet";
import { WithdrawalRequestContract } from "@/lib/contracts/withdrawalRequest";
import { FundContract } from "@/lib/contracts/fundContract";
import Header from "./dashboard/Header";
import FundGrid from "./dashboard/FundGrid";
import CreateFundModal from "./dashboard/CreateFundModal";
import WithdrawalRequestModal from "./dashboard/WithdrawalRequestModal";
import ContributeModal from "./dashboard/ContributeModal";
import ApprovalInterface from "./dashboard/ApprovalInterface";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Account } from "starknet";

interface Fund {
  id: string;
  name: string;
  description: string;
  totalContributions: string;
  pendingWithdrawals: string;
  contributorCount: number;
  approvalThreshold: number;
  currentApproval: number;
  transparency: "public" | "private" | "all";
}

interface WithdrawalRequest {
  id: string;
  amount: string;
  reason: string;
  requester: string;
  date: string;
  approvalCount: number;
  rejectionCount: number;
  totalVotes: number;
  requiredApprovals: number;
  status: "pending" | "approved" | "rejected";
  fundId: string; // Add fundId to track which fund the request belongs to
}

const Home = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [networkStatus, setNetworkStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("disconnected");
  const [withdrawalContract, setWithdrawalContract] =
    useState<WithdrawalRequestContract | null>(null);
  const [fundContract, setFundContract] = useState<FundContract | null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedFundId, setSelectedFundId] = useState<string>("");
  const [selectedFundForContribution, setSelectedFundForContribution] =
    useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [account, setAccount] = useState<Account | null>(null);

  const handleWalletConnect = async () => {
    try {
      setNetworkStatus("connecting");
      const {
        address,
        provider,
        account: connectedAccount,
      } = await connectBraavos();
      setWalletAddress(address);
      setIsWalletConnected(true);
      setNetworkStatus("connected");
      setAccount(connectedAccount);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setNetworkStatus("disconnected");
      toast({
        variant: "destructive",
        title: "Failed to connect wallet",
        description:
          "Please make sure you have Braavos wallet installed and try again.",
      });
    }
  };

  const handleWalletDisconnect = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
    setNetworkStatus("disconnected");
    setWithdrawalContract(null);
    setFundContract(null);
    setAccount(null);
  };

  const handleCreateFund = (values: any) => {
    // Create a new fund without contract interaction
    const newFund: Fund = {
      id: `fund-${Date.now()}`,
      name: values.name,
      description: values.description,
      totalContributions: "0 ETH",
      pendingWithdrawals: "0 ETH",
      contributorCount: 0,
      approvalThreshold: values.approvalThreshold,
      currentApproval: 0,
      transparency: values.transparency,
    };

    setFunds([...funds, newFund]);
    setIsCreateModalOpen(false);

    toast({
      title: "Success",
      description: "Fund created successfully",
    });
  };

  const handleContribute = (values: { amount: string }) => {
    const fund = funds.find((f) => f.id === selectedFundForContribution);
    if (!fund) return;

    // Update fund's total contributions
    const currentAmount = parseFloat(fund.totalContributions.split(" ")[0]);
    const contributionAmount = parseFloat(values.amount);
    const newAmount = currentAmount + contributionAmount;

    setFunds(
      funds.map((f) => {
        if (f.id === selectedFundForContribution) {
          return {
            ...f,
            totalContributions: `${newAmount} ETH`,
            contributorCount: f.contributorCount + 1,
          };
        }
        return f;
      }),
    );

    setIsContributeModalOpen(false);

    toast({
      title: "Success",
      description: `Successfully contributed ${values.amount} ETH`,
    });
  };

  const handleWithdrawalRequest = (values: any) => {
    const fund = funds.find((f) => f.id === selectedFundId);
    if (!fund) return;

    // Check if withdrawal amount is less than or equal to total contributions
    const totalContributions = parseFloat(
      fund.totalContributions.split(" ")[0],
    );
    const withdrawalAmount = parseFloat(values.amount);

    if (withdrawalAmount > totalContributions) {
      toast({
        variant: "destructive",
        title: "Invalid withdrawal amount",
        description: "Withdrawal amount cannot exceed total contributions",
      });
      return;
    }

    // Create new withdrawal request
    const newRequest: WithdrawalRequest = {
      id: `request-${Date.now()}`,
      amount: `${values.amount} ETH`,
      reason: values.reason,
      requester: walletAddress || "Anonymous",
      date: new Date().toLocaleDateString(),
      approvalCount: 0,
      rejectionCount: 0,
      totalVotes: fund.contributorCount,
      requiredApprovals: Math.ceil(
        fund.contributorCount * (fund.approvalThreshold / 100),
      ),
      status: "pending",
      fundId: selectedFundId, // Store the fund ID with the request
    };

    setWithdrawalRequests([...withdrawalRequests, newRequest]);
    setIsWithdrawalModalOpen(false);

    toast({
      title: "Success",
      description: "Withdrawal request submitted successfully",
    });
  };

  const handleOpenContributeModal = (fundId: string) => {
    setSelectedFundForContribution(fundId);
    setIsContributeModalOpen(true);
  };

  const handleRequestWithdrawal = (fundId: string) => {
    setSelectedFundId(fundId);
    setIsWithdrawalModalOpen(true);
  };

  const handleApproveRequest = (requestId: string) => {
    const request = withdrawalRequests.find((r) => r.id === requestId);
    if (!request) return;

    setWithdrawalRequests((requests) =>
      requests.map((request) => {
        if (request.id === requestId) {
          const newApprovalCount = request.approvalCount + 1;
          const isApproved = newApprovalCount >= request.requiredApprovals;

          // If approved, update the fund's total contributions
          if (isApproved) {
            const withdrawalAmount = parseFloat(request.amount.split(" ")[0]);
            setFunds((funds) =>
              funds.map((fund) => {
                if (fund.id === request.fundId) {
                  const currentAmount = parseFloat(
                    fund.totalContributions.split(" ")[0],
                  );
                  return {
                    ...fund,
                    totalContributions: `${Math.max(0, currentAmount - withdrawalAmount)} ETH`,
                  };
                }
                return fund;
              }),
            );
          }

          return {
            ...request,
            approvalCount: newApprovalCount,
            status: isApproved ? "approved" : "pending",
          };
        }
        return request;
      }),
    );

    toast({
      title: "Success",
      description: "Successfully approved the withdrawal request",
    });
  };

  const handleRejectRequest = (requestId: string) => {
    setWithdrawalRequests((requests) =>
      requests.map((request) => {
        if (request.id === requestId) {
          return {
            ...request,
            rejectionCount: request.rejectionCount + 1,
            status: "rejected", // Immediately mark as rejected
          };
        }
        return request;
      }),
    );

    toast({
      title: "Success",
      description: "Successfully rejected the withdrawal request",
    });
  };

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden">
      <Header
        isWalletConnected={isWalletConnected}
        onWalletConnect={handleWalletConnect}
        onWalletDisconnect={handleWalletDisconnect}
        walletAddress={walletAddress}
        networkStatus={networkStatus}
        account={account}
      />

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 p-4">
        <div className="overflow-y-auto">
          <FundGrid
            funds={funds}
            onSearch={setSearchQuery}
            onFilterChange={setSelectedFilter}
            selectedFilter={selectedFilter}
            searchQuery={searchQuery}
            onCreateFund={() => setIsCreateModalOpen(true)}
            onContribute={handleOpenContributeModal}
            onRequestWithdrawal={handleRequestWithdrawal}
          />
        </div>

        <div className="hidden lg:block overflow-y-auto">
          <ApprovalInterface
            requests={withdrawalRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        </div>
      </div>

      <CreateFundModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFund}
      />

      <WithdrawalRequestModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSubmit={handleWithdrawalRequest}
        fundName={funds.find((f) => f.id === selectedFundId)?.name || "Fund"}
      />

      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onSubmit={handleContribute}
        fundName={
          funds.find((f) => f.id === selectedFundForContribution)?.name ||
          "Fund"
        }
      />
    </div>
  );
};

export default Home;
