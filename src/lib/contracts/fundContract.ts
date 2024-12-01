import { Contract, Provider, Account, uint256, shortString } from "starknet";

const FUND_ABI = [
  {
    type: "constructor",
    name: "constructor",
    inputs: [],
  },
  {
    type: "function",
    name: "interact",
    inputs: [],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "createFund",
    inputs: [
      {
        name: "name",
        type: "core::felt252",
      },
      {
        name: "request_percent",
        type: "core::integer::u256",
      },
    ],
    outputs: [
      {
        type: "core::integer::u32",
      },
    ],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "getFundName",
    inputs: [
      {
        name: "entry",
        type: "core::integer::u32",
      },
    ],
    outputs: [
      {
        type: "core::felt252",
      },
    ],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "getFundOwner",
    inputs: [
      {
        name: "entry",
        type: "core::integer::u32",
      },
    ],
    outputs: [
      {
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "getFundAmount",
    inputs: [
      {
        name: "entry",
        type: "core::integer::u32",
      },
    ],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "getFundPercent",
    inputs: [
      {
        name: "entry",
        type: "core::integer::u32",
      },
    ],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "pay",
    inputs: [
      {
        name: "recipient",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "amount",
        type: "core::integer::u256",
      },
    ],
    outputs: [
      {
        type: "core::bool",
      },
    ],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "balance",
    inputs: [
      {
        name: "wallet",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
];

export class FundContract {
  private contract: Contract;
  private account: Account;

  constructor(address: string, provider: Provider, account: Account) {
    this.contract = new Contract(FUND_ABI, address, provider);
    this.account = account;
  }

  async createFund(name: string, approvalThreshold: number) {
    try {
      console.log("Creating fund with raw params:", {
        name,
        approvalThreshold,
        type: typeof approvalThreshold
      });

      // Basic validation
      if (!name || name.trim() === "") {
        throw new Error("Fund name is required");
      }

      // Convert name to felt
      const nameStr = shortString.encodeShortString(name);

      // Convert approval threshold to uint256
      const threshold = Number(approvalThreshold);
      if (isNaN(threshold)) {
        throw new Error("Approval threshold must be a valid number");
      }

      const thresholdUint256 = {
        low: threshold.toString(),
        high: "0",
      };

      console.log("Processed parameters:", {
        nameStr,
        thresholdUint256,
        contractAddress: this.contract.address,
      });

      // Execute the transaction
      const { transaction_hash } = await this.account.execute({
        contractAddress: this.contract.address,
        entrypoint: "createFund",
        calldata: [nameStr, thresholdUint256.low, thresholdUint256.high],
      });

      console.log("Transaction submitted:", transaction_hash);

      // Wait for transaction confirmation
      await this.account.waitForTransaction(transaction_hash);
      console.log("Transaction confirmed");

      // Get fund ID from transaction receipt
      const receipt =
        await this.account.provider.getTransactionReceipt(transaction_hash);
      const fundId = receipt.events?.[0]?.data?.[0] || "0";
      console.log("Fund created with ID:", fundId);

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
      // Convert amount to uint256
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10 ** 18));
      const amountUint256 = {
        low: amountInWei.toString(),
        high: "0",
      };

      // Execute the transaction
      const { transaction_hash } = await this.account.execute({
        contractAddress: this.contract.address,
        entrypoint: "pay",
        calldata: [
          this.contract.address, // recipient (fund contract)
          this.account.address, // sender
          amountUint256.low,
          amountUint256.high,
        ],
      });

      // Wait for transaction confirmation
      await this.account.waitForTransaction(transaction_hash);

      // Get updated fund details
      const balance = await this.getFundBalance(fundId);
      return {
        transaction_hash,
        balance,
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
      const result = await this.contract.call("getFundAmount", [fundId]);
      const balanceInWei = uint256.uint256ToBN({
        low: result[0],
        high: result[1],
      });
      return (balanceInWei / BigInt(10 ** 18)).toString();
    } catch (error) {
      console.error("Error getting fund balance:", error);
      throw error;
    }
  }

  async getFundName(fundId: string): Promise<string> {
    try {
      const result = await this.contract.call("getFundName", [fundId]);
      return shortString.decodeShortString(result[0]);
    } catch (error) {
      console.error("Error getting fund name:", error);
      throw error;
    }
  }

  async getFundOwner(fundId: string): Promise<string> {
    try {
      const result = await this.contract.call("getFundOwner", [fundId]);
      return result[0];
    } catch (error) {
      console.error("Error getting fund owner:", error);
      throw error;
    }
  }

  async getFundPercent(fundId: string): Promise<number> {
    try {
      const result = await this.contract.call("getFundPercent", [fundId]);
      const percent = uint256.uint256ToBN({
        low: result[0],
        high: result[1],
      });
      return Number(percent); // Return as whole number
    } catch (error) {
      console.error("Error getting fund percent:", error);
      throw error;
    }
  }
}
