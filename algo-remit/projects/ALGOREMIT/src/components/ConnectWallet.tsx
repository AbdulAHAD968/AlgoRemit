import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import { Dispatch, SetStateAction, useEffect, useRef } from 'react'
import Account from './Account'

interface ConnectWalletProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const ConnectWallet = ({ open, setOpen }: ConnectWalletProps) => {
  const { wallets, activeAddress } = useWallet()
  const modalRef = useRef<HTMLDivElement>(null)

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.classList.add('animate-fadeInScale')
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white/95 text-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform scale-95 opacity-0"
      >
        <h3 className="font-semibold text-3xl mb-6 text-amber-800">Connect Your Wallet</h3>

        <div className="grid gap-4">
          {activeAddress && (
            <>
              <Account />
              <div className="border-t border-amber-200 my-4" />
            </>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                data-test-id={`${wallet.id}-connect`}
                className="flex items-center gap-3 px-6 py-4 rounded-xl bg-amber-50/50 hover:bg-amber-100 transition-all duration-300 border border-amber-200 shadow-sm hover:shadow-md text-left w-full"
                key={`provider-${wallet.id}`}
                onClick={() => wallet.connect()}
              >
                {!isKmd(wallet) && <img alt={`wallet_icon_${wallet.id}`} src={wallet.metadata.icon} className="w-8 h-8 object-contain" />}
                <span className="font-medium text-amber-900 text-lg">{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            data-test-id="close-wallet-modal"
            className="px-6 py-3 rounded-xl bg-rose-100 text-rose-800 font-medium hover:bg-rose-200 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={() => setOpen(false)}
          >
            Close
          </button>

          {activeAddress && (
            <button
              className="px-6 py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition-all duration-300 shadow-sm hover:shadow-md"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    // Cleanup fallback
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      <style>
        {`
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
        `}
      </style>
    </div>
  )
}

export default ConnectWallet
