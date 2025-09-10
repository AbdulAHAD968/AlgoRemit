import { useState } from 'react'
import { FiArrowRight, FiCheckCircle, FiClock, FiDollarSign, FiGlobe, FiSend } from 'react-icons/fi'

const countries = [
  { name: 'Pakistan', currency: 'PKR', wallet: 'JazzCash/Easypaisa', flag: '🇵🇰' },
  { name: 'United Arab Emirates', currency: 'AED', wallet: 'Local Bank Deposit', flag: '🇦🇪' },
  { name: 'Saudi Arabia', currency: 'SAR', wallet: 'Local Bank Deposit', flag: '🇸🇦' },
  { name: 'United Kingdom', currency: 'GBP', wallet: 'Bank Transfer', flag: '🇬🇧' },
  { name: 'Canada', currency: 'CAD', wallet: 'Interac e-Transfer', flag: '🇨🇦' },
  { name: 'Australia', currency: 'AUD', wallet: 'Bank Deposit', flag: '🇦🇺' },
  { name: 'Malaysia', currency: 'MYR', wallet: 'Local Wallet Credit', flag: '🇲🇾' },
  { name: 'United States', currency: 'USD', wallet: 'ACH Deposit', flag: '🇺🇸' },
  { name: 'Qatar', currency: 'QAR', wallet: 'Local Bank Deposit', flag: '🇶🇦' },
  { name: 'Kuwait', currency: 'KWD', wallet: 'Local Bank Deposit', flag: '🇰🇼' },
]

