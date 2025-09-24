'use client'

import SpaceJumpGame from '@/components/SpaceJumpGame'
import WalletConnection from '@/components/WalletConnection'
import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import { useAccount } from 'wagmi'
import { useEffect } from 'react';

export function Demo() {
  const { isConnected } = useAccount()
  const { context, actions } = useMiniAppContext()

  useEffect(() => {
    if (isConnected) {
      actions?.addFrame()
    }
  }, [isConnected, actions])
  return (
    <div className="h-screen w-full relative">
      {/* Wallet Connection at top-right - circular compact */}
      <div className="fixed top-2 right-2 z-50">
        <WalletConnection size="small" />
      </div>

      {/* Game content - full screen */}
      <div className="w-full h-full">
        <SpaceJumpGame />
      </div>
    </div>
  )
}
