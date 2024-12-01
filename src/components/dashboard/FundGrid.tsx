import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FilterBar from "./FilterBar";
import FundCard from "./FundCard";

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

interface FundGridProps {
  funds?: Fund[];
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  selectedFilter?: string;
  searchQuery?: string;
  onCreateFund?: () => void;
  onContribute?: (fundId: string) => void;
  onRequestWithdrawal?: (fundId: string) => void;
}

const FundGrid = ({
  funds = [],
  onSearch = () => {},
  onFilterChange = () => {},
  selectedFilter = "all",
  searchQuery = "",
  onCreateFund = () => {},
  onContribute = () => {},
  onRequestWithdrawal = () => {},
}: FundGridProps) => {
  const filteredFunds = funds.filter((fund) => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        fund.name.toLowerCase().includes(searchLower) ||
        fund.description.toLowerCase().includes(searchLower)
      );
    }
    if (selectedFilter !== "all") {
      return fund.transparency === selectedFilter;
    }
    return true;
  });

  return (
    <div className="w-full min-h-[800px] bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-100">
          Available Funds
        </h2>
        <Button
          onClick={onCreateFund}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Fund
        </Button>
      </div>

      <FilterBar
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        selectedFilter={selectedFilter}
        searchQuery={searchQuery}
      />

      <div className="flex-1 p-4 sm:p-6">
        {filteredFunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p className="text-lg">No funds available</p>
            <p className="text-sm mt-2">Create a new fund to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr">
            {filteredFunds.map((fund) => (
              <div key={fund.id} className="h-full">
                <FundCard
                  name={fund.name}
                  description={fund.description}
                  totalContributions={fund.totalContributions}
                  pendingWithdrawals={fund.pendingWithdrawals}
                  contributorCount={fund.contributorCount}
                  approvalThreshold={fund.approvalThreshold}
                  currentApproval={fund.currentApproval}
                  transparency={fund.transparency}
                  onContribute={() => onContribute(fund.id)}
                  onRequestWithdrawal={() => onRequestWithdrawal(fund.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FundGrid;
