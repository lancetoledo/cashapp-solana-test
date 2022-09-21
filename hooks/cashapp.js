import { useEffect, useState } from "react"
import { getAvatarUrl } from "../functions/getAvatarUrl"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import BigNumber from 'bignumber.js';


import { encodeURL, createQR } from '@solana/pay';



export const useCashApp = () => {

  // const qaziAddress = new PublicKey('2aaKJpbQNpJXPgReNKQtB5ozs1DnoADCQCGk5pD7x2Xg') 

  // I can create a transaction request with Solana pay between two wallets
  // I want to be able to decide which two wallets to send/receive sol
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet()

  const [avatar, setAvatar] = useState("")
  const [userAddress, setUserAddress] = useState("")

  useEffect(() => {
    if (connected) {
      setAvatar(getAvatarUrl(publicKey.toString()))
      setUserAddress(publicKey.toString())
    }
  }, [connected])


  // Args:
  // - fromWallet: PublicKey
  // - toWallet: PublicKey
  // - amount: BigNumber
  // - reference: PublicKey
  async function makeTransaction(fromWallet, toWallet, amount, reference) {
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)

    // Get a recent blockhash to include in the transaction
    const { blockhash } = await connection.getLatestBlockhash('finalized')

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      // The buyer pays the transaction fee
      feePayer: fromWallet,
    })

    // Create the instruction to send SOL from the buyer to the shop
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromWallet,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: toWallet,
    })

    // Add the reference to the instruction as a key
    // This will mean this transaction is returned when we query for the reference
    transferInstruction.keys.push({
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    })

    // Add the instruction to the transaction
    transaction.add(transferInstruction)

    return transaction
  }

  // TODO: Move somewhere reasonable if here is not reasonable
  async function doTransaction() {
    const fromWallet = publicKey
    const toWallet = new PublicKey("2aaKJpbQNpJXPgReNKQtB5ozs1DnoADCQCGk5pD7x2Xg")
    const amount = new BigNumber("1")
    const reference = Keypair.generate().publicKey

    const transaction = await makeTransaction(fromWallet, toWallet, amount, reference)
    console.log(transaction)

    const txnHash = await sendTransaction(transaction, connection)
    console.log(txnHash)

    // Ugly hack ahead?

    let transactions = JSON.parse(localStorage.getItem("transactions"))
    if (!transactions) {
      transactions = []
    }
    console.log(transactions, "TRANSACTIONSSS")
    // transactions.push({ transaction, txnHash })
    localStorage.setItem("transactions", JSON.stringify(transaction))
  }



  return { getAvatarUrl, avatar, userAddress, makeTransaction, doTransaction }
}