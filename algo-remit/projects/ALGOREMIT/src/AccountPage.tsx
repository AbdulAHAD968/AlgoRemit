import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import * as algosdk from 'algosdk'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { FaHistory } from 'react-icons/fa'
import { FiCopy, FiDollarSign, FiDownload, FiExternalLink, FiHome, FiPieChart, FiRefreshCw, FiTrendingUp } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import ConnectWallet from '../src/components/ConnectWallet' // Import the ConnectWallet component
import { ellipseAddress } from './utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

// Utility for debouncing
function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return ((...args: Parameters<T>) => {
    if (timeout !== undefined) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

// Utility for retry with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    const error = err as { message?: string }
    if (retries === 0 || !error?.message?.includes('429')) {
      throw err
    }
    await new Promise((resolve) => setTimeout(resolve, delay))
    return retryWithBackoff(fn, retries - 1, delay * 2)
  }
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)
gsap.registerPlugin(ScrollTrigger)

interface Asset {
  id: number
  name: string
  amount: number
  decimals: number
  unitName?: string
}

interface Transaction {
  id: string
  type: string
  amount?: number
  timestamp: number
  sender: string
  receiver: string
}

interface Stats {
  totalTransactions: number
  totalAlgoSent: number
  totalAlgoReceived: number
  averageTransactionAmount: number
}

interface AccountAsset {
  'asset-id': number
  amount: number
  decimals?: number
}

interface PaymentTransaction {
  amount: number
  receiver: string
}

interface AlgorandTransaction {
  id: string
  'tx-type': string
  'payment-transaction'?: PaymentTransaction
  'round-time'?: number
  sender: string
}

