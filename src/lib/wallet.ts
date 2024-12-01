import { connect, Account } from "get-starknet";

export const connectBraavos = async () => {
  try {
    const starknet = await connect({
      modalMode: "alwaysAsk",
      modalTheme: "dark",
      walletConnectors: ["braavos"],
      dappName: "StarkNet Fund Manager",
    });

    if (!starknet?.isConnected) {
      throw new Error("Failed to connect to Braavos wallet");
    }

    // Wait for account to be fully initialized
    await starknet.enable();

    if (!starknet.account) {
      throw new Error("No account found");
    }

    return {
      address: starknet.selectedAddress,
      provider: starknet.provider,
      account: starknet.account as Account,
    };
  } catch (error) {
    console.error("Error connecting to Braavos:", error);
    throw error;
  }
};
