import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  selectedFilter?: string;
  searchQuery?: string;
}

const FilterBar = ({
  onSearch = () => {},
  onFilterChange = () => {},
  selectedFilter = "all",
  searchQuery = "",
}: FilterBarProps) => {
  return (
    <div className="w-full h-[60px] bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search funds..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400 focus-visible:ring-purple-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        <Select value={selectedFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-200">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem
              value="all"
              className="text-slate-200 focus:bg-slate-700"
            >
              All Funds
            </SelectItem>
            <SelectItem
              value="public"
              className="text-slate-200 focus:bg-slate-700"
            >
              Public Funds
            </SelectItem>
            <SelectItem
              value="private"
              className="text-slate-200 focus:bg-slate-700"
            >
              Private Funds
            </SelectItem>
            <SelectItem
              value="contributed"
              className="text-slate-200 focus:bg-slate-700"
            >
              My Contributions
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterBar;