const AccountPage = () => {
  const { activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const algoConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig: algoConfig })
  const indexerClient = useMemo(() => {
    const tokenParam: string | Record<string, string> =
      typeof indexerConfig.token === 'string' ? indexerConfig.token : (indexerConfig.token as Record<string, string>)
    return new algosdk.Indexer(tokenParam || '', indexerConfig.server, indexerConfig.port || '')
  }, [indexerConfig])

  const [balance, setBalance] = useState<string | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({
    totalTransactions: 0,
    totalAlgoSent: 0,
    totalAlgoReceived: 0,
    averageTransactionAmount: 0,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [exporting, setExporting] = useState<boolean>(false)
  const [showConnectWallet, setShowConnectWallet] = useState<boolean>(false) // State for ConnectWallet modal

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'LocalNet' : algoConfig.network.charAt(0).toUpperCase() + algoConfig.network.slice(1).toLowerCase()
  }, [algoConfig.network])

  const fetchAssetMetadata = useCallback(
    async (assetId: number) => {
      try {
        // Use indexer to fetch asset metadata (safer across clients)
        const res: unknown = await indexerClient.lookupAssetByID(assetId).do()
        type AssetResponse = {
          asset?: {
            params?: {
              name?: string
              'unit-name'?: string
            }
          }
          params?: {
            name?: string
            'unit-name'?: string
          }
        }
        const assetRes = res as AssetResponse
        const params = assetRes?.asset?.params || assetRes?.params || {}
        return {
          name: params.name || `Asset ${assetId}`,
          unitName: params['unit-name'] || '',
        }
      } catch (error) {
        console.error(`Error fetching metadata for asset ${assetId}:`, error)
        return {
          name: `Asset ${assetId}`,
          unitName: '',
        }
      }
    },
    [indexerClient],
  )

  const fetchAccountInfo = useCallback(async () => {
    if (!activeAddress) return
    setLoading(true)
    try {
      // Fetch account information with retry logic
      const accountInfo: unknown = await retryWithBackoff(() => algorand.account.getInformation(activeAddress), 3, 1000)
      const acct = accountInfo as { amount?: number; assets?: AccountAsset[] }
      const algoBalance = (Number(acct?.amount ?? 0) / 1_000_000).toFixed(6)
      setBalance(algoBalance)

      // Handle assets (use narrowed acct)
      if (acct?.assets && acct.assets.length > 0) {
        const accountAssets = await Promise.all(
          acct.assets
            .filter((asset: AccountAsset) => Number(asset.amount) > 0)
            .map(async (asset: AccountAsset) => {
              const assetId = Number(asset['asset-id'])
              const metadata = await fetchAssetMetadata(assetId)
              return {
                id: assetId,
                name: metadata.name,
                amount: Number(asset.amount),
                decimals: asset.decimals || 0,
                unitName: metadata.unitName,
              }
            }),
        )
        setAssets(accountAssets)
      } else {
        setAssets([])
      }

      // Fetch transactions with retry logic
      const txnResponse: unknown = await retryWithBackoff(
        () => indexerClient.lookupAccountTransactions(activeAddress).limit(20).do(),
        3,
        1000,
      )

      const txnsRaw = (txnResponse as { transactions?: unknown[] })?.transactions || []
      const formattedTxns: Transaction[] = (txnsRaw as unknown[]).map((t) => {
        const txn = t as Record<string, unknown>
        const payment = txn['payment-transaction'] as Record<string, unknown> | undefined
        const amount = payment && payment.amount !== undefined ? Number(payment.amount) / 1_000_000 : undefined
        const roundTime = txn['round-time'] !== undefined ? Number(txn['round-time']) : undefined
        return {
          id: String(txn['id'] ?? ''),
          type: String(txn['tx-type'] ?? ''),
          amount,
          timestamp: roundTime ? roundTime * 1000 : Date.now(),
          sender: String(txn['sender'] ?? ''),
          receiver: payment ? String(payment.receiver ?? '') : '',
        }
      })

      setTransactions(formattedTxns)

      // Calculate stats
      const paymentTxns = formattedTxns.filter((txn: Transaction) => txn.type === 'pay' && txn.amount !== undefined)
      const sentTxns = paymentTxns.filter((txn: Transaction) => txn.sender === activeAddress)
      const receivedTxns = paymentTxns.filter((txn: Transaction) => txn.receiver === activeAddress)

      const totalAlgoSent = sentTxns.reduce((sum: number, txn: Transaction) => sum + (txn.amount || 0), 0)
      const totalAlgoReceived = receivedTxns.reduce((sum: number, txn: Transaction) => sum + (txn.amount || 0), 0)
      const averageTransactionAmount = paymentTxns.length > 0 ? (totalAlgoSent + totalAlgoReceived) / paymentTxns.length : 0

      setStats({
        totalTransactions: formattedTxns.length,
        totalAlgoSent: Number(totalAlgoSent.toFixed(6)),
        totalAlgoReceived: Number(totalAlgoReceived.toFixed(6)),
        averageTransactionAmount: Number(averageTransactionAmount.toFixed(6)),
      })

      setLastUpdated(new Date())
    } catch (err: unknown) {
      const error = err as { message?: string; stack?: string }
      const msg = error?.message ?? ''
      if (msg.includes('account not found')) {
        setBalance('0.000000')
        setAssets([])
        setTransactions([])
        setStats({
          totalTransactions: 0,
          totalAlgoSent: 0,
          totalAlgoReceived: 0,
          averageTransactionAmount: 0,
        })
        enqueueSnackbar('Account is unfunded. Please use a TestNet faucet to add ALGO.', {
          variant: 'info',
          action: (
            <a
              href="https://dispenser.testnet-algorand.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-100 hover:text-amber-200"
            >
              Visit Faucet
            </a>
          ),
        })
      } else {
        console.error('Error fetching account info:', msg, error?.stack)
        const errorMessage = msg.includes('429')
          ? 'Rate limit exceeded. Please wait a moment and try again.'
          : `Failed to fetch account information: ${msg || 'Unknown error'}. Check network configuration (Algod and Indexer).`
        enqueueSnackbar(errorMessage, { variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }, [activeAddress, algorand, indexerClient, enqueueSnackbar, fetchAssetMetadata])

  const debouncedFetchAccountInfo = useCallback(debounce(fetchAccountInfo, 1000), [fetchAccountInfo])

  useEffect(() => {
    // Only fetch on initial load if we haven't loaded data yet
    if (activeAddress && !balance && !lastUpdated) {
      debouncedFetchAccountInfo()
    }
  }, [activeAddress, balance, lastUpdated, debouncedFetchAccountInfo])

  useEffect(() => {
    // GSAP animations for sections
    gsap.fromTo(
      '.account-section',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.account-section', start: 'top 80%' },
      },
    )
    gsap.fromTo(
      '.chart-container',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.chart-container', start: 'top 80%' } },
    )
  }, [])

  const copyAddress = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress)
      enqueueSnackbar('Address copied to clipboard', { variant: 'success' })
    }
  }

  const goToHome = () => {
    navigate('/')
  }

  const exportTransactions = async () => {
    setExporting(true)
    try {
      // Create CSV content
      const headers = ['Date', 'Type', 'Amount (ALGO)', 'Sender', 'Receiver', 'Transaction ID']
      const csvContent = [
        headers.join(','),
        ...transactions.map((txn) =>
          [new Date(txn.timestamp).toLocaleDateString(), txn.type, txn.amount || '0', txn.sender, txn.receiver, txn.id].join(','),
        ),
      ].join('\n')

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `algo-transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      enqueueSnackbar('Transactions exported successfully', { variant: 'success' })
    } catch (error) {
      console.error('Error exporting transactions:', error)
      enqueueSnackbar('Failed to export transactions', { variant: 'error' })
    } finally {
      setExporting(false)
    }
  }

  const viewFullHistory = () => {
    if (activeAddress) {
      window.open(`https://testnet.algoexplorer.io/address/${activeAddress}`, '_blank')
    }
  }

  // Chart data for transactions over time (line chart)
  const lineChartData = {
    labels: transactions.filter((txn) => txn.type === 'pay' && txn.amount).map((txn) => new Date(txn.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'ALGO Sent',
        data: transactions.filter((txn) => txn.type === 'pay' && txn.amount && txn.sender === activeAddress).map((txn) => txn.amount || 0),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'ALGO Received',
        data: transactions
          .filter((txn) => txn.type === 'pay' && txn.amount && txn.receiver === activeAddress)
          .map((txn) => txn.amount || 0),
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Chart data for transaction types (bar chart)
  const barChartData = {
    labels: ['Sent', 'Received', 'Other'],
    datasets: [
      {
        label: 'Transaction Count',
        data: [
          transactions.filter((txn) => txn.type === 'pay' && txn.sender === activeAddress).length,
          transactions.filter((txn) => txn.type === 'pay' && txn.receiver === activeAddress).length,
          transactions.filter((txn) => txn.type !== 'pay').length,
        ],
        backgroundColor: ['#DC2626', '#16A34A', '#D97706'],
        borderColor: ['#B91C1C', '#15803D', '#B45309'],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#78350F', font: { size: 12 } },
      },
      title: {
        display: true,
        text: chartType === 'line' ? 'Transaction History' : 'Transaction Distribution',
        color: '#78350F',
        font: { size: 16, weight: 'bold' as const },
      },
    },
    scales: {
      x: {
        ticks: { color: '#92400E' },
        grid: { color: 'rgba(120, 53, 15, 0.1)' },
      },
      y: {
        ticks: { color: '#92400E' },
        beginAtZero: true,
        grid: { color: 'rgba(120, 53, 15, 0.1)' },
      },
    },
  }

  // If user is not logged in, show the ConnectWallet component
  if (!activeAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-lg rounded-2xl border border-amber-100 shadow-lg">
          <h2 className="text-2xl font-semibold text-amber-800 mb-4">Connect Your Wallet</h2>
          <p className="text-amber-600 mb-6">Please connect your wallet to view account details.</p>
          <button
            onClick={() => setShowConnectWallet(true)}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center mx-auto"
          >
            Connect Wallet
          </button>
          <button
            onClick={goToHome}
            className="mt-4 px-6 py-3 bg-white text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors flex items-center justify-center mx-auto"
          >
            <FiHome className="mr-2" /> Go to Home
          </button>
        </div>
        <ConnectWallet open={showConnectWallet} setOpen={setShowConnectWallet} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <ConnectWallet open={showConnectWallet} setOpen={setShowConnectWallet} />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Account Dashboard</h1>
            <p className="text-amber-700 mt-1">Welcome to your Algorand banking portal</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={goToHome}
              className="px-4 py-2 bg-white text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors flex items-center"
            >
              <FiHome className="mr-2" /> Home
            </button>
            <button
              onClick={fetchAccountInfo}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center"
              disabled={loading}
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="account-section bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-medium opacity-90">Total Balance</h2>
                  <p className="text-3xl font-bold mt-2">{balance ? `${balance} ALGO` : 'Loading...'}</p>
                </div>
                <div className="text-right text-sm opacity-80">
                  <p>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</p>
                  <p className="mt-1">{networkName}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                <div className="text-center">
                  <FiTrendingUp className="mx-auto text-2xl opacity-80" />
                  <p className="text-sm mt-2 opacity-80">Received</p>
                  <p className="font-semibold">{stats.totalAlgoReceived} ALGO</p>
                </div>
                <div className="text-center">
                  <FiDollarSign className="mx-auto text-2xl opacity-80" />
                  <p className="text-sm mt-2 opacity-80">Sent</p>
                  <p className="font-semibold">{stats.totalAlgoSent} ALGO</p>
                </div>
                <div className="text-center">
                  <FiPieChart className="mx-auto text-2xl opacity-80" />
                  <p className="text-sm mt-2 opacity-80">Transactions</p>
                  <p className="font-semibold">{stats.totalTransactions}</p>
                </div>
              </div>
            </div>

            {/* Transactions Chart Section */}
            {transactions.length > 0 && (
              <div className="account-section chart-container bg-white p-6 rounded-2xl border border-amber-100 shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-amber-900">Transaction History</h2>
                  <div className="flex rounded-lg overflow-hidden border border-amber-200">
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-4 py-2 ${chartType === 'line' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700'} transition-colors`}
                    >
                      Line
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-4 py-2 ${chartType === 'bar' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700'} transition-colors`}
                    >
                      Bar
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  {chartType === 'line' ? (
                    <Line data={lineChartData} options={chartOptions} />
                  ) : (
                    <Bar data={barChartData} options={chartOptions} />
                  )}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="account-section bg-white p-6 rounded-2xl border border-amber-100 shadow">
                <h2 className="text-xl font-semibold text-amber-900 mb-6">Recent Transactions</h2>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((txn) => (
                    <div key={txn.id} className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium text-amber-900">{txn.sender === activeAddress ? 'Sent' : 'Received'} ALGO</p>
                        <p className="text-sm text-amber-600">{new Date(txn.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${txn.sender === activeAddress ? 'text-red-600' : 'text-green-600'}`}>
                          {txn.amount ? `${txn.sender === activeAddress ? '-' : '+'}${txn.amount.toFixed(6)} ALGO` : 'N/A'}
                        </p>
                        <a
                          className="text-sm text-amber-600 hover:text-amber-800 transition-colors flex items-center justify-end mt-1"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://testnet.algoexplorer.io/tx/${txn.id}`}
                        >
                          View <FiExternalLink className="ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Details Card */}
            <div className="account-section bg-white p-6 rounded-2xl border border-amber-100 shadow">
              <h2 className="text-xl font-semibold text-amber-900 mb-4">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-amber-600 mb-1">Address</p>
                  <div className="flex items-center justify-between">
                    <a
                      className="text-amber-700 hover:text-amber-900 transition-colors truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://testnet.algoexplorer.io/address/${activeAddress}`}
                    >
                      {ellipseAddress(activeAddress, 6)}
                    </a>
                    <button
                      onClick={copyAddress}
                      className="p-2 text-amber-600 hover:text-amber-800 transition-colors"
                      aria-label="Copy address"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-amber-600 mb-1">Network</p>
                  <p className="text-amber-900">{networkName}</p>
                </div>

                <div>
                  <p className="text-sm text-amber-600 mb-1">Account Status</p>
                  <p className="text-green-600 font-medium">Active</p>
                </div>
              </div>
            </div>

            {/* Assets Card */}
            {assets.length > 0 && (
              <div className="account-section bg-white p-6 rounded-2xl border border-amber-100 shadow">
                <h2 className="text-xl font-semibold text-amber-900 mb-4">Digital Assets</h2>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium text-amber-900">{asset.name}</p>
                        <p className="text-sm text-amber-600">ID: {asset.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-900">
                          {(asset.amount / Math.pow(10, asset.decimals)).toLocaleString()} {asset.unitName || 'units'}
                        </p>
                        <a
                          className="text-sm text-amber-600 hover:text-amber-800 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://testnet.algoexplorer.io/asset/${asset.id}`}
                        >
                          Details
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="account-section bg-white p-6 rounded-2xl border border-amber-100 shadow">
              <h2 className="text-xl font-semibold text-amber-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="https://dispenser.testnet-algorand.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <span>Get TestNet ALGO</span>
                  <FiExternalLink />
                </a>
                <button
                  onClick={viewFullHistory}
                  className="w-full flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <span>View Full History</span>
                  <FaHistory />
                </button>
                <button
                  onClick={exportTransactions}
                  disabled={exporting || transactions.length === 0}
                  className="w-full flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  <span>{exporting ? 'Exporting...' : 'Export Statements'}</span>
                  <FiDownload />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
