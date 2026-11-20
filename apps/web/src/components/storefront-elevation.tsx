import { createContext, useContext, type CSSProperties } from "react"

import alfamartLogo from "@/assets/alfamart-logo.png"
import { cn } from "@/lib/utils"

type StorefrontElevationProps = {
  className?: string
  /** Label gambar di bawah, mengikuti konvensi judul gambar kerja. */
  label?: string
  /** Tampilkan keterangan modul SPARTA di sisi kanan gambar. */
  annotated?: boolean
  /** Animasikan garis seperti sedang digambar (sekali saat muncul). */
  animated?: boolean
  /** Cara gambar mengisi wadah, misal "xMidYMid slice" untuk potongan detail. */
  preserveAspectRatio?: string
}

type Callout = {
  title: string
  detail: string
  /** Titik pada bangunan yang ditunjuk. */
  from: [number, number]
  /** Tinggi baris label. */
  y: number
}

/* Hanya modul yang memang mengurus bagian toko ini (lihat deskripsi modul). */
const callouts: Callout[] = [
  {
    title: "Energy",
    detail: "AC dan lampu toko",
    from: [612, 99],
    y: 99,
  },
  {
    title: "Building",
    detail: "Pembangunan toko",
    from: [680, 250],
    y: 230,
  },
  {
    title: "Maintenance",
    detail: "Perbaikan toko",
    from: [600, 330],
    y: 345,
  },
]

const axes = [
  { id: "1", x: 120 },
  { id: "2", x: 280 },
  { id: "3", x: 520 },
  { id: "4", x: 680 },
]

const line = (x1: number, y1: number, x2: number, y2: number) =>
  `M${x1} ${y1}L${x2} ${y2}`
const rect = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h${-w}Z`
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`

function delay(seconds: number) {
  return { "--sketch-delay": `${seconds}s` } as CSSProperties
}

const SketchAnimated = createContext(false)

/** Satu garis gambar; saat animasi aktif, garis "digambar" sesuai urutan `at`. */
function Stroke({
  d,
  at,
  width = 1.25,
}: {
  d: string
  at: number
  width?: number
}) {
  const animated = useContext(SketchAnimated)

  return (
    <path
      d={d}
      pathLength={1}
      strokeWidth={width}
      className={animated ? "sketch-draw" : undefined}
      style={delay(at)}
    />
  )
}

/**
 * Gambar tampak depan toko bergaya gambar kerja arsitektur. Dekoratif, jadi
 * disembunyikan dari screen reader.
 */
