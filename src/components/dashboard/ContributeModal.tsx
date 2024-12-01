import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)), "Must be a valid number")
    .refine((val) => Number(val) > 0, "Amount must be greater than 0"),
});

interface ContributeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  fundName?: string;
}

const ContributeModal = ({
  isOpen = true,
  onClose = () => {},
  onSubmit = () => {},
  fundName = "Fund",
}: ContributeModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-100">
            Contribute to {fundName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount in ETH"
                      {...field}
                      type="number"
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </FormControl>
                  <FormDescription className="text-slate-400">
                    Enter the amount you want to contribute to this fund.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Contribute
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContributeModal;
