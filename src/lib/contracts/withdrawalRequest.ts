import { Contract, Provider, Account, constants, shortString } from "starknet";

const WITHDRAWAL_ABI = [
  {
    name: "submit_withdrawal_request",
    type: "function",
    inputs: [
      { name: "fund_id", type: "felt" },
      { name: "amount", type: "felt" },
      { name: "reason", type: "felt" },
    ],
    outputs: [{ name: "request_id", type: "felt" }],
  },
  {
    name: "approve_request",
    type: "function",
    inputs: [{ name: "request_id", type: "felt" }],
    outputs: [],
  },
  {
    name: "reject_request",
    type: "function",
    inputs: [{ name: "request_id", type: "felt" }],
    outputs: [],
  },
  {
    name: "get_request_details",
    type: "function",
    inputs: [{ name: "request_id", type: "felt" }],
    outputs: [
      { name: "fund_id", type: "felt" },
      { name: "amount", type: "felt" },
      { name: "reason", type: "felt" },
      { name: "status", type: "felt" },
      { name: "approval_count", type: "felt" },
      { name: "rejection_count", type: "felt" },
    ],
  },
];

export class WithdrawalRequestContract {
  private contract: Contract;
  private account: Account;

  constructor(address: string, provider: Provider, account: Account) {
    this.contract = new Contract(WITHDRAWAL_ABI, address, provider);
    this.account = account;
  }

  async submitRequest(fundId: string, amount: string, reason: string) {
    try {
      const amountInWei = BigInt(parseFloat(amount) * 10 ** 18);
      const reasonStr = shortString.encodeShortString(reason);

      const { transaction_hash } = await this.account.execute({
        contractAddress: this.contract.address,
        entrypoint: "submit_withdrawal_request",
        calldata: [fundId, amountInWei.toString(), reasonStr],
      });

      await this.account.waitForTransaction(transaction_hash);

      // Get request ID from transaction receipt
      const receipt =
        await this.account.provider.getTransactionReceipt(transaction_hash);
      const requestId = receipt.events[0].data[0];

      return {
        transaction_hash,
        request_id: requestId,
      };
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      throw error;
    }
  }

  async approveRequest(requestId: string) {
    try {
      const { transaction_hash } = await this.account.execute({
        contractAddress: this.contract.address,
        entrypoint: "approve_request",
        calldata: [requestId],
      });

      await this.account.waitForTransaction(transaction_hash);

      // Get updated request details
      const details = await this.getRequestDetails(requestId);
      return {
        transaction_hash,
        ...details,
      };
    } catch (error) {
      console.error("Error approving request:", error);
      throw error;
    }
  }

  async rejectRequest(requestId: string) {
    try {
      const { transaction_hash } = await this.account.execute({
        contractAddress: this.contract.address,
        entrypoint: "reject_request",
        calldata: [requestId],
      });

      await this.account.waitForTransaction(transaction_hash);

      // Get updated request details
      const details = await this.getRequestDetails(requestId);
      return {
        transaction_hash,
        ...details,
      };
    } catch (error) {
      console.error("Error rejecting request:", error);
      throw error;
    }
  }

  async getRequestDetails(requestId: string) {
    try {
      const result = await this.contract.call("get_request_details", [
        requestId,
      ]);
      return {
        fund_id: result.fund_id,
        amount: (BigInt(result.amount) / BigInt(10 ** 18)).toString(),
        reason: shortString.decodeShortString(result.reason),
        status: shortString.decodeShortString(result.status),
        approval_count: Number(result.approval_count),
        rejection_count: Number(result.rejection_count),
      };
    } catch (error) {
      console.error("Error getting request details:", error);
      throw error;
    }
  }
}
