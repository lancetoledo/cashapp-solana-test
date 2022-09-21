import { useState } from 'react'
import Action from '../components/header/Action'
import NavMenu from '../components/header/NavMenu'
import Profile from '../components/header/Profile'
import SearchBar from '../components/home/SearchBar'
import NewTransactionModal from '../components/transaction/NewTransactionModal'
import TransactionsList from '../components/transaction/TransactionsList'
import { transactions } from '../data/transactions'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCashApp } from '../hooks/cashapp'
import { truncate } from '../utils/string'

const Home = () => {
    const { connected, publicKey } = useWallet()
    const [modalOpen, setModalOpen] = useState(false)

    const { getAvatarUrl, user, userAddress, doTransaction } = useCashApp()

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
                <Profile user={user} userAddress={userAddress} />

                <NavMenu connected={connected} publicKey={publicKey} />

                <Action setModalOpen={setModalOpen} />
                <NewTransactionModal modalOpen={modalOpen} setModalOpen={setModalOpen} addTransaction={addTransaction} doTransaction={doTransaction} />
            </header>

            <main className="flex flex-1 flex-col">
                <SearchBar />

                <TransactionsList connected={connected} />
            </main>
        </div>
    )
}

export default Home
