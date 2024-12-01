import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FundForm from "./FundForm";

interface CreateFundModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (values: any) => void;
}

const CreateFundModal = ({
  isOpen = true,
  onClose = () => {},
  onSubmit = () => {},
}: CreateFundModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-slate-900 border-slate-800 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-100">
            Create New Fund
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 flex-1 overflow-y-auto pr-2">
          <FundForm onSubmit={onSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFundModal;
