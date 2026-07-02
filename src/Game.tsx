import { useEffect, useRef, useState } from 'react'

const W = 480
const H = 560
const PX = 3
const COLS = 8
const ROWS = 4
const CELL = 46
const ROWH = 34

/* ---------- classic pixel sprites (2 animation frames each) ---------- */
const SQUID: string[][] = [
  ['...XX...', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '..X..X..', '.X.XX.X.', 'X.X..X.X'],
  ['...XX...', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '.X.XX.X.', 'X......X', '.X....X.'],
]
const CRAB: string[][] = [
  ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'],
  ['..X.....X..', 'X..X...X..X', 'X.XXXXXXX.X', 'XXX.XXX.XXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..X.....X..', '.X.......X.'],
]
const OCTO: string[][] = [
  ['....XXXX....', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXX..XX..XXX', 'XXXXXXXXXXXX', '...XX..XX...', '..XX.XX.XX..', 'XX........XX'],
  ['....XXXX....', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXX..XX..XXX', 'XXXXXXXXXXXX', '..XXX..XXX..', '.XX..XX..XX.', '..XX....XX..'],
]
const SHIP = ['.....X.....', '....XXX....', '....XXX....', '.XXXXXXXXX.', 'XXXXXXXXXXX', 'XXXXXXXXXXX']

const ROW_SPRITES = [SQUID, CRAB, CRAB, OCTO]
const ROW_COLORS = ['#ffcf5c', '#9d7bff', '#9d7bff', '#37e0ff']
const ROW_POINTS = [40, 20, 20, 10]
const ROW_W = [8, 11, 11, 12].map((n) => n * PX)
const SPR_H = 8 * PX
const SHIP_Y = H - 76

type Vec = { x: number; y: number }
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string }

export default function Game({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [muted, setMuted] = useState(false)
  const mutedRef = useRef(false)
  mutedRef.current = muted
  const inputRef = useRef({ left: false, right: false, fire: false })
  const startRef = useRef<() => void>(() => {})
  // Keep the latest onClose without re-running the game engine effect:
  // App re-renders constantly (typewriter), so the prop identity changes every tick.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const canvas = canvasRef.current!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    document.body.style.overflow = 'hidden'

    /* ---------- retro audio (WebAudio, no assets) ---------- */
    let ac: AudioContext | null = null
    const beep = (f0: number, f1: number, dur: number, type: OscillatorType, vol = 0.04) => {
      if (mutedRef.current) return
      try {
        ac = ac || new AudioContext()
        const o = ac.createOscillator()
        const g = ac.createGain()
        o.type = type
        o.frequency.setValueAtTime(f0, ac.currentTime)
        o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), ac.currentTime + dur)
        g.gain.setValueAtTime(vol, ac.currentTime)
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur)
        o.connect(g)
        g.connect(ac.destination)
        o.start()
        o.stop(ac.currentTime + dur)
      } catch {
        /* audio unavailable — play silently */
      }
    }

    /* ---------- game state ---------- */
    const st = {
      mode: 'title' as 'title' | 'playing' | 'over',
      score: 0,
      hi: Number(localStorage.getItem('ag-hiscore') || 0),
      lives: 3,
      wave: 1,
      gridX: 61,
      gridY: 84,
      dir: 1,
      stepTimer: 0,
      stepInterval: 0.6,
      frame: 0,
      alive: [] as boolean[][],
      bullets: [] as Vec[],
      bombs: [] as Vec[],
      bombTimer: 1.2,
      px: W / 2,
      fireCd: 0,
      inv: 0,
      particles: [] as Particle[],
      stars: Array.from({ length: 46 }, (_, i) => ({
        x: (i * 97) % W,
        y: (i * 211) % H,
        s: i % 5 === 0 ? 2 : 1,
        v: 12 + (i % 7) * 6,
      })),
      note: 0,
      time: 0,
    }

    const aliveCount = () => st.alive.flat().filter(Boolean).length

    const resetWave = () => {
      st.alive = Array.from({ length: ROWS }, () => Array(COLS).fill(true))
      st.gridX = 61
      st.gridY = 84
      st.dir = 1
      st.frame = 0
      st.bullets = []
      st.bombs = []
      st.bombTimer = 1.2
      st.stepInterval = Math.max(0.12, 0.6 - (st.wave - 1) * 0.06)
    }

    const start = () => {
      st.mode = 'playing'
      st.score = 0
      st.lives = 3
      st.wave = 1
      st.px = W / 2
      st.inv = 0
      resetWave()
      beep(440, 880, 0.2, 'square', 0.04)
    }
    startRef.current = () => {
      if (st.mode !== 'playing') start()
    }

    const invaderRect = (r: number, c: number) => {
      const w = ROW_W[r]
      return { x: st.gridX + c * CELL + (CELL - w) / 2, y: st.gridY + r * ROWH, w, h: SPR_H }
    }

    const recalcSpeed = () => {
      const n = aliveCount()
      st.stepInterval = Math.max(0.05, 0.12 + 0.48 * (n / (COLS * ROWS)) - (st.wave - 1) * 0.04)
    }

    const boom = (x: number, y: number, color: string, n = 12) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const v = 40 + Math.random() * 180
        st.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.45 + Math.random() * 0.2, color })
      }
    }

    const gameOver = () => {
      st.mode = 'over'
      inputRef.current.left = false
      inputRef.current.right = false
      inputRef.current.fire = false
      if (st.score > st.hi) {
        st.hi = st.score
        localStorage.setItem('ag-hiscore', String(st.hi))
      }
      beep(180, 25, 0.7, 'sawtooth', 0.06)
    }

    /* ---------- update ---------- */
    const update = (dt: number) => {
      st.time += dt
      for (const s of st.stars) {
        s.y += s.v * dt
        if (s.y > H) {
          s.y = 0
          s.x = Math.random() * W
        }
      }
      st.particles = st.particles.filter((p) => (p.life -= dt) > 0)
      for (const p of st.particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt
      }

      if (st.mode !== 'playing') return

      const inp = inputRef.current
      if (inp.left) st.px -= 300 * dt
      if (inp.right) st.px += 300 * dt
      st.px = Math.max(24, Math.min(W - 24, st.px))
      if (st.inv > 0) st.inv -= dt

      st.fireCd -= dt
      if (inp.fire && st.fireCd <= 0 && st.bullets.length < 2) {
        st.bullets.push({ x: st.px - 1.5, y: SHIP_Y - 8 })
        st.fireCd = 0.34
        beep(900, 150, 0.09, 'square', 0.03)
      }

      st.bullets = st.bullets.filter((b) => (b.y -= 500 * dt) > -12)
      st.bombs = st.bombs.filter((b) => (b.y += (170 + st.wave * 18) * dt) < H + 12)

      // marching
      st.stepTimer += dt
      if (st.stepTimer >= st.stepInterval) {
        st.stepTimer = 0
        st.gridX += st.dir * 10
        st.frame ^= 1
        const notes = [55, 49, 44, 41]
        beep(notes[st.note], notes[st.note], 0.07, 'square', 0.05)
        st.note = (st.note + 1) % 4

        let minX = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++) {
            if (!st.alive[r][c]) continue
            const b = invaderRect(r, c)
            minX = Math.min(minX, b.x)
            maxX = Math.max(maxX, b.x + b.w)
            maxY = Math.max(maxY, b.y + b.h)
          }
        if (maxX > W - 10 || minX < 10) {
          st.dir *= -1
          st.gridY += 20
        }
        if (maxY >= SHIP_Y - 4) gameOver()
      }

      // invader bombs
      st.bombTimer -= dt
      if (st.bombTimer <= 0) {
        const shooters: number[] = []
        for (let c = 0; c < COLS; c++)
          for (let r = ROWS - 1; r >= 0; r--)
            if (st.alive[r][c]) {
              shooters.push(r * 100 + c)
              break
            }
        if (shooters.length) {
          const pick = shooters[Math.floor(Math.random() * shooters.length)]
          const b = invaderRect(Math.floor(pick / 100), pick % 100)
          st.bombs.push({ x: b.x + b.w / 2, y: b.y + b.h })
        }
        st.bombTimer = Math.max(0.28, 1.1 - st.wave * 0.09) * (0.6 + Math.random() * 0.8)
      }

      // bullets vs invaders
      outer: for (let bi = st.bullets.length - 1; bi >= 0; bi--) {
        const b = st.bullets[bi]
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++) {
            if (!st.alive[r][c]) continue
            const box = invaderRect(r, c)
            if (b.x + 3 > box.x && b.x < box.x + box.w && b.y < box.y + box.h && b.y + 10 > box.y) {
              st.alive[r][c] = false
              st.score += ROW_POINTS[r]
              boom(box.x + box.w / 2, box.y + box.h / 2, ROW_COLORS[r])
              beep(320, 40, 0.16, 'sawtooth', 0.05)
              st.bullets.splice(bi, 1)
              recalcSpeed()
              continue outer
            }
          }
      }

      // bombs vs player
      if (st.inv <= 0) {
        for (let i = st.bombs.length - 1; i >= 0; i--) {
          const b = st.bombs[i]
          if (b.x > st.px - 17 && b.x < st.px + 17 && b.y + 9 > SHIP_Y && b.y < SHIP_Y + 18) {
            st.bombs.splice(i, 1)
            st.lives--
            boom(st.px, SHIP_Y + 8, '#5cffb1', 20)
            beep(220, 30, 0.5, 'sawtooth', 0.07)
            st.inv = 1.6
            st.px = W / 2
            if (st.lives <= 0) gameOver()
            break
          }
        }
      }

      if (aliveCount() === 0) {
        st.wave++
        st.score += 100
        resetWave()
        beep(440, 880, 0.25, 'square', 0.04)
      }
    }

    /* ---------- draw ---------- */
    const drawSprite = (rows: string[], x: number, y: number, color: string, px = PX) => {
      ctx.fillStyle = color
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r]
        for (let c = 0; c < row.length; c++) if (row[c] === 'X') ctx.fillRect(x + c * px, y + r * px, px, px)
      }
    }
    const text = (s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center') => {
      ctx.fillStyle = color
      ctx.font = `${size}px "Press Start 2P", monospace`
      ctx.textAlign = align
      ctx.fillText(s, x, y)
    }
    const blink = () => Math.floor(st.time * 2) % 2 === 0

    const draw = () => {
      ctx.fillStyle = '#070417'
      ctx.fillRect(0, 0, W, H)
      for (const s of st.stars) {
        ctx.globalAlpha = s.s === 2 ? 0.9 : 0.5
        ctx.fillStyle = '#eae7ff'
        ctx.fillRect(s.x, s.y, s.s, s.s)
      }
      ctx.globalAlpha = 1

      // HUD
      text(`SCORE ${st.score}`, 12, 24, 10, '#eae7ff', 'left')
      text(`HI ${st.hi}`, W / 2, 24, 10, '#ffcf5c')
      text(`WAVE ${st.wave}`, W - 12, 24, 10, '#37e0ff', 'right')
      for (let i = 0; i < st.lives; i++) drawSprite(SHIP, 12 + i * 26, 32, '#5cffb1', 1.6)
      ctx.fillStyle = '#3a2f74'
      ctx.fillRect(0, 48, W, 2)
      ctx.fillRect(0, H - 26, W, 2)

      for (const p of st.particles) {
        ctx.globalAlpha = Math.max(p.life / 0.6, 0)
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, 3, 3)
      }
      ctx.globalAlpha = 1

      if (st.mode === 'title') {
        text('GUZ', W / 2, 140, 30, '#9d7bff')
        text('VADERS', W / 2, 185, 30, '#ff4d8d')
        const cx = W / 2 - 62
        drawSprite(SQUID[0], cx, 232, '#ffcf5c', 2)
        text('= 40 PTS', cx + 44, 248, 9, '#a49fd6', 'left')
        drawSprite(CRAB[0], cx - 3, 272, '#9d7bff', 2)
        text('= 20 PTS', cx + 44, 288, 9, '#a49fd6', 'left')
        drawSprite(OCTO[0], cx - 4, 312, '#37e0ff', 2)
        text('= 10 PTS', cx + 44, 328, 9, '#a49fd6', 'left')
        if (blink()) text('PRESS ENTER TO START', W / 2, 412, 11, '#5cffb1')
        text('ARROWS MOVE - SPACE FIRE - ESC EXIT', W / 2, 452, 8, '#a49fd6')
      } else {
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++) {
            if (!st.alive[r][c]) continue
            const b = invaderRect(r, c)
            drawSprite(ROW_SPRITES[r][st.frame], b.x, b.y, ROW_COLORS[r])
          }
        if (st.mode === 'playing' && (st.inv <= 0 || Math.floor(st.time * 10) % 2 === 0)) {
          drawSprite(SHIP, st.px - 16.5, SHIP_Y, '#5cffb1')
        }
        ctx.fillStyle = '#5cffb1'
        for (const b of st.bullets) ctx.fillRect(b.x, b.y, 3, 10)
        ctx.fillStyle = '#ff4d8d'
        for (const b of st.bombs) ctx.fillRect(b.x - 1.5, b.y, 3, 9)

        if (st.mode === 'over') {
          ctx.fillStyle = 'rgba(7,4,23,0.82)'
          ctx.fillRect(0, 0, W, H)
          text('GAME OVER', W / 2, 205, 26, '#ff4d8d')
          text(`SCORE ${st.score}`, W / 2, 255, 12, '#eae7ff')
          if (st.score >= st.hi && st.score > 0) text('NEW HI-SCORE!', W / 2, 288, 10, '#ffcf5c')
          if (blink()) text('PRESS ENTER TO RESTART', W / 2, 345, 10, '#5cffb1')
          text("LIKE THE SITE? LET'S TALK:", W / 2, 415, 8, '#a49fd6')
          text('ANDYGUZ17@GMAIL.COM', W / 2, 438, 9, '#37e0ff')
        }
      }
    }

    /* ---------- loop + input ---------- */
    let raf = 0
    let last = performance.now()
    const loop = (t: number) => {
      const dt = Math.min(0.033, (t - last) / 1000)
      last = t
      update(dt)
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const down = (e: KeyboardEvent) => {
      if ([' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault()
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') inputRef.current.right = true
      if (e.key === ' ') inputRef.current.fire = true
      if ((e.key === 'Enter' || e.key === ' ') && st.mode !== 'playing') start()
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') inputRef.current.right = false
      if (e.key === ' ') inputRef.current.fire = false
    }
    // Classic stuck-key defense: if the window loses focus mid-press we never
    // receive the keyup, so the ship would keep moving/firing forever.
    const clearInputs = () => {
      inputRef.current.left = false
      inputRef.current.right = false
      inputRef.current.fire = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clearInputs)
    document.addEventListener('visibilitychange', clearInputs)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clearInputs)
      document.removeEventListener('visibilitychange', clearInputs)
      document.body.style.overflow = ''
      ac?.close().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- engine must mount exactly once
  }, [])

  const inp = inputRef.current
  return (
    <div className="game-overlay" role="dialog" aria-label="Guz Vaders minigame">
      <div className="game-bar">
        <button className="btn" onClick={() => setMuted((m) => !m)}>{muted ? 'SOUND: OFF' : 'SOUND: ON'}</button>
        <button className="btn" onClick={onClose}>EXIT (ESC)</button>
      </div>
      <div className="game-frame">
        <canvas ref={canvasRef} />
      </div>
      <div className="game-touch">
        <button
          className="btn"
          onPointerDown={() => (inp.left = true)}
          onPointerUp={() => (inp.left = false)}
          onPointerLeave={() => (inp.left = false)}
        >
          ◀
        </button>
        <button
          className="btn btn-primary"
          onPointerDown={() => {
            inp.fire = true
            startRef.current()
          }}
          onPointerUp={() => (inp.fire = false)}
          onPointerLeave={() => (inp.fire = false)}
        >
          FIRE
        </button>
        <button
          className="btn"
          onPointerDown={() => (inp.right = true)}
          onPointerUp={() => (inp.right = false)}
          onPointerLeave={() => (inp.right = false)}
        >
          ▶
        </button>
      </div>
    </div>
  )
}
