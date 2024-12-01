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

      // Initialize contracts with actual addresses
      const withdrawalContract = new WithdrawalRequestContract(
        "0x682a6b082e08d46a0d38481ffc1f6053b6e02ad586a3a3244828783a2df67fd",
        provider,
        connectedAccount,
      );
      setWithdrawalContract(withdrawalContract);

      const fundContract = new FundContract(
        "0x0704e5b3236f53220bd9cdac4856d44d5546715b10d16bbfb276ccb3fc342102",
        provider,
        connectedAccount,
      );
      setFundContract(fundContract);
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

  const handleContribute = async (values: { amount: string }) => {
    if (!fundContract || !selectedFundForContribution || !walletAddress) {
      toast({
        variant: "destructive",
        title: "Cannot contribute",
        description: "Please connect your wallet first.",
      });
      return;
    }

    try {
      const result = await fundContract.contribute(
        selectedFundForContribution,
        values.amount,
      );

      // Record contribution in Supabase
      const { error } = await supabase.from("contributions").insert({
        fund_id: selectedFundForContribution,
        contributor_address: walletAddress,
        amount: values.amount,
        transaction_hash: result.transaction_hash,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully contributed ${values.amount} ETH`,
      });
    } catch (error) {
      console.error("Error contributing to fund:", error);
      toast({
        variant: "destructive",
        title: "Failed to contribute",
        description: "There was an error processing your contribution",
      });
    }

    setIsContributeModalOpen(false);
  };

  const handleWithdrawalRequest = async (values: any) => {
    if (!withdrawalContract || !selectedFundId || !walletAddress) {
      toast({
        variant: "destructive",
        title: "Cannot submit request",
        description: "Please connect your wallet first.",
      });
      return;
    }

    try {
      const result = await withdrawalContract.submitRequest(
        selectedFundId,
        values.amount,
        values.reason,
      );

      // Record withdrawal request in Supabase
      const { error } = await supabase.from("withdrawal_requests").insert({
        fund_id: selectedFundId,
        requester_address: walletAddress,
        amount: values.amount,
        reason: values.reason,
        transaction_hash: result.transaction_hash,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast({
        variant: "destructive",
        title: "Failed to submit request",
        description: "There was an error submitting your withdrawal request",
      });
    }

    setIsWithdrawalModalOpen(false);
  };

  const handleOpenContributeModal = (fundId: string) => {
    if (!isWalletConnected) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to contribute.",
      });
      return;
    }
    setSelectedFundForContribution(fundId);
    setIsContributeModalOpen(true);
  };

  const handleRequestWithdrawal = (fundId: string) => {
    if (!isWalletConnected) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to request a withdrawal.",
      });
      return;
    }
    setSelectedFundId(fundId);
    setIsWithdrawalModalOpen(true);
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!withdrawalContract || !walletAddress) {
      toast({
        variant: "destructive",
        title: "Cannot approve",
        description: "Please connect your wallet first.",
      });
      return;
    }

    try {
      const result = await withdrawalContract.approveRequest(requestId);

      // Record vote in Supabase
      const { error } = await supabase.from("request_votes").insert({
        request_id: requestId,
        voter_address: walletAddress,
        vote_type: "approve",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully approved the withdrawal request",
      });
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        variant: "destructive",
        title: "Failed to approve",
        description: "Could not process your approval",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!withdrawalContract || !walletAddress) {
      toast({
        variant: "destructive",
        title: "Cannot reject",
        description: "Please connect your wallet first.",
      });
      return;
    }

    try {
      const result = await withdrawalContract.rejectRequest(requestId);

      // Record vote in Supabase
      const { error } = await supabase.from("request_votes").insert({
        request_id: requestId,
        voter_address: walletAddress,
        vote_type: "reject",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully rejected the withdrawal request",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        variant: "destructive",
        title: "Failed to reject",
        description: "Could not process your rejection",
      });
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const fetchFunds = async () => {
      const { data: fundsData, error: fundsError } = await supabase
        .from("funds")
        .select("*")
        .order("created_at", { ascending: false });

      if (fundsError) {
        console.error("Error fetching funds:", fundsError);
        return;
      }

      if (fundsData) {
        setFunds(
          fundsData.map((fund) => ({
            id: fund.id,
            name: fund.name,
            description: fund.description,
            totalContributions: `${fund.total_contributions} ETH`,
            pendingWithdrawals: `${fund.pending_withdrawals} ETH`,
            contributorCount: fund.contributor_count,
            approvalThreshold: fund.approval_threshold,
            currentApproval: 0,
            transparency: fund.transparency,
          })),
        );
      }
    };

    const fetchWithdrawalRequests = async () => {
      const { data: requestsData, error: requestsError } = await supabase
        .from("withdrawal_requests")
        .select(
          `
          *,
          request_votes (vote_type)
        `,
        )
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching withdrawal requests:", requestsError);
        return;
      }

      if (requestsData) {
        setWithdrawalRequests(
          requestsData.map((request) => ({
            id: request.id,
            amount: `${request.amount} ETH`,
            reason: request.reason,
            requester: request.requester_address,
            date: new Date(request.created_at).toLocaleDateString(),
            approvalCount:
              request.request_votes?.filter(
                (vote) => vote.vote_type === "approve",
              ).length || 0,
            rejectionCount:
              request.request_votes?.filter(
                (vote) => vote.vote_type === "reject",
              ).length || 0,
            totalVotes: 100,
            requiredApprovals: 75,
            status: request.status,
          })),
        );
      }
    };

    // Subscribe to funds changes
    const fundsSubscription = supabase
      .channel("funds_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "funds" },
        () => fetchFunds(),
      )
      .subscribe();

    // Subscribe to withdrawal requests changes
    const requestsSubscription = supabase
      .channel("requests_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "withdrawal_requests" },
        () => fetchWithdrawalRequests(),
      )
      .subscribe();

    // Subscribe to votes changes
    const votesSubscription = supabase
      .channel("votes_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "request_votes" },
        () => fetchWithdrawalRequests(),
      )
      .subscribe();

    // Initial data fetch
    fetchFunds();
    fetchWithdrawalRequests();

    // Cleanup subscriptions
    return () => {
      fundsSubscription.unsubscribe();
      requestsSubscription.unsubscribe();
      votesSubscription.unsubscribe();
    };
  }, []);

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
