import {
  Contract,
  Provider,
  Account,
  constants,
  uint256,
  shortString,
} from "starknet";

const FUND_ABI = [
  {
    name: "create_fund",
    type: "function",
    inputs: [
      { name: "name", type: "felt" },
      { name: "description", type: "felt" },
      { name: "approval_threshold", type: "felt" },
      { name: "transparency", type: "felt" },
    ],
    outputs: [{ name: "fund_id", type: "felt" }],
  },
  {
    name: "contribute",
    type: "function",
    inputs: [
      { name: "fund_id", type: "felt" },
      { name: "amount", type: "felt" },
    ],
    outputs: [],
  },
  {
    name: "get_fund_balance",
    type: "function",
    inputs: [{ name: "fund_id", type: "felt" }],
    outputs: [{ name: "balance", type: "felt" }],
  },
  {
    name: "get_contributor_count",
    type: "function",
    inputs: [{ name: "fund_id", type: "felt" }],
    outputs: [{ name: "count", type: "felt" }],
  },
  {
    name: "get_fund_details",
    type: "function",
    inputs: [{ name: "fund_id", type: "felt" }],
    outputs: [
      { name: "name", type: "felt" },
      { name: "description", type: "felt" },
      { name: "approval_threshold", type: "felt" },
      { name: "transparency", type: "felt" },
      { name: "balance", type: "felt" },
      { name: "contributor_count", type: "felt" },
    ],
  },
];

export class FundContract {
  private contract: Contract;
  private account: Account;

  constructor(address: string, provider: Provider, account: Account) {
    this.contract = new Contract(FUND_ABI, address, provider);
    this.account = account;
  }

  async createFund(
    name: string,
    description: string,
    approvalThreshold: number,
    transparency: string,
  ) {
    try {
      // Convert strings to felt representation
      const nameStr = shortString.encodeShortString(name);
      const descStr = shortString.encodeShortString(description);
      const transparencyStr = shortString.encodeShortString(transparency);

      // Execute the transaction
      const { transaction_hash } = await this.account.execute({
        contractAddress: this.contract.address,
        entrypoint: "create_fund",
        calldata: [nameStr, descStr, approvalThreshold, transparencyStr],
      });

      // Wait for transaction confirmation
      await this.account.waitForTransaction(transaction_hash);

      // Get fund ID from transaction receipt
      const receipt =
        await this.account.provider.getTransactionReceipt(transaction_hash);
      const fundId = receipt.events?.[0]?.data?.[0] || "0";

      return fundId;
    } catch (error) {
      console.error("Error creating fund:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create fund",
      );
    }
  }

  async contribute(fundId: string, amount: string) {
    try {
      // Convert amount to wei and ensure it's a valid number
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount");
      }

      // Convert to wei with proper decimal handling
      const amountInWei = BigInt(Math.floor(parsedAmount * 10 ** 18));

      // Execute the transaction
      const response = await this.account.execute({
        contractAddress: this.contract.address,
        entrypoint: "contribute",
        calldata: [fundId, amountInWei.toString()],
      });

      // Wait for transaction confirmation
      await this.account.waitForTransaction(response.transaction_hash);

      // Get updated fund details
      const fundDetails = await this.getFundDetails(fundId);
      return {
        transaction_hash: response.transaction_hash,
        balance: fundDetails.balance,
        contributorCount: fundDetails.contributorCount,
      };
    } catch (error) {
      console.error("Error contributing to fund:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to contribute to fund",
      );
    }
  }

  async getFundBalance(fundId: string): Promise<string> {
    try {
      const result = await this.contract.call("get_fund_balance", [fundId]);
      const balanceInWei = BigInt(result.balance);
      return (balanceInWei / BigInt(10 ** 18)).toString();
    } catch (error) {
      console.error("Error getting fund balance:", error);
      throw error;
    }
  }

  async getContributorCount(fundId: string): Promise<number> {
    try {
      const result = await this.contract.call("get_contributor_count", [
        fundId,
      ]);
      return Number(result.count);
    } catch (error) {
      console.error("Error getting contributor count:", error);
      throw error;
    }
  }

  async getFundDetails(fundId: string) {
    try {
      const result = await this.contract.call("get_fund_details", [fundId]);
      return {
        name: shortString.decodeShortString(result.name),
        description: shortString.decodeShortString(result.description),
        approvalThreshold: Number(result.approval_threshold),
        transparency: shortString.decodeShortString(result.transparency),
        balance: (BigInt(result.balance) / BigInt(10 ** 18)).toString(),
        contributorCount: Number(result.contributor_count),
      };
    } catch (error) {
      console.error("Error getting fund details:", error);
      throw error;
    }
  }
}
