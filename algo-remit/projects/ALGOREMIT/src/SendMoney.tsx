import { AlgorandClient, algo } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { sha512_256 } from 'js-sha512'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import { FaWallet } from 'react-icons/fa'
import { FiArrowLeft, FiBox, FiLayers, FiSend } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { ellipseAddress } from '../src/utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../src/utils/network/getAlgoClientConfigs'

const SendMoney = () => {
  const [activeTab, setActiveTab] = useState<'transact' | 'token' | 'nft'>('transact')
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('1')
  const [assetName, setAssetName] = useState<string>('RemitPKR')
  const [unitName, setUnitName] = useState<string>('RPKR')
  const [totalSupply, setTotalSupply] = useState<string>('1000000')
  const [decimals, setDecimals] = useState<string>('2')
  const [metadataUrl, setMetadataUrl] = useState<string>('')
  const modalRef = useRef<HTMLDivElement>(null)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const networkName = algodConfig.network === '' ? 'localnet' : algodConfig.network.toLocaleLowerCase()

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.classList.add('animate-fadeInScale')
    }
  }, [])

  const handleSubmitAlgo = async () => {
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
    } catch (e) {
      enqueueSnackbar('Failed to send transaction. Please check the address and try again.', { variant: 'error' })
    }
    setLoading(false)
  }

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
      setAssetName('RemitPKR')
      setUnitName('RPKR')
      setTotalSupply('1000000')
      setDecimals('2')
    } catch (e) {
      enqueueSnackbar('Failed to mint token. Please check inputs and try again.', { variant: 'error' })
    }
    setLoading(false)
  }

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
    } catch (e) {
      enqueueSnackbar('Failed to mint NFT. Please check the metadata URL and try again.', { variant: 'error' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-rose-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:text-amber-100 transition-colors">
              <FiArrowLeft size={20} />
              <span className="text-lg font-semibold">Back to Home</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaWallet /> AlgoRemit Hub
            </h1>
            {activeAddress && (
              <a
                href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-amber-100 transition-colors"
              >
                {ellipseAddress(activeAddress)} ({networkName})
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white/95 text-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex border-b border-amber-200 mb-6">
            <button
              className={`flex-1 py-3 px-4 text-lg font-medium transition-colors duration-300 ${
                activeTab === 'transact' ? 'text-amber-800 border-b-4 border-amber-600' : 'text-gray-500 hover:text-amber-700'
              }`}
              onClick={() => setActiveTab('transact')}
            >
              Send ALGO
            </button>
            <button
              className={`flex-1 py-3 px-4 text-lg font-medium transition-colors duration-300 ${
                activeTab === 'token' ? 'text-amber-800 border-b-4 border-amber-600' : 'text-gray-500 hover:text-amber-700'
              }`}
              onClick={() => setActiveTab('token')}
            >
              Mint Token
            </button>
            <button
              className={`flex-1 py-3 px-4 text-lg font-medium transition-colors duration-300 ${
                activeTab === 'nft' ? 'text-amber-800 border-b-4 border-amber-600' : 'text-gray-500 hover:text-amber-700'
              }`}
              onClick={() => setActiveTab('nft')}
            >
              Mint NFT
            </button>
          </div>

          <div ref={modalRef} className="animate-fadeInScale">
            {activeTab === 'transact' && (
              <div>
                <h3 className="font-semibold text-2xl text-amber-800 mb-6 flex items-center gap-2">
                  <FiSend className="text-amber-600" /> Send AlgoRemit Payment
                </h3>
                <div className="mb-6">
                  <label className="block text-amber-700 font-medium mb-2">Recipient Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Enter 58-character Algorand address"
                    className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200"
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
                    placeholder="Enter amount in ALGO"
                    className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.001"
                    step="0.001"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-6 py-3 rounded-xl bg-rose-100 text-rose-800 font-medium hover:bg-rose-200 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => {
                      setReceiverAddress('')
                      setAmount('1')
                    }}
                  >
                    Reset
                  </button>
                  <button
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
              </div>
            )}

            {activeTab === 'token' && (
              <div>
                <h3 className="font-semibold text-2xl text-amber-800 mb-6 flex items-center gap-2">
                  <FiBox className="text-amber-600" /> Mint Token (ASA)
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-amber-700 text-sm font-medium mb-2">Asset Name</label>
                    <input
                      type="text"
                      placeholder="e.g., RemitPKR"
                      className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-amber-700 text-sm font-medium mb-2">Unit Name</label>
                    <input
                      type="text"
                      placeholder="e.g., RPKR"
                      className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200"
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-amber-700 text-sm font-medium mb-2">Total Supply</label>
                    <input
                      type="number"
                      placeholder="e.g., 1000000"
                      className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200"
                      value={totalSupply}
                      onChange={(e) => setTotalSupply(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-amber-700 text-sm font-medium mb-2">Decimals</label>
                    <input
                      type="number"
                      placeholder="e.g., 2"
                      className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200"
                      value={decimals}
                      onChange={(e) => setDecimals(e.target.value)}
                      min="0"
                      max="19"
                    />
                    <p className="text-amber-600 text-xs mt-1">0 for whole tokens</p>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-6 py-3 rounded-xl bg-rose-100 text-rose-800 font-medium hover:bg-rose-200 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => {
                      setAssetName('RemitPKR')
                      setUnitName('RPKR')
                      setTotalSupply('1000000')
                      setDecimals('2')
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className={`px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 transition-all duration-300 shadow-lg hover:shadow-amber-400/30 relative overflow-hidden group flex items-center gap-2 ${
                      !assetName.trim() || !unitName.trim() || !totalSupply.trim() || Number(totalSupply) <= 0 || Number(decimals) < 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    onClick={handleMintToken}
                    disabled={
                      loading ||
                      !assetName.trim() ||
                      !unitName.trim() ||
                      !totalSupply.trim() ||
                      Number(totalSupply) <= 0 ||
                      Number(decimals) < 0
                    }
                  >
                    <span className="relative z-10">{loading ? 'Minting...' : 'Mint Token'}</span>
                    {loading && <span className="relative z-10 animate-spin">⟳</span>}
                    {!loading && <FiBox className="relative z-10" />}
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-700 to-rose-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'nft' && (
              <div>
                <h3 className="font-semibold text-2xl text-amber-800 mb-6 flex items-center gap-2">
                  <FiLayers className="text-amber-600" /> Mint Your MasterPass NFT
                </h3>
                <p className="text-amber-700 text-sm mb-4">
                  Paste the metadata URL (IPFS or HTTPS) from Pinata or another provider to create your unique NFT on Algorand TestNet.
                </p>
                <div className="mb-6">
                  <label className="block text-amber-700 font-medium mb-2">Metadata URL</label>
                  <input
                    type="text"
                    placeholder="e.g., ipfs://... or https://..."
                    className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200"
                    value={metadataUrl}
                    onChange={(e) => setMetadataUrl(e.target.value)}
                  />
                  {metadataUrl && !metadataUrl.startsWith('ipfs://') && !metadataUrl.startsWith('https://') && (
                    <p className="text-rose-600 text-sm mt-1">URL must start with ipfs:// or https://</p>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-6 py-3 rounded-xl bg-rose-100 text-rose-800 font-medium hover:bg-rose-200 transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => setMetadataUrl('')}
                  >
                    Reset
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
              </div>
            )}
          </div>
        </div>
      </main>

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
  )
}

export default SendMoney
