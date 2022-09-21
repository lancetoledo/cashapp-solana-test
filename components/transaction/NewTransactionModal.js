import { useState, useRef, useEffect } from 'react';
import Modal from '../Modal';
import { createQR, encodeURL, findReference, validateTransfer, FindReferenceError, ValidateTransferError } from "@solana/pay"
import { PublicKey, Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useConnection } from '@solana/wallet-adapter-react';

const NewTransactionModal = ({ modalOpen, setModalOpen, addTransaction, doTransaction }) => {
    const [amount, setAmount] = useState(0)
    const [receiver, setReceiver] = useState('')
    const [transactionPurpose, setTransactionPurpose] = useState('')

    const { connection } = useConnection()
    const qrRef = useRef()

    const onAmountInput = (e) => {
        e.preventDefault()
        const newAmount = e.target.value

        setAmount(newAmount)

        const input = document.querySelector('input#amount')
        input.style.width = newAmount.length + 'ch'
    }

    const onPay = () => {
        addTransaction({ amount, receiver, transactionPurpose })

        doTransaction()
    }

    useEffect(() => {
        const recipient = new PublicKey("8tkzLsVRBMVbfR7XN87UhzMeUbWVR5vRT5PWEn38VD9L")
        const amount = new BigNumber("1")
        const reference = Keypair.generate().publicKey
        const label = "Evil Cookies Inc"
        const message = "Thanks for your Sol! 🍪"

        const urlParams = {
            recipient,
            // splToken: usdcAddress,
            amount,
            reference,
            label,
            message,
        }
        const url = encodeURL(urlParams)
        console.log(url)
        const qr = createQR(url, 512, 'transparent')
        if (qrRef.current) {
            qrRef.current.innerHTML = ''
            qr.append(qrRef.current)
        }

        // Wait for the user to send the transaction

        const interval = setInterval(async () => {
            console.log("waiting for transaction confirmation")
            try {
                // Check if there is any transaction for the reference
                const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' })

                // Validate that the transaction has the expected recipient, amount and SPL token
                await validateTransfer(
                    connection,
                    signatureInfo.signature,
                    {
                        recipient,
                        amount,
                        // splToken: usdcAddress,
                        reference,
                    },
                    { commitment: 'confirmed' }
                )

                console.log("confirmed, proceed with evil deeds")
                clearInterval(interval)
            } catch (e) {
                if (e instanceof FindReferenceError) {
                    // No transaction found yet, ignore this error
                    return;
                }
                if (e instanceof ValidateTransferError) {
                    // Transaction is invalid
                    console.error('Transaction is invalid', e)
                    return;
                }
                console.error('Unknown error', e)
            }
        }, 500)

        return () => clearInterval(interval)
    })

    return (
        <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
            <div className="relative flex flex-col items-center justify-center space-y-8">
                <div className="flex items-center justify-center text-center text-7xl font-semibold text-[#00d54f]">
                    <label htmlFor="amount">$</label>
                    <input className="w-12 outline-none" id="amount" name="amount" type="number" value={amount} onChange={onAmountInput} min={0} />
                </div>

                <div className="flex w-full flex-col space-y-2">
                    <div className="flex rounded-lg border border-gray-200 p-4">
                        <label className="text-gray-300" htmlFor="receiver">
                            To:
                        </label>
                        <input className="w-full pl-2 font-medium text-gray-600 placeholder-gray-300 outline-none" id="receiver" name="receiver" type="text" placeholder="Name, $Cashtag, SMS, Email" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
                    </div>

                    <div className="flex rounded-lg border border-gray-200 p-4">
                        <label className="text-gray-300" htmlFor="transactionPurpose">
                            For:
                        </label>
                        <input className="w-full pl-2 font-medium text-gray-600 placeholder-gray-300 outline-none" id="transactionPurpose" name="transactionPurpose" type="text" placeholder="Dinner, Rent, etc." value={transactionPurpose} onChange={(e) => setTransactionPurpose(e.target.value)} />
                    </div>
                </div>

                <div className="flex w-full space-x-1">
                    <div ref={qrRef} />
                </div>

                <div className="flex w-full space-x-1">
                    <button className="w-1/2 rounded-lg bg-[#00d54f] py-3 px-12 text-white hover:bg-opacity-70 disabled:cursor-not-allowed disabled:bg-opacity-50" disabled>
                        Request
                    </button>
                    <button onClick={onPay} className="w-1/2 rounded-lg bg-[#00d54f] py-3 px-12 text-white hover:bg-opacity-70">
                        Pay
                    </button>
                </div>

            </div>
        </Modal>
    )
}

export default NewTransactionModal
