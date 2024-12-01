import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WithdrawalForm from "./WithdrawalForm";

interface WithdrawalRequestModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (values: any) => void;
  fundName?: string;
  requiredApprovals?: number;
  currentApprovals?: number;
  totalContributors?: number;
}

const WithdrawalRequestModal = ({
  isOpen = true,
  onClose = () => {},
  onSubmit = () => {},
  fundName = "Community Fund",
  requiredApprovals = 75,
  currentApprovals = 0,
  totalContributors = 100,
}: WithdrawalRequestModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-100">
            Request Withdrawal from {fundName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          <WithdrawalForm
            onSubmit={onSubmit}
            requiredApprovals={requiredApprovals}
            currentApprovals={currentApprovals}
            totalContributors={totalContributors}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalRequestModal;
