import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { FiBox, FiX } from 'react-icons/fi'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TokenMintProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const Tokenmint = ({ open, setOpen }: TokenMintProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [assetName, setAssetName] = useState<string>('RemitPKR')
  const [unitName, setUnitName] = useState<string>('RPKR')
  const [totalSupply, setTotalSupply] = useState<string>('1000000')
  const [decimals, setDecimals] = useState<string>('2')
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

  const handleMintToken = async () => {
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    if (!assetName.trim() || !unitName.trim() || !totalSupply.trim() || Number(totalSupply) <= 0 || Number(decimals) < 0) {
      enqueueSnackbar('Please provide valid token details', { variant: 'warning' })
      setLoading(false)
      return
    }

    try {
      enqueueSnackbar('Creating token on Algorand TestNet...', { variant: 'info' })

      const onChainTotal = BigInt(totalSupply)
      const decimalsBig = BigInt(decimals)

      const createResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: onChainTotal,
        decimals: Number(decimalsBig),
        assetName,
        unitName,
        defaultFrozen: false,
      })

      enqueueSnackbar(`Token minted successfully! TxID: ${createResult.txIds[0]}`, {
        variant: 'success',
        autoHideDuration: 5000,
        action: (
          <a
            href={`https://testnet.algoexplorer.io/tx/${createResult.txIds[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-100 hover:text-amber-200"
          >
            View on AlgoExplorer
          </a>
        ),
      })

      // Reset form
      setAssetName('RemitPKR')
      setUnitName('RPKR')
      setTotalSupply('1000000')
      setDecimals('2')
      setOpen(false)
    } catch (e) {
      enqueueSnackbar('Failed to mint token. Please check inputs and try again.', { variant: 'error' })
    }

    setLoading(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="bg-white/95 text-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-auto transform scale-95 opacity-0 relative"
      >
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-amber-700 hover:text-amber-900 transition-colors">
          <FiX size={20} />
        </button>

        <h3 className="font-semibold text-2xl text-amber-800 mb-4 flex items-center gap-2">
          <FiBox className="text-amber-600" /> Mint Token (ASA)
        </h3>

        <p className="text-amber-700 text-sm mb-6">Create your custom token on Algorand TestNet</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-amber-700 text-sm font-medium mb-1">Asset Name</label>
            <input
              type="text"
              placeholder="e.g., RemitPKR"
              className="w-full p-2.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none text-sm"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-amber-700 text-sm font-medium mb-1">Unit Name</label>
            <input
              type="text"
              placeholder="e.g., RPKR"
              className="w-full p-2.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none text-sm"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-amber-700 text-sm font-medium mb-1">Total Supply</label>
            <input
              type="number"
              placeholder="e.g., 1000000"
              className="w-full p-2.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none text-sm"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              min="1"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-amber-700 text-sm font-medium mb-1">Decimals</label>
            <input
              type="number"
              placeholder="e.g., 2"
              className="w-full p-2.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none text-sm"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              min="0"
              max="19"
            />
            <p className="text-amber-600 text-xs mt-1">0 for whole tokens</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2.5 rounded-lg bg-rose-100 text-rose-800 text-sm font-medium hover:bg-rose-200 transition-all duration-300"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2.5 rounded-lg font-bold text-white text-sm bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 transition-all duration-300 relative overflow-hidden group flex items-center gap-1.5 ${
              !assetName.trim() || !unitName.trim() || !totalSupply.trim() || Number(totalSupply) <= 0 || Number(decimals) < 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            onClick={handleMintToken}
            disabled={
              loading || !assetName.trim() || !unitName.trim() || !totalSupply.trim() || Number(totalSupply) <= 0 || Number(decimals) < 0
            }
          >
            <span className="relative z-10">{loading ? 'Minting...' : 'Mint Token'}</span>
            {loading && <span className="relative z-10 animate-spin text-sm">⟳</span>}
            {!loading && <FiBox className="relative z-10" size={14} />}
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

export default Tokenmint