function StorefrontElevation({
  className,
  label = "Tampak depan",
  annotated = false,
  animated = false,
  preserveAspectRatio = "xMinYMid meet",
}: StorefrontElevationProps) {
  const fadeClass = animated ? "sketch-fade" : undefined

  return (
    <SketchAnimated.Provider value={animated}>
      <svg
        // viewBox dipotong rapat ke isi gambar agar tepi kiri sejajar dengan teks.
        viewBox={annotated ? "48 24 944 444" : "48 24 700 444"}
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden="true"
        focusable="false"
        className={cn(className)}
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
      >
        {/* Sumbu grid struktur */}
        <g opacity="0.4">
          <g className={fadeClass} style={delay(0.2)}>
            {axes.map((axis) => (
              <path
                key={axis.id}
                d={line(axis.x, 58, axis.x, 392)}
                strokeWidth="0.75"
                strokeDasharray="10 4 2 4"
              />
            ))}
          </g>
        </g>
        {axes.map((axis, index) => (
          <g key={axis.id}>
            <Stroke
              d={circle(axis.x, 42, 14)}
              at={0.1 + index * 0.08}
              width={1}
            />
            <text
              x={axis.x}
              y="47"
              textAnchor="middle"
              fontSize="13"
              fill="currentColor"
              stroke="none"
              className={fadeClass}
              style={delay(0.4 + index * 0.08)}
            >
              {axis.id}
            </text>
          </g>
        ))}

        {/* Muka tanah dan arsiran */}
        <Stroke d={line(56, 380, 744, 380)} at={0} width={2.5} />
        <g opacity="0.5">
          <g className={fadeClass} style={delay(0.5)}>
            {Array.from({ length: 22 }, (_, index) => {
              const x = 64 + index * 31
              return (
                <path
                  key={x}
                  d={line(x, 382, x - 10, 394)}
                  strokeWidth="0.75"
                />
              )
            })}
          </g>
        </g>

        {/* Badan bangunan, parapet, kolom */}
        <Stroke d={line(120, 142, 120, 380)} at={0.15} width={1.5} />
        <Stroke d={line(680, 142, 680, 380)} at={0.15} width={1.5} />
        <Stroke d={line(150, 204, 150, 380)} at={0.3} width={1.5} />
        <Stroke d={line(650, 204, 650, 380)} at={0.3} width={1.5} />
        <Stroke d={rect(112, 112, 576, 30)} at={0.3} width={1.5} />

        {/* Unit AC luar di atap */}
        {[188, 562].map((x, index) => (
          <g key={x}>
            <Stroke d={rect(x, 76, 64, 36)} at={0.9 + index * 0.1} />
            <Stroke d={circle(x + 22, 94, 11)} at={1 + index * 0.1} width={1} />
            <Stroke
              d={`${line(x + 42, 86, x + 56, 86)}${line(x + 42, 94, x + 56, 94)}${line(x + 42, 102, x + 56, 102)}`}
              at={1.05 + index * 0.1}
              width={1}
            />
          </g>
        ))}

        {/* Papan fascia: merah dan kuning dengan emblem logo Alfamart di tengah */}
        <g className={fadeClass} style={delay(1.2)}>
          <rect
            x="120"
            y="142"
            width="560"
            height="38"
            className="fill-fascia-red"
            stroke="none"
          />
          <rect
            x="120"
            y="180"
            width="560"
            height="14"
            className="fill-fascia-yellow"
            stroke="none"
          />
        </g>
        <Stroke d={rect(120, 142, 560, 52)} at={0.45} width={1.5} />

        {/* Papan nama Alfamart di tengah fascia: rangka digambar, lalu logo muncul */}
        <rect
          x="332"
          y="147"
          width="136"
          height="42"
          rx="4"
          fill="#ffffff"
          stroke="none"
          className={fadeClass}
          style={delay(1.25)}
        />
        <image
          href={alfamartLogo}
          x="342"
          y="151"
          width="116"
          height="34"
          preserveAspectRatio="xMidYMid meet"
          className={fadeClass}
          style={delay(1.3)}
        />
        <Stroke d={rect(332, 147, 136, 42)} at={0.62} width={1} />

        {/* Kanopi */}
        <Stroke
          d={`${line(104, 194, 104, 204)}${line(104, 204, 696, 204)}${line(696, 204, 696, 194)}`}
          at={0.55}
        />

        {/* Etalase kaca, pintu, lampu */}
        <Stroke d={rect(150, 222, 500, 158)} at={0.6} />
        <Stroke d={line(150, 244, 650, 244)} at={0.7} />
        {[250, 350, 400, 450, 550].map((x, index) => (
          <Stroke
            key={x}
            d={line(x, x === 400 ? 244 : 222, x, 380)}
            at={0.75 + index * 0.05}
          />
        ))}
        <Stroke d={line(388, 296, 388, 330)} at={1} width={2.5} />
        <Stroke d={line(412, 296, 412, 330)} at={1} width={2.5} />
        {[200, 300, 500, 600].map((x, index) => (
          <Stroke
            key={x}
            d={`${line(x, 244, x, 252)}M${x - 9} 252a9 7 0 0 0 18 0Z`}
            at={1.05 + index * 0.05}
            width={1}
          />
        ))}
        <g opacity="0.4">
          <g className={fadeClass} style={delay(1.1)}>
            <path d={line(170, 360, 215, 268)} strokeWidth="0.75" />
            <path d={line(186, 364, 226, 282)} strokeWidth="0.75" />
            <path d={line(570, 360, 615, 268)} strokeWidth="0.75" />
            <path d={line(586, 364, 626, 282)} strokeWidth="0.75" />
          </g>
        </g>

        {/* Penanda level */}
        <Stroke
          d={`M64 380l8 -12h-16z${line(56, 368, 96, 368)}`}
          at={0.2}
          width={1}
        />
        <Stroke
          d={`M64 112l8 -12h-16z${line(56, 100, 96, 100)}`}
          at={0.35}
          width={1}
        />

        {/* Garis ukur */}
        <Stroke d={line(120, 420, 680, 420)} at={1.1} width={0.9} />
        {[120, 280, 520, 680].map((x, index) => (
          <Stroke
            key={x}
            d={`${line(x, 410, x, 430)}${line(x - 5, 425, x + 5, 415)}`}
            at={1.15 + index * 0.05}
            width={1.25}
          />
        ))}

        {/* Judul gambar (dilewati jika label kosong) */}
        {label ? (
          <g className={fadeClass} style={delay(1.4)}>
            <text
              x="120"
              y="458"
              fontSize="13"
              fontWeight="600"
              letterSpacing="1.5"
              fill="currentColor"
              stroke="none"
              style={{ textTransform: "uppercase" }}
            >
              {label}
            </text>
            <path d={line(120, 464, 260, 464)} strokeWidth="1" />
          </g>
        ) : null}

        {/* Keterangan modul */}
        {annotated
          ? callouts.map((callout, index) => {
              const [fx, fy] = callout.from
              const at = 1.5 + index * 0.15

              return (
                <g key={callout.title}>
                  <circle
                    cx={fx}
                    cy={fy}
                    r="4"
                    fill="currentColor"
                    stroke="none"
                    className={fadeClass}
                    style={delay(at)}
                  />
                  <Stroke
                    d={`M${fx} ${fy}L${fx + 40} ${callout.y}L766 ${callout.y}`}
                    at={at}
                    width={1}
                  />
                  <g className={fadeClass} style={delay(at + 0.2)}>
                    <text
                      x="778"
                      y={callout.y - 8}
                      fontSize="24"
                      fontWeight="600"
                      fill="currentColor"
                      stroke="none"
                    >
                      {callout.title}
                    </text>
                    <text
                      x="778"
                      y={callout.y + 22}
                      fontSize="19"
                      fill="currentColor"
                      stroke="none"
                      opacity="0.75"
                    >
                      {callout.detail}
                    </text>
                  </g>
                </g>
              )
            })
          : null}
      </svg>
    </SketchAnimated.Provider>
  )
}

export { StorefrontElevation }
