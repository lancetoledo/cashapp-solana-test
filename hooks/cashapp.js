import { useEffect, useState } from "react"
import { getAvatarUrl } from "../functions/getAvatarUrl"
import { useWallet } from '@solana/wallet-adapter-react'
// import { PublicKey } from "@solana/web3.js"

import { Cluster, clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { encodeURL, createQR } from '@solana/pay';
import BigNumber from 'bignumber.js';

export const products = [
    {
      id: 'box-of-cookies',
      name: 'Box',
      description: 'A delicious box of handmade cookies',
      unitName: 'box', // shows after the price, eg. 0.05 SOL/box
      priceSol: 0.05,
      priceUsd: 5,
    },
    {
      id: 'basket-of-cookies',
      name: 'Basket',
      description: 'A large basket of handmade cookies',
      unitName: 'basket',
      priceSol: 0.1,
      priceUsd: 10,
    }
  ]

export const useCashApp = () => {

    // const qaziAddress = new PublicKey('2aaKJpbQNpJXPgReNKQtB5ozs1DnoADCQCGk5pD7x2Xg') 

    const { connected, publicKey } = useWallet()

    const [avatar,setAvatar] = useState("")
    const [userAddress, setUserAddress] = useState("")

    useEffect(()=> {
        if(connected) {
            setAvatar(getAvatarUrl(publicKey.toString()))
            setUserAddress(publicKey.toString())
        }
    },[connected])

    function calculatePrice(query){
        let amount = new BigNumber(0);
        for (let [id, quantity] of Object.entries(query)) {
          const product = products.find(p => p.id === id)
          if (!product) continue;
      
          const price = product.priceSol
          const productQuantity = new BigNumber(quantity)
          amount = amount.plus(productQuantity.multipliedBy(price))
        }
      
        return amount
      }

    // const MakeTransactionInputData = {
    //     account
    // }

    // const MakeTransactionOutputData = {
    //     transaction: string,
    //     message: string,
    //   }
      
    // const ErrorOutput = {
    //     error: string
    //   }
      

    const handler = async (
        req,
        res
      ) => {
        try {
          // We pass the selected items in the query, calculate the expected cost
          const amount = calculatePrice(req.query)
          if (amount.toNumber() === 0) {
            res.status(400).json({ error: "Can't checkout with charge of 0" })
            return
          }
      
          // We pass the reference to use in the query
          const { reference } = req.query
          if (!reference) {
            res.status(400).json({ error: "No reference provided" })
            return
          }
      
          // We pass the buyer's public key in JSON body
          const { account } = req.body 
          if (!account) {
            res.status(400).json({ error: "No account provided" })
            return
          }
          const buyerPublicKey = new PublicKey(account)
          const shopPublicKey = shopAddress
      
          const network = WalletAdapterNetwork.Devnet
          const endpoint = clusterApiUrl(network)
          const connection = new Connection(endpoint)
      
          // Get a recent blockhash to include in the transaction
          const { blockhash } = await (connection.getLatestBlockhash('finalized'))
      
          const transaction = new Transaction({
            recentBlockhash: blockhash,
            // The buyer pays the transaction fee
            feePayer: buyerPublicKey,
          })
      
          // Create the instruction to send SOL from the buyer to the shop
          const transferInstruction = SystemProgram.transfer({
            fromPubkey: buyerPublicKey,
            lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
            toPubkey: shopPublicKey,
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
            message: "Thanks for your order! 🍪",
          })
        } catch (err) {
          console.error(err);
      
          res.status(500).json({ error: 'error creating transaction', })
          return
        }
      }

    return {getAvatarUrl, avatar, userAddress}
}