'use client'

import { useState } from 'react'
import type { CharacterStage } from '@/lib/character'

const FALLBACK_EMOJI: Record<CharacterStage['type'], string> = {
  default:  '🥚',
  single:   '🌱',
  combined: '🌟',
}

function getStagePaths(stage: CharacterStage): string[] {
  switch (stage.type) {
    case 'combined':
      return [
        `/characters/${stage.main}_${stage.sub}.png`,
        `/characters/${stage.main}.png`,
        `/characters/default.png`,
      ]
    case 'single':
      return [
        `/characters/${stage.main}.png`,
        `/characters/default.png`,
      ]
    case 'default':
      return ['/characters/default.png']
  }
}

export default function CharacterImage({ stage }: { stage: CharacterStage }) {
  const paths = getStagePaths(stage)
  const [pathIndex, setPathIndex] = useState(0)
  const [useEmoji, setUseEmoji] = useState(false)

  const handleError = () => {
    if (pathIndex < paths.length - 1) {
      setPathIndex(prev => prev + 1)
    } else {
      setUseEmoji(true)
    }
  }

  if (useEmoji) {
    return (
      <div className="w-40 h-40 flex items-center justify-center text-8xl"
        style={{ animation: 'float 3s ease-in-out infinite' }}>
        {FALLBACK_EMOJI[stage.type]}
      </div>
    )
  }

  return (
    <div className="w-40 h-40 flex items-center justify-center">
      <img
        key={paths[pathIndex]}
        src={paths[pathIndex]}
        alt="キャラクター"
        className="w-full h-full object-contain"
        style={{ animation: 'float 3s ease-in-out infinite' }}
        onError={handleError}
      />
    </div>
  )
}
