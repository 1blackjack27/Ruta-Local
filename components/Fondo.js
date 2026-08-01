export default function Fondo() {
  const hoja = { position: 'absolute', pointerEvents: 'none', opacity: 0.07 }
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      background: 'linear-gradient(160deg, #F4FBF6 0%, #EDF8F0 100%)',
    }}>
      {/* Monstera arriba izquierda */}
      <svg viewBox="0 0 200 200" style={{ ...hoja, top: -40, left: -40, width: 250, transform: 'rotate(-15deg)' }}>
        <path d="M100 8 C 148 30 172 82 162 124 C 155 156 128 174 100 178 C 72 174 45 156 38 124 C 28 82 52 30 100 8 Z" fill="#0D6B4E" />
        <path d="M100 14 C 96 58 96 118 100 170" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.85" />
        <path d="M100 55 C 84 62 70 62 54 58" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.85" />
        <path d="M100 90 C 84 99 66 103 48 99" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.85" />
        <path d="M100 55 C 116 62 130 62 146 58" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.85" />
        <path d="M100 90 C 116 99 134 103 152 99" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.85" />
      </svg>

      {/* Palma arriba derecha */}
      <svg viewBox="0 0 240 220" style={{ ...hoja, top: -30, right: -30, width: 280, opacity: 0.06, transform: 'rotate(12deg)' }}>
        <path d="M20 205 C 90 170 160 120 225 15" stroke="#1A8C6A" strokeWidth="3" fill="none" />
        <path d="M40 180 L 78 165 L 55 195 Z" fill="#0D6B4E" />
        <path d="M70 150 L 112 132 L 88 164 Z" fill="#1A8C6A" />
        <path d="M102 120 L 148 100 L 122 134 Z" fill="#0D6B4E" />
        <path d="M136 90 L 186 68 L 158 104 Z" fill="#1A8C6A" />
        <path d="M170 60 L 220 38 L 192 74 Z" fill="#0D6B4E" />
        <path d="M45 160 L 55 122 L 75 152 Z" fill="#1A8C6A" />
        <path d="M78 128 L 88 88 L 108 120 Z" fill="#0D6B4E" />
        <path d="M112 96 L 122 56 L 142 88 Z" fill="#1A8C6A" />
        <path d="M146 64 L 156 24 L 176 56 Z" fill="#0D6B4E" />
      </svg>

      {/* Helecho abajo izquierda */}
      <svg viewBox="0 0 240 220" style={{ ...hoja, bottom: -40, left: -40, width: 270, opacity: 0.06, transform: 'rotate(165deg)' }}>
        <path d="M20 205 C 90 170 160 120 225 15" stroke="#0D6B4E" strokeWidth="2.5" fill="none" />
        <path d="M46 180 C 38 166 32 150 28 134 C 42 146 50 162 46 180 Z" fill="#1A8C6A" />
        <path d="M78 148 C 70 134 64 118 60 102 C 74 114 82 130 78 148 Z" fill="#0D6B4E" />
        <path d="M110 116 C 102 102 96 86 92 70 C 106 82 114 98 110 116 Z" fill="#1A8C6A" />
        <path d="M142 84 C 134 70 128 54 124 38 C 138 50 146 66 142 84 Z" fill="#0D6B4E" />
        <path d="M174 52 C 166 38 160 22 156 6 C 170 18 178 34 174 52 Z" fill="#1A8C6A" />
        <path d="M60 158 C 76 166 92 170 108 170 C 94 178 78 180 60 158 Z" fill="#0D6B4E" />
        <path d="M92 126 C 108 134 124 138 140 138 C 126 146 110 148 92 126 Z" fill="#1A8C6A" />
        <path d="M124 94 C 140 102 156 106 172 106 C 158 114 142 116 124 94 Z" fill="#0D6B4E" />
        <path d="M156 62 C 172 70 188 74 204 74 C 190 82 174 84 156 62 Z" fill="#1A8C6A" />
      </svg>

      {/* Hoja tropical abajo derecha */}
      <svg viewBox="0 0 220 200" style={{ ...hoja, bottom: -30, right: -30, width: 260, opacity: 0.06, transform: 'rotate(-15deg)' }}>
        <path d="M30 170 C 30 110 60 55 120 20 C 160 45 185 95 178 140 C 172 172 140 190 100 190 C 60 190 40 180 30 170 Z" fill="#0D6B4E" />
        <path d="M50 165 C 60 115 90 70 120 35" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.7" />
        <path d="M70 150 C 84 140 100 138 118 142" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.7" />
        <path d="M90 120 C 104 110 120 108 138 112" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.7" />
      </svg>

      {/* Hoja pequeña borde medio izquierdo */}
      <svg viewBox="0 0 120 140" style={{ ...hoja, top: '45%', left: -20, width: 130, opacity: 0.05, transform: 'rotate(-40deg)' }}>
        <path d="M60 8 C 95 30 108 75 100 110 C 95 130 25 130 20 110 C 12 75 25 30 60 8 Z" fill="#1A8C6A" />
        <path d="M60 14 C 58 50 58 90 60 122" stroke="#F4FBF6" strokeWidth="2" fill="none" strokeOpacity="0.8" />
      </svg>
    </div>
  )
}
