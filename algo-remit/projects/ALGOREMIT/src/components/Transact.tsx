import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TransactProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const Transact = ({ open, setOpen }: TransactProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('1')
  const modalRef = useRef<HTMLDivElement>(null)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.classList.add('animate-fadeInScale')
    }
  }, [open])

  const handleSubmitAlgo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    try {
      enqueueSnackbar('Initiating transaction...', { variant: 'info' })
      const result = await algorand.send.payment({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: receiverAddress,
        amount: algo(Number(amount)),
      })
      enqueueSnackbar(`Transaction sent successfully: ${result.txIds[0]}`, {
        variant: 'success',
        autoHideDuration: 5000,
        action: (
          <a
            href={`https://testnet.algoexplorer.io/tx/${result.txIds[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-100 hover:text-amber-200"
          >
            View on AlgoExplorer
          </a>
        ),
      })
      setReceiverAddress('')
      setAmount('1')
      setOpen(false)
    } catch (e) {
      enqueueSnackbar('Failed to send transaction. Please check the address and try again.', { variant: 'error' })
    }

    setLoading(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white/95 text-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform scale-95 opacity-0"
      >
        <h3 className="font-semibold text-3xl text-amber-800 mb-6 flex items-center gap-2">
          <FiSend /> Send AlgoRemit Payment
        </h3>

        <div className="mb-6">
          <label className="block text-amber-700 font-medium mb-2">Recipient Wallet Address</label>
          <input
            type="text"
            data-test-id="receiver-address"
            placeholder="Enter 58-character Algorand address"
            className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          />
          {receiverAddress && receiverAddress.length !== 58 && (
            <p className="text-rose-600 text-sm mt-1">Address must be 58 characters long</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-amber-700 font-medium mb-2">Amount (ALGO)</label>
          <input
            type="number"
            data-test-id="amount"
            placeholder="Enter amount in ALGO"
            className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.001"
            step="0.001"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-rose-100 text-rose-800 font-medium hover:bg-rose-200 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            data-test-id="send-algo"
            className={`px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 transition-all duration-300 shadow-lg hover:shadow-amber-400/30 relative overflow-hidden group flex items-center gap-2 ${
              loading || receiverAddress.length !== 58 || Number(amount) <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSubmitAlgo}
            disabled={loading || receiverAddress.length !== 58 || Number(amount) <= 0}
          >
            <span className="relative z-10">{loading ? 'Sending...' : `Send ${amount} ALGO`}</span>
            {loading && <span className="relative z-10 animate-spin">⟳</span>}
            {!loading && <FiSend className="relative z-10" />}
            <span className="absolute inset-0 bg-gradient-to-r from-amber-700 to-rose-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>

        <style>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeInScale {
            animation: fadeInScale 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  )
}

export default Transact
