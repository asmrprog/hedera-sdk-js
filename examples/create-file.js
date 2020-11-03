const { Client, FileCreateTransaction, Ed25519PrivateKey, AccountId, Hbar } = require("@hashgraph/sdk");

async function main() {
    if (
        process.env.OPERATOR_KEY == null ||
        process.env.OPERATOR_ID == null
    ) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    let client;

    if (process.env.HEDERA_NETWORK != null) {
        switch (process.env.HEDERA_NETWORK) {
            case "previewnet":
                client = Client.forPreviewnet();
                break;
            default:
                client = Client.forTestnet();
        }
    } else {
        try {
            client = Client.fromConfigFile(process.env.CONFIG_FILE);
        } catch (err) {
            client = Client.forTestnet();
        }
    }

    let operatorPrivateKey;
    let operatorAccount;

    if (process.env.OPERATOR_KEY != null && process.env.OPERATOR_ID != null) {
        operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        operatorAccount = AccountId.fromString(process.env.OPERATOR_ID);

        client.setOperator(operatorAccount, operatorPrivateKey);
    }

    const transactionId = await new FileCreateTransaction()
        .setContents("Hello, Hedera's file service!")
        .addKey(operatorPrivateKey.publicKey) // Defines the "admin" of this file
        .setMaxTransactionFee(new Hbar(15))
        .execute(client);

    const receipt = await transactionId.getReceipt(client);
    console.log("new file id =", receipt.getFileId());
}

main();
