import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { sha512_256 } from 'js-sha512'
import { useSnackbar } from 'notistack'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { FiLayers } from 'react-icons/fi'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface NFTMintProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const NFTmint = ({ open, setOpen }: NFTMintProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [metadataUrl, setMetadataUrl] = useState<string>('')
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

  const handleMintNFT = async () => {
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    if (!metadataUrl.startsWith('ipfs://') && !metadataUrl.startsWith('https://')) {
      enqueueSnackbar('Please enter a valid IPFS or HTTPS metadata URL', { variant: 'warning' })
      setLoading(false)
      return
    }

    try {
      enqueueSnackbar('Minting MasterPass NFT on Algorand TestNet...', { variant: 'info' })

      const createNFTResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: 1n,
        decimals: 0,
        assetName: 'MasterPass Ticket',
        unitName: 'MTK',
        url: metadataUrl,
        metadataHash: new Uint8Array(Buffer.from(sha512_256.digest(metadataUrl))),
        defaultFrozen: false,
      })

      enqueueSnackbar(`NFT minted successfully! TxID: ${createNFTResult.txIds[0]}`, {
        variant: 'success',
        autoHideDuration: 5000,
        action: (
          <a
            href={`https://testnet.algoexplorer.io/tx/${createNFTResult.txIds[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-100 hover:text-amber-200"
          >
            View on AlgoExplorer
          </a>
        ),
      })

      setMetadataUrl('')
      setOpen(false)
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Failed to mint NFT. Please check the metadata URL and try again.', { variant: 'error' })
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
          <FiLayers /> Mint Your MasterPass NFT
        </h3>
        <p className="text-amber-700 text-sm mb-6">
          Paste the metadata URL (IPFS or HTTPS) from Pinata or another provider to create your unique NFT on Algorand TestNet.
        </p>

        <div className="mb-6">
          <label className="block text-amber-700 font-medium mb-2">Metadata URL</label>
          <input
            type="text"
            placeholder="e.g., ipfs://... or https://..."
            className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none"
            value={metadataUrl}
            onChange={(e) => setMetadataUrl(e.target.value)}
          />
          {metadataUrl && !metadataUrl.startsWith('ipfs://') && !metadataUrl.startsWith('https://') && (
            <p className="text-rose-600 text-sm mt-1">URL must start with ipfs:// or https://</p>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            className="px-6 py-3 rounded-xl bg-rose-100 text-rose-800 font-medium hover:bg-rose-200 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 transition-all duration-300 shadow-lg hover:shadow-amber-400/30 relative overflow-hidden group flex items-center gap-2 ${
              !metadataUrl || (!metadataUrl.startsWith('ipfs://') && !metadataUrl.startsWith('https://'))
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            onClick={handleMintNFT}
            disabled={loading || !metadataUrl || (!metadataUrl.startsWith('ipfs://') && !metadataUrl.startsWith('https://'))}
          >
            <span className="relative z-10">{loading ? 'Minting...' : 'Mint NFT'}</span>
            {loading && <span className="relative z-10 animate-spin">⟳</span>}
            {!loading && <FiLayers className="relative z-10" />}
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

export default NFTmint
