import { useState } from 'react'

interface CostComparisonProps {
  initialAmount?: number
  maxAmount?: number
  minAmount?: number
}

const CostComparison: React.FC<CostComparisonProps> = ({ initialAmount = 200, maxAmount = 1000, minAmount = 10 }) => {
  const [amount, setAmount] = useState<number>(initialAmount)

  const westernUnionFee = 15 + amount * 0.02 // Flat $15 + 2% for realism
  const algoRemitFee = 0.001
  const westernUnionTime = '3-5 days'
  const algoRemitTime = '4 seconds'

  const westernUnionReceived = Math.max(0, amount - westernUnionFee).toFixed(2)
  const algoRemitReceived = (amount - algoRemitFee).toFixed(3)
  const savings = (westernUnionFee - algoRemitFee).toFixed(2)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setAmount(Math.min(maxAmount, Math.max(minAmount, value)))
  }

  return (
    <div className="relative max-w-4xl mx-auto p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-200/50 transition-all duration-500 hover:shadow-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-rose-50/50 rounded-2xl" />
      <div className="relative z-10">
        <h3 className="text-3xl font-bold text-amber-900 mb-8 tracking-tight">Cost Comparison Simulator</h3>

        <div className="mb-8">
          <label className="block text-lg font-semibold text-amber-800 mb-3">Transfer Amount (USD)</label>
          <div className="flex items-center gap-4">
            <span className="text-amber-700 font-medium">$</span>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full p-3 rounded-lg bg-amber-50/50 border border-amber-300 text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter amount in USD"
              min={minAmount}
              max={maxAmount}
            />
          </div>
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            value={amount}
            onChange={handleAmountChange}
            className="w-full h-2 bg-amber-200 rounded-lg cursor-pointer mt-4 accent-amber-600 transition-all duration-300"
          />
          <div className="flex justify-between text-sm text-amber-600 mt-2">
            <span>${minAmount}</span>
            <span>${maxAmount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-rose-50/80 rounded-xl border border-rose-200/50 shadow-md hover:shadow-lg transition-all duration-300">
            <h4 className="text-xl font-semibold text-rose-900 mb-4">Western Union</h4>
            <div className="space-y-3">
              <p className="text-rose-800">
                <span className="font-medium">Amount Received:</span> ${westernUnionReceived}
              </p>
              <p className="text-rose-800">
                <span className="font-medium">Fee:</span> ${westernUnionFee.toFixed(2)}
              </p>
              <p className="text-rose-800">
                <span className="font-medium">Time:</span> {westernUnionTime}
              </p>
            </div>
          </div>
          <div className="p-6 bg-amber-50/80 rounded-xl border border-amber-200/50 shadow-md hover:shadow-lg transition-all duration-300">
            <h4 className="text-xl font-semibold text-amber-900 mb-4">AlgoRemit</h4>
            <div className="space-y-3">
              <p className="text-amber-800">
                <span className="font-medium">Amount Received:</span> ${algoRemitReceived}
              </p>
              <p className="text-amber-800">
                <span className="font-medium">Fee:</span> ${algoRemitFee.toFixed(3)}
              </p>
              <p className="text-amber-800">
                <span className="font-medium">Time:</span> {algoRemitTime}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-amber-100/80 to-rose-100/80 rounded-xl text-center shadow-md">
          <h4 className="text-xl font-semibold text-amber-900 mb-3">Your Savings with AlgoRemit</h4>
          <p className="text-4xl font-bold text-rose-600 tracking-tight">${savings}</p>
          <p className="text-amber-800 mt-2 text-sm font-medium">Instant settlement, zero intermediaries</p>
        </div>
      </div>

      <style>
        {`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            background: #b45309; /* amber-700 */
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 0 6px rgba(180, 83, 9, 0.2);
            transition: all 0.2s ease;
          }
          input[type='range']::-webkit-slider-thumb:hover {
            box-shadow: 0 0 0 8px rgba(180, 83, 9, 0.3);
          }
          input[type='range']::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: #b45309;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 0 6px rgba(180, 83, 9, 0.2);
            transition: all 0.2s ease;
          }
          input[type='range']::-moz-range-thumb:hover {
            box-shadow: 0 0 0 8px rgba(180, 83, 9, 0.3);
          }
          .shadow-3xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
        `}
      </style>
    </div>
  )
}

export default CostComparison
