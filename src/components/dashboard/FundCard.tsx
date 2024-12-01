import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Users, Wallet } from "lucide-react";

interface FundCardProps {
  name?: string;
  description?: string;
  totalContributions?: string;
  pendingWithdrawals?: string;
  contributorCount?: number;
  approvalThreshold?: number;
  currentApproval?: number;
  transparency?: "public" | "private" | "all";
  onContribute?: () => void;
  onRequestWithdrawal?: () => void;
}

const FundCard = ({
  name = "Community Fund #1",
  description = "A fund for supporting community initiatives and development",
  totalContributions = "1000 ETH",
  pendingWithdrawals = "100 ETH",
  contributorCount = 25,
  approvalThreshold = 75,
  currentApproval = 60,
  transparency = "public",
  onContribute = () => {},
  onRequestWithdrawal = () => {},
}: FundCardProps) => {
  const getTransparencyIcon = () => {
    switch (transparency) {
      case "public":
        return <Eye className="h-4 w-4" />;
      case "private":
        return <EyeOff className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full h-full bg-slate-900 border-slate-800 flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{name}</h3>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                {description}
              </p>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              {getTransparencyIcon()}
              <span className="text-xs capitalize">{transparency}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Total Contributions</p>
              <p className="text-sm font-medium text-slate-200">
                {totalContributions}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Pending Withdrawals</p>
              <p className="text-sm font-medium text-slate-200">
                {pendingWithdrawals}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Approval Progress</span>
              <span>{currentApproval}%</span>
            </div>
            <Progress value={currentApproval} className="h-1" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Users className="h-3 w-3" />
              <span>{contributorCount} contributors</span>
              <span className="text-slate-600">|</span>
              <span>Threshold {approvalThreshold}%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-800">
          <Button
            onClick={onContribute}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Contribute
          </Button>
          <Button
            onClick={onRequestWithdrawal}
            variant="outline"
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 text-sm px-3"
          >
            Request
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FundCard;
