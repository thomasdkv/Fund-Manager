import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import RequestCard from "./RequestCard";

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

interface ApprovalInterfaceProps {
  requests?: WithdrawalRequest[];
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
}

const defaultRequests: WithdrawalRequest[] = [
  {
    id: "1",
    amount: "500 ETH",
    reason: "Development fund for Q2 2024",
    requester: "0x1234...5678",
    date: "2024-03-20",
    approvalCount: 30,
    rejectionCount: 5,
    totalVotes: 100,
    requiredApprovals: 75,
    status: "pending",
  },
  {
    id: "2",
    amount: "200 ETH",
    reason: "Marketing campaign funding",
    requester: "0x8765...4321",
    date: "2024-03-19",
    approvalCount: 80,
    rejectionCount: 10,
    totalVotes: 100,
    requiredApprovals: 75,
    status: "approved",
  },
  {
    id: "3",
    amount: "100 ETH",
    reason: "Community event sponsorship",
    requester: "0x2468...1357",
    date: "2024-03-18",
    approvalCount: 20,
    rejectionCount: 60,
    totalVotes: 100,
    requiredApprovals: 75,
    status: "rejected",
  },
];

const ApprovalInterface = ({
  requests = defaultRequests,
  onApprove = () => {},
  onReject = () => {},
  onSearch = () => {},
  onFilterChange = () => {},
}: ApprovalInterfaceProps) => {
  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-lg border border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-100">
            Withdrawal Requests
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search requests..."
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 w-[200px] bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-slate-700 text-slate-400 hover:text-slate-100"
              onClick={() => onFilterChange("filter")}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-slate-800 text-slate-400">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:text-slate-100"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:text-slate-100"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="data-[state=active]:text-slate-100"
            >
              Rejected
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[450px] pr-4">
            <TabsContent value="pending" className="mt-4 space-y-4">
              {requests
                .filter((request) => request.status === "pending")
                .map((request) => (
                  <RequestCard
                    key={request.id}
                    amount={request.amount}
                    reason={request.reason}
                    requester={request.requester}
                    date={request.date}
                    approvalCount={request.approvalCount}
                    rejectionCount={request.rejectionCount}
                    totalVotes={request.totalVotes}
                    requiredApprovals={request.requiredApprovals}
                    status={request.status}
                    onApprove={() => onApprove(request.id)}
                    onReject={() => onReject(request.id)}
                  />
                ))}
            </TabsContent>

            <TabsContent value="approved" className="mt-4 space-y-4">
              {requests
                .filter((request) => request.status === "approved")
                .map((request) => (
                  <RequestCard
                    key={request.id}
                    amount={request.amount}
                    reason={request.reason}
                    requester={request.requester}
                    date={request.date}
                    approvalCount={request.approvalCount}
                    rejectionCount={request.rejectionCount}
                    totalVotes={request.totalVotes}
                    requiredApprovals={request.requiredApprovals}
                    status={request.status}
                  />
                ))}
            </TabsContent>

            <TabsContent value="rejected" className="mt-4 space-y-4">
              {requests
                .filter((request) => request.status === "rejected")
                .map((request) => (
                  <RequestCard
                    key={request.id}
                    amount={request.amount}
                    reason={request.reason}
                    requester={request.requester}
                    date={request.date}
                    approvalCount={request.approvalCount}
                    rejectionCount={request.rejectionCount}
                    totalVotes={request.totalVotes}
                    requiredApprovals={request.requiredApprovals}
                    status={request.status}
                  />
                ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default ApprovalInterface;
