import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  CalendarIcon,
  WalletIcon,
} from "lucide-react";

interface RequestCardProps {
  amount?: string;
  reason?: string;
  requester?: string;
  date?: string;
  approvalCount?: number;
  rejectionCount?: number;
  totalVotes?: number;
  requiredApprovals?: number;
  status?: "pending" | "approved" | "rejected";
  onApprove?: () => void;
  onReject?: () => void;
}

const RequestCard = ({
  amount = "100 ETH",
  reason = "Fund development of new features",
  requester = "0x1234...5678",
  date = "2024-03-21",
  approvalCount = 15,
  rejectionCount = 5,
  totalVotes = 100,
  requiredApprovals = 75,
  status = "pending",
  onApprove = () => {},
  onReject = () => {},
}: RequestCardProps) => {
  const approvalPercentage = (approvalCount / totalVotes) * 100;
  const requiredCount = Math.ceil((requiredApprovals / 100) * totalVotes);

  const getStatusColor = () => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-800 p-4 flex flex-col">
      <div className="flex flex-col space-y-3 flex-1">
        <div className="flex justify-between items-start w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4 text-slate-400" />
              <span className="text-lg font-medium text-slate-100">
                {amount}
              </span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2">{reason}</p>
          </div>
          <span
            className={`text-sm font-medium capitalize ${getStatusColor()}`}
          >
            {status}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="truncate">Requested by: {requester}</span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {date}
          </div>
        </div>

        <div className="space-y-2 w-full">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>
              {approvalCount} of {requiredCount} required approvals
            </span>
            <span>{approvalPercentage.toFixed(1)}% approved</span>
          </div>
          <Progress value={approvalPercentage} className="h-1.5" />
        </div>

        {status === "pending" && (
          <div className="flex gap-2 w-full">
            <Button
              onClick={onApprove}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs w-24"
            >
              <ThumbsUpIcon className="mr-1 h-3 w-3" />
              Approve
            </Button>
            <Button
              onClick={onReject}
              size="sm"
              variant="destructive"
              className="h-7 px-2 text-xs w-24"
            >
              <ThumbsDownIcon className="mr-1 h-3 w-3" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RequestCard;
