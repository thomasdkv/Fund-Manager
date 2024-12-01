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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  transparency: z.enum(["public", "private", "all"]),
  approvalThreshold: z.number().min(1).max(100),
});

interface FundFormProps {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<z.infer<typeof formSchema>>;
}

const APPROVAL_PRESETS = [
  {
    name: "Simple Majority",
    value: 51,
    description: "More than 50% must approve",
  },
  { name: "Super Majority", value: 67, description: "Two-thirds must approve" },
  {
    name: "High Consensus",
    value: 75,
    description: "Three-quarters must approve",
  },
  { name: "Near Unanimous", value: 90, description: "90% must approve" },
  { name: "Custom", value: "custom", description: "Set a custom threshold" },
];

const FundForm = ({
  onSubmit = () => {},
  defaultValues = {
    name: "",
    description: "",
    transparency: "public",
    approvalThreshold: 75,
  },
}: FundFormProps) => {
  const [selectedPreset, setSelectedPreset] = useState("75");
  const [showCustomSlider, setShowCustomSlider] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value === "custom") {
      setShowCustomSlider(true);
    } else {
      setShowCustomSlider(false);
      form.setValue("approvalThreshold", Number(value));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-4 bg-slate-900 text-slate-100"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter fund name"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </FormControl>
              <FormDescription className="text-slate-400">
                Choose a clear and descriptive name for your fund.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose of your fund"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-slate-100 min-h-[80px]"
                />
              </FormControl>
              <FormDescription className="text-slate-400">
                Explain what the fund will be used for and how it will benefit
                the community.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transparency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transparency Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Select transparency level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="public"
                    className="text-slate-100 focus:bg-slate-700"
                  >
                    Public
                  </SelectItem>
                  <SelectItem
                    value="private"
                    className="text-slate-100 focus:bg-slate-700"
                  >
                    Private
                  </SelectItem>
                  <SelectItem
                    value="all"
                    className="text-slate-100 focus:bg-slate-700"
                  >
                    All Contributors
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-slate-400">
                Choose who can view the fund's details and activities.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="approvalThreshold"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>Approval Threshold</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <RadioGroup
                    value={selectedPreset}
                    onValueChange={handlePresetChange}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {APPROVAL_PRESETS.map((preset) => (
                      <div key={preset.value.toString()} className="relative">
                        <RadioGroupItem
                          value={preset.value.toString()}
                          id={`threshold-${preset.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`threshold-${preset.value}`}
                          className="flex flex-col p-3 rounded-lg border border-slate-700 hover:border-slate-600 peer-data-[state=checked]:border-purple-600 cursor-pointer"
                        >
                          <span className="font-semibold">{preset.name}</span>
                          <span className="text-sm text-slate-400">
                            {preset.description}
                          </span>
                          {preset.value !== "custom" && (
                            <span className="text-xs text-purple-400 mt-1">
                              {preset.value}% required
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {showCustomSlider && (
                    <div className="p-4 border border-purple-600/50 rounded-lg bg-slate-800/50 shadow-lg shadow-purple-900/20">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-200">
                            Custom threshold
                          </span>
                          <span className="text-lg font-bold text-purple-400">
                            {field.value}%
                          </span>
                        </div>
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full [&>[role=slider]]:h-5 [&>[role=slider]]:w-5 [&>[role=slider]]:border-purple-600"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Minimum (1%)</span>
                        <span>Maximum (100%)</span>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="text-slate-400">
                Set the percentage of contributors required to approve
                withdrawal requests.
              </FormDescription>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-6"
        >
          Create Fund
        </Button>
      </form>
    </Form>
  );
};

export default FundForm;