const MarketExpansion = () => {
  const [senderCountry, setSenderCountry] = useState('United States')
  const [destination, setDestination] = useState('Pakistan')
  const [amount, setAmount] = useState(200)
  const [transferStage, setTransferStage] = useState<'idle' | 'initiating' | 'sending' | 'converting' | 'received' | 'error'>('idle')
  const [transactionId, setTransactionId] = useState('')
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [fee, setFee] = useState(0.001)
  const [exchangeRate, setExchangeRate] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  const getDestinationDetails = (dest: string) => countries.find((c) => c.name === dest) || countries[0]

  const simulateExchangeRate = (destCurrency: string) => {
    // Dummy exchange rates from USD
    const rates: Record<string, number> = {
      PKR: 278.5,
      AED: 3.67,
      SAR: 3.75,
      GBP: 0.76,
      CAD: 1.35,
      AUD: 1.48,
      MYR: 4.35,
      USD: 1,
      QAR: 3.64,
      KWD: 0.305,
    }
    return rates[destCurrency] || 1
  }

  const generateTxId = () => `ALGO-TX-${Math.random().toString(36).substring(2, 11).toUpperCase()}`

  const simulateTransfer = () => {
    setTransferStage('initiating')
    setErrorMessage('')
    const destDetails = getDestinationDetails(destination)
    const rate = simulateExchangeRate(destDetails.currency)
    setExchangeRate(rate)

    // Simulate network delay
    setTimeout(() => {
      setTransferStage('sending')
      setTransactionId(generateTxId())

      setTimeout(() => {
        setTransferStage('converting')

        setTimeout(() => {
          // Simulate success or rare error
          if (Math.random() < 0.05) {
            setTransferStage('error')
            setErrorMessage('Simulated network error. Please try again.')
          } else {
            const converted = (amount - fee) * rate
            setReceivedAmount(converted)
            setTransferStage('received')
          }
        }, 1500) // Conversion delay
      }, 1000) // Sending delay
    }, 500) // Initiation delay
  }

  const resetSimulation = () => {
    setTransferStage('idle')
    setTransactionId('')
    setReceivedAmount(0)
    setErrorMessage('')
  }

  return (
    <div className="backdrop-blur-lg bg-white/70 p-8 rounded-2xl border border-amber-100 shadow-lg transform transition-all duration-300 hover:shadow-xl cursor-pointer">
      <h3 className="text-3xl font-semibold text-amber-800 mb-6 flex items-center gap-2">
        <FiGlobe /> Global Market Expansion Simulator
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-amber-700 font-medium mb-2 flex items-center gap-2">
            <FiSend /> Sender Location
          </label>
          <select
            value={senderCountry}
            onChange={(e) => setSenderCountry(e.target.value)}
            className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none appearance-none"
          >
            {countries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-amber-700 font-medium mb-2 flex items-center gap-2">
            <FiArrowRight /> Destination
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none appearance-none"
          >
            {countries
              .filter((c) => c.name !== senderCountry)
              .map((country) => (
                <option key={country.name} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-amber-700 font-medium mb-2 flex items-center gap-2">
          <FiDollarSign /> Amount to Send (USD)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 focus:border-amber-400 focus:outline-none"
          placeholder="Enter amount in USD"
          min={10}
          max={10000}
        />
      </div>

      <button
        onClick={transferStage === 'idle' ? simulateTransfer : resetSimulation}
        className="w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 transition-all duration-300 shadow-lg hover:shadow-amber-400/30 relative overflow-hidden group cursor-pointer flex items-center justify-center gap-2 mb-6"
        disabled={transferStage !== 'idle' && transferStage !== 'received' && transferStage !== 'error'}
      >
        <span className="relative z-10">
          {transferStage === 'idle'
            ? 'Simulate Cross-Border Transfer'
            : transferStage === 'received' || transferStage === 'error'
              ? 'Reset Simulation'
              : 'Simulating...'}
        </span>
        {transferStage === 'idle' && <FiSend className="ml-2" />}
        <span className="absolute inset-0 bg-gradient-to-r from-amber-700 to-rose-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </button>

      {transferStage !== 'idle' && (
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 animate-fadeInUp">
          <h4 className="text-xl font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <FiClock /> Transfer Simulation Progress
          </h4>
          <div className="space-y-4">
            <div className={`flex items-center gap-3 ${transferStage !== 'initiating' ? 'text-amber-600' : 'text-rose-600 font-bold'}`}>
              <FiCheckCircle className={transferStage !== 'initiating' ? 'opacity-100' : 'opacity-50'} />
              Initiating transfer from {senderCountry} to {destination}
            </div>
            <div
              className={`flex items-center gap-3 ${['sending', 'converting', 'received'].includes(transferStage) ? 'text-amber-600' : 'text-gray-400'}`}
            >
              <FiCheckCircle className={['sending', 'converting', 'received'].includes(transferStage) ? 'opacity-100' : 'opacity-50'} />
              Sending {amount} USD via Algorand (TX: {transactionId})
            </div>
            <div
              className={`flex items-center gap-3 ${['converting', 'received'].includes(transferStage) ? 'text-amber-600' : 'text-gray-400'}`}
            >
              <FiCheckCircle className={['converting', 'received'].includes(transferStage) ? 'opacity-100' : 'opacity-50'} />
              Converting to local currency at rate 1 USD = {exchangeRate} {getDestinationDetails(destination).currency}
            </div>
            <div className={`flex items-center gap-3 ${transferStage === 'received' ? 'text-amber-600' : 'text-gray-400'}`}>
              <FiCheckCircle className={transferStage === 'received' ? 'opacity-100' : 'opacity-50'} />
              Funds received as {getDestinationDetails(destination).wallet} in {destination}
            </div>
          </div>

          {transferStage === 'received' && (
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-rose-100 rounded-xl text-center">
              <p className="text-amber-800 font-medium">
                Amount Received: {receivedAmount.toFixed(2)} {getDestinationDetails(destination).currency}
              </p>
              <p className="text-amber-700 text-sm">Fee: ${fee} | Time: 4 seconds | Instant local balance credit</p>
            </div>
          )}

          {transferStage === 'error' && <div className="mt-6 p-4 bg-rose-100 rounded-xl text-rose-800 text-center">{errorMessage}</div>}
        </div>
      )}

      <p className="text-amber-700 mt-6 text-center text-sm">
        Experience seamless remittances to key destinations where Pakistanis work and live. Powered by Algorand for global reach.
      </p>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default MarketExpansion
