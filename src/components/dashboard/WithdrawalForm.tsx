import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

interface WithdrawalFormProps {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<z.infer<typeof formSchema>>;
  requiredApprovals?: number;
  currentApprovals?: number;
  totalContributors?: number;
}

const WithdrawalForm = ({
  onSubmit = () => {},
  defaultValues = {
    amount: "",
    reason: "",
  },
  requiredApprovals = 75,
  currentApprovals = 0,
  totalContributors = 100,
}: WithdrawalFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const approvalPercentage = (currentApprovals / totalContributors) * 100;
  const requiredCount = Math.ceil(
    (requiredApprovals / 100) * totalContributors,
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6 bg-slate-900 text-slate-100"
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Withdrawal Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter amount in ETH"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </FormControl>
              <FormDescription className="text-slate-400">
                Specify the amount you wish to withdraw from the fund.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Withdrawal Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain the reason for this withdrawal request"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-slate-100 min-h-[100px]"
                />
              </FormControl>
              <FormDescription className="text-slate-400">
                Provide a clear explanation for the withdrawal request to help
                contributors make informed decisions.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>Approval Progress</span>
            <span>
              {currentApprovals} of {requiredCount} required approvals
            </span>
          </div>
          <Progress value={approvalPercentage} className="h-2" />
          <p className="text-xs text-slate-400 text-right">
            {requiredApprovals}% approval threshold
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          Submit Withdrawal Request
        </Button>
      </form>
    </Form>
  );
};

export default WithdrawalForm;
