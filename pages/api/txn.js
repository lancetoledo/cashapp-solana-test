import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import BigNumber from 'bignumber.js';

export default async function handler(req, res) {
    try {
        const { fromWallet, toWallet, amountStr, reference } = req.body

        const amount = new BigNumber(amountStr);

        const senderPublicKey = new PublicKey(fromWallet)
        const recipientPublicKey = new PublicKey(toWallet)

        const network = WalletAdapterNetwork.Devnet
        const endpoint = clusterApiUrl(network)
        const connection = new Connection(endpoint)

        // Get a recent blockhash to include in the transaction
        const { blockhash } = await (connection.getLatestBlockhash('finalized'))

        const transaction = new Transaction({
            recentBlockhash: blockhash,
            // The buyer pays the transaction fee
            feePayer: senderPublicKey,
        })

        // Create the instruction to send SOL from the buyer to the shop
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: senderPublicKey,
            lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
            toPubkey: recipientPublicKey,
        })

        // Add the reference to the instruction as a key
        // This will mean this transaction is returned when we query for the reference
        transferInstruction.keys.push({
            pubkey: new PublicKey(reference),
            isSigner: false,
            isWritable: false,
        })

        // Add the instruction to the transaction
        transaction.add(transferInstruction)

        // Serialize the transaction and convert to base64 to return it
        const serializedTransaction = transaction.serialize({
            // We will need the buyer to sign this transaction after it's returned to them
            requireAllSignatures: false
        })
        const base64 = serializedTransaction.toString('base64')

        // Insert into database: reference, amount

        // Return the serialized transaction
        res.status(200).json({
            transaction: base64,
            message: "You're cool! 🍪",
        })
    } catch (err) {
        console.error(err);

        res.status(500).json({ error: 'error creating transaction', })
        return
    }
}