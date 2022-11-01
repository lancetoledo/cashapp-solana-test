import { useState } from 'react'
import Action from '../components/header/Action'
import NavMenu from '../components/header/NavMenu'
import Profile from '../components/header/Profile'
import SearchBar from '../components/home/SearchBar'
import NewTransactionModal from '../components/transaction/NewTransactionModal'
import TransactionsList from '../components/transaction/TransactionsList'
import { transactions } from '../data/transactions'
import { useWallet } from '@solana/wallet-adapter-react'
import TransactionQRModal from '../components/transaction/TransactionQRModal'
import { useCashApp } from '../hooks/cashapp'


const Home = () => {
    const { connected, publicKey } = useWallet()
    const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false)
    const [transactionQRModalOpen, setTransactionQRModalOpen] = useState(false)
    const [qrCode, setQrCode] = useState(false)

    const { avatar, userAddress } = useCashApp()

    const addTransaction = ({ amount, receiver, transactionPurpose }) => {
        const newID = (transactions.length + 1).toString()

        transactions.push({
            id: newID,
            from: {
                name: 'Yap Yee Qiang',
                handle: 'yapyeeqiang',
                avatar: 'https://yeeqiang.me/avatar.jpeg',
                verified: true,
            },
            to: {
                name: receiver,
                handle: '-',
                avatar: 'https://yeeqiang.me/avatar.jpeg',
                verified: false,
            },
            description: transactionPurpose,
            transactionDate: new Date(),
            status: 'Completed',
            amount: amount,
            source: '-',
            identifier: '-',
        })

        setModalOpen(false)
    }

    return (
        <div className="flex min-h-screen ">
            <header className="flex w-[250px] flex-col bg-[#0bb534] p-12">
                <Profile setModalOpen={setTransactionQRModalOpen} avatar={avatar} userAddress={userAddress} setQrCode={setQrCode} />
                <TransactionQRModal modalOpen={transactionQRModalOpen} setModalOpen={setTransactionQRModalOpen} userAddress={userAddress} setQrCode={setQrCode} myKey={publicKey} />

                <NavMenu connected={connected} publicKey={publicKey} />

                <Action setModalOpen={setNewTransactionModalOpen} />
                <NewTransactionModal modalOpen={newTransactionModalOpen} setModalOpen={setNewTransactionModalOpen} addTransaction={addTransaction} />
            </header>

            <main className="flex flex-1 flex-col">
                <SearchBar />

                <TransactionsList connected={connected} />
            </main>
        </div>
    )
}

export default Home
