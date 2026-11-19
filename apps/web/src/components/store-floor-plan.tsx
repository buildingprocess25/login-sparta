import { cn } from "@/lib/utils"

type StoreFloorPlanProps = {
  className?: string
}

const columnAxes = [
  { id: "A", x: 80 },
  { id: "B", x: 340 },
  { id: "C", x: 600 },
  { id: "D", x: 860 },
  { id: "E", x: 1120 },
]

const rowAxes = [
  { id: "1", y: 80 },
  { id: "2", y: 380 },
  { id: "3", y: 680 },
]

const gondolas = [200, 320, 440, 560, 680]

/**
 * Denah toko bergaya gambar kerja (tampak atas) untuk latar halaman login.
 * Dekoratif: warna mengikuti currentColor, disembunyikan dari screen reader.
 */
function StoreFloorPlan({ className }: StoreFloorPlanProps) {
  return (
    <svg
      viewBox="0 0 1200 760"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
    >
      {/* Sumbu grid */}
      <g strokeWidth="1" strokeDasharray="14 6 3 6" opacity="0.6">
        {columnAxes.map((axis) => (
          <path key={axis.id} d={`M${axis.x} 58V702`} />
        ))}
        {rowAxes.map((axis) => (
          <path key={axis.id} d={`M58 ${axis.y}H1142`} />
        ))}
      </g>
      <g strokeWidth="1.25">
        {columnAxes.map((axis) => (
          <g key={axis.id}>
            <circle cx={axis.x} cy="38" r="16" />
            <text
              x={axis.x}
              y="44"
              textAnchor="middle"
              fontSize="16"
              fill="currentColor"
              stroke="none"
            >
              {axis.id}
            </text>
          </g>
        ))}
        {rowAxes.map((axis) => (
          <g key={axis.id}>
            <circle cx="38" cy={axis.y} r="16" />
            <text
              x="38"
              y={axis.y + 6}
              textAnchor="middle"
              fontSize="16"
              fill="currentColor"
              stroke="none"
            >
              {axis.id}
            </text>
          </g>
        ))}
      </g>

      {/* Dinding luar (dua garis) dengan bukaan pintu depan */}
      <g strokeWidth="3">
        <path d="M520 680H80V80H1120V680H640" />
        <path d="M520 668H92V92H1108V668H640" strokeWidth="1.5" />
        <path d="M520 668V680M640 668V680" strokeWidth="1.5" />
      </g>

      {/* Pintu depan ganda dengan busur bukaan */}
      <g strokeWidth="1.5">
        <path d="M520 680V620" />
        <path d="M640 680V620" />
        <path d="M520 620A60 60 0 0 1 580 680" strokeDasharray="5 5" />
        <path d="M640 620A60 60 0 0 0 580 680" strokeDasharray="5 5" />
      </g>

      {/* Rak dinding kiri */}
      <g strokeWidth="1.25">
        <rect x="100" y="110" width="30" height="540" />
        {Array.from({ length: 8 }, (_, index) => (
          <path key={index} d={`M100 ${170 + index * 60}H130`} />
        ))}
      </g>

      {/* Gondola dua sisi */}
      <g strokeWidth="1.25">
        {gondolas.map((x) => (
          <g key={x}>
            <rect x={x} y="160" width="44" height="300" />
            <path d={`M${x + 22} 160V460`} />
            {[220, 280, 340, 400].map((y) => (
              <path key={y} d={`M${x} ${y}H${x + 44}`} />
            ))}
          </g>
        ))}
      </g>

      {/* Meja kasir */}
      <g strokeWidth="1.5">
        <path d="M700 560H880V620H840V590H700Z" />
        <rect x="716" y="566" width="40" height="18" />
        <rect x="776" y="566" width="40" height="18" />
      </g>

      {/* Gudang dan toilet */}
      <g strokeWidth="2.5">
        <path d="M900 92V360M900 420V430H1108" />
        <path d="M1000 92V200H1030M1080 200H1108" />
      </g>
      <g strokeWidth="1.25" strokeDasharray="5 5">
        <path d="M900 360A60 60 0 0 1 960 420" />
        <path d="M1030 200A50 50 0 0 0 1080 250" />
      </g>
      <g strokeWidth="1.25">
        <path d="M900 360L960 360" />
        <path d="M1030 200V250" />
        <rect x="920" y="120" width="60" height="60" />
        <path d="M920 120L980 180M980 120L920 180" />
        <rect x="920" y="200" width="60" height="60" />
        <path d="M920 200L980 260M980 200L920 260" />
      </g>

      {/* Chiller di dinding kanan */}
      <g strokeWidth="1.25">
        <rect x="1060" y="450" width="40" height="200" />
        {[500, 550, 600].map((y) => (
          <path key={y} d={`M1060 ${y}H1100`} />
        ))}
      </g>

      {/* Unit AC dalam (plafon, garis putus) */}
      <g strokeWidth="1.25" strokeDasharray="8 5">
        <rect x="280" y="104" width="100" height="26" />
        <rect x="620" y="104" width="100" height="26" />
      </g>

      {/* Garis ukur bawah */}
      <g strokeWidth="1">
        <path d="M80 740H1120" />
        {columnAxes.map((axis) => (
          <path
            key={axis.id}
            d={`M${axis.x} 730V750M${axis.x - 6} 746L${axis.x + 6} 734`}
          />
        ))}
      </g>
    </svg>
  )
}

export { StoreFloorPlan }
