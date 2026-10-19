import { useEffect, useRef, useState } from 'react'
import './App.css'

const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
const STRINGS = [1, 2, 3, 4, 5, 6] as const
const ROUND_SECONDS = 30

type Level = 1 | 2
type TimerState = 'ready' | 'running' | 'finished'
type NotePair = {
  note: (typeof NOTES)[number]
  string: (typeof STRINGS)[number]
}

function createDraw(): NotePair[] {
  const pairs = NOTES.flatMap((note) =>
    STRINGS.map((string) => ({ note, string })),
  )

  for (let index = pairs.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[pairs[index], pairs[randomIndex]] = [pairs[randomIndex], pairs[index]]
  }

  return pairs.slice(0, 10)
}

function App() {
  const [level, setLevel] = useState<Level>(1)
  const [draw, setDraw] = useState(createDraw)
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)
  const [timerState, setTimerState] = useState<TimerState>('ready')
  const endTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (timerState !== 'running') return

    const updateTimer = () => {
      if (endTimeRef.current === null) return

      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000),
      )
      setSecondsLeft(remaining)

      if (remaining === 0) {
        setTimerState('finished')
        endTimeRef.current = null
      }
    }

    updateTimer()
    const intervalId = window.setInterval(updateTimer, 200)
    return () => window.clearInterval(intervalId)
  }, [timerState])

  const resetTimer = () => {
    endTimeRef.current = null
    setTimerState('ready')
    setSecondsLeft(ROUND_SECONDS)
  }

  const selectLevel = (nextLevel: Level) => {
    setLevel(nextLevel)
    resetTimer()
  }

  const generateDraw = () => {
    setDraw(createDraw())
    resetTimer()
  }

  const startTimer = () => {
    endTimeRef.current = Date.now() + ROUND_SECONDS * 1000
    setSecondsLeft(ROUND_SECONDS)
    setTimerState('running')
  }

  const timerLabel =
    timerState === 'running'
      ? 'Reiniciar 30 s'
      : timerState === 'finished'
        ? 'Intentar de nuevo'
        : 'Empezar 30 s'

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-string" />
          <span className="brand-string" />
          <span className="brand-string" />
          <span className="brand-string" />
          <span className="brand-string" />
          <span className="brand-string" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Entrenamiento de diapasón</p>
          <h1>Diez notas en treinta segundos</h1>
          <p className="subtitle">
            Encuentra cada nota en la cuerda indicada. Precisión primero;
            velocidad después.
          </p>
        </div>
      </header>

      <section className="level-panel" aria-labelledby="level-heading">
        <div className="section-heading">
          <div>
            <p className="step-label">Elige tu práctica</p>
            <h2 id="level-heading">Nivel {level}</h2>
          </div>
          <div className="level-tabs" aria-label="Nivel de práctica">
            <button
              className={level === 1 ? 'level-tab active' : 'level-tab'}
              type="button"
              aria-pressed={level === 1}
              onClick={() => selectLevel(1)}
            >
              <span>Nivel 1</span>
              <small>Sin reloj</small>
            </button>
            <button
              className={level === 2 ? 'level-tab active' : 'level-tab'}
              type="button"
              aria-pressed={level === 2}
              onClick={() => selectLevel(2)}
            >
              <span>Nivel 2</span>
              <small>30 segundos</small>
            </button>
          </div>
        </div>

        <div className="instruction-card">
          <span className="instruction-icon" aria-hidden="true">
            {level === 1 ? '01' : '02'}
          </span>
          <div>
            <h3>{level === 1 ? 'Construye una base precisa' : 'Añade velocidad'}</h3>
            {level === 1 ? (
              <p>
                Localiza las diez notas <strong>sin errores</strong>. Parte de una
                nota ancla y cuenta los trastes en voz alta hasta llegar a cada
                objetivo.
              </p>
            ) : (
              <p>
                Pulsa empezar y localiza las diez notas antes de que termine el
                tiempo. Como guía, pasa a este nivel tras completar el nivel 1
                sin errores durante tres días consecutivos.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="practice-panel" aria-labelledby="draw-heading">
        <div className="practice-header">
          <div>
            <p className="step-label">Tu recorrido</p>
            <h2 id="draw-heading">10 notas · 10 posiciones</h2>
          </div>

          {level === 2 && (
            <div
              className={`timer ${timerState}`}
              role="timer"
              aria-live={timerState === 'finished' ? 'assertive' : 'off'}
              aria-label={
                timerState === 'finished'
                  ? 'Tiempo terminado'
                  : `${secondsLeft} segundos restantes`
              }
            >
              <span className="timer-value">
                0:{secondsLeft.toString().padStart(2, '0')}
              </span>
              <span className="timer-status">
                {timerState === 'ready'
                  ? 'Preparado'
                  : timerState === 'running'
                    ? 'En marcha'
                    : 'Tiempo terminado'}
              </span>
            </div>
          )}
        </div>

        <ol className="note-grid" aria-label="Notas para localizar">
          {draw.map((pair, index) => (
            <li className="note-card" key={`${pair.note}-${pair.string}`}>
              <span className="note-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="note-letter" aria-label={`Nota ${pair.note}`}>
                {pair.note}
              </span>
              <span className="string-label">cuerda {pair.string}.ª</span>
            </li>
          ))}
        </ol>

        {level === 2 && timerState === 'finished' && (
          <p className="finished-message" role="status">
            Tiempo terminado. Respira, revisa la precisión y vuelve a intentarlo.
          </p>
        )}

        <div className="actions">
          {level === 2 && (
            <button className="primary-button" type="button" onClick={startTimer}>
              <span aria-hidden="true">{timerState === 'running' ? '↻' : '▶'}</span>
              {timerLabel}
            </button>
          )}
          <button
            className={level === 1 ? 'primary-button' : 'secondary-button'}
            type="button"
            onClick={generateDraw}
          >
            <span aria-hidden="true">↻</span>
            Nueva tirada
          </button>
        </div>
      </section>

      <footer>
        <p>Sin puntuaciones. Sin presión. Solo práctica consciente.</p>
      </footer>
    </main>
  )
}

export default App
