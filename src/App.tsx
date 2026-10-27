import { useEffect, useRef, useState } from 'react'
import './App.css'

const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
const STRINGS = [1, 2, 3, 4, 5, 6] as const
const STRING_ORDER = [6, 5, 4, 3, 2, 1] as const
const ROUND_SECONDS = 30

type GameMode = 'random-10' | 'by-string'
type Level = 1 | 2
type TimerState = 'ready' | 'running' | 'finished'
type Note = (typeof NOTES)[number]
type StringNumber = (typeof STRINGS)[number]

type NotePair = {
  note: Note
  string: StringNumber
}

const STRING_INFO: Record<
  StringNumber,
  { name: string; tuning: string; noteName: string }
> = {
  6: { name: '6.ª', tuning: 'E', noteName: 'Mi grave' },
  5: { name: '5.ª', tuning: 'A', noteName: 'La' },
  4: { name: '4.ª', tuning: 'D', noteName: 'Re' },
  3: { name: '3.ª', tuning: 'G', noteName: 'Sol' },
  2: { name: '2.ª', tuning: 'B', noteName: 'Si' },
  1: { name: '1.ª', tuning: 'E', noteName: 'Mi agudo' },
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }
  return result
}

function createRandomDraw(): NotePair[] {
  const pairs = NOTES.flatMap((note) =>
    STRINGS.map((string) => ({ note, string })),
  )
  return shuffleArray(pairs).slice(0, 10)
}

function createStringDraw(stringNumber: StringNumber): NotePair[] {
  const shuffledNotes = shuffleArray(NOTES)
  return shuffledNotes.map((note) => ({ note, string: stringNumber }))
}

function createAllStringDraws(): Record<StringNumber, NotePair[]> {
  return {
    6: createStringDraw(6),
    5: createStringDraw(5),
    4: createStringDraw(4),
    3: createStringDraw(3),
    2: createStringDraw(2),
    1: createStringDraw(1),
  }
}

function App() {
  const [mode, setMode] = useState<GameMode>('random-10')
  const [level, setLevel] = useState<Level>(1)
  const [randomDraw, setRandomDraw] = useState<NotePair[]>(createRandomDraw)
  const [stringDraws, setStringDraws] = useState<
    Record<StringNumber, NotePair[]>
  >(createAllStringDraws)
  const [currentStringIndex, setCurrentStringIndex] = useState<number>(0)
  const [completedStrings, setCompletedStrings] = useState<Set<StringNumber>>(
    () => new Set(),
  )
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false)
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

  const selectMode = (nextMode: GameMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    resetTimer()
    if (nextMode === 'by-string') {
      setCurrentStringIndex(0)
      setCompletedStrings(new Set())
      setRoundCompleted(false)
      setStringDraws(createAllStringDraws())
    } else {
      setRandomDraw(createRandomDraw())
    }
  }

  const selectLevel = (nextLevel: Level) => {
    setLevel(nextLevel)
    resetTimer()
  }

  const generateNewDraw = () => {
    if (mode === 'random-10') {
      setRandomDraw(createRandomDraw())
    } else {
      handleShuffleCurrentString()
    }
    resetTimer()
  }

  const handleNextString = () => {
    if (currentStringIndex < STRING_ORDER.length - 1) {
      const activeString = STRING_ORDER[currentStringIndex]
      setCompletedStrings((prev) => new Set(prev).add(activeString))
      setCurrentStringIndex((prev) => prev + 1)
      setRoundCompleted(false)
      resetTimer()
    }
  }

  const handlePrevString = () => {
    if (currentStringIndex > 0) {
      setCurrentStringIndex((prev) => prev - 1)
      setRoundCompleted(false)
      resetTimer()
    }
  }

  const handleCompleteRound = () => {
    const activeString = STRING_ORDER[currentStringIndex]
    setCompletedStrings((prev) => new Set(prev).add(activeString))
    setRoundCompleted(true)
    resetTimer()
  }

  const handleRestartByStringRound = () => {
    setStringDraws(createAllStringDraws())
    setCurrentStringIndex(0)
    setCompletedStrings(new Set())
    setRoundCompleted(false)
    resetTimer()
  }

  const handleShuffleCurrentString = () => {
    const activeString = STRING_ORDER[currentStringIndex]
    setStringDraws((prev) => ({
      ...prev,
      [activeString]: createStringDraw(activeString),
    }))
    resetTimer()
  }

  const handleSelectStringDirectly = (index: number) => {
    setCurrentStringIndex(index)
    setRoundCompleted(false)
    resetTimer()
  }

  const startTimer = () => {
    endTimeRef.current = Date.now() + ROUND_SECONDS * 1000
    setSecondsLeft(ROUND_SECONDS)
    setTimerState('running')
  }

  const currentString = STRING_ORDER[currentStringIndex]
  const activeDraw =
    mode === 'random-10' ? randomDraw : stringDraws[currentString]

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
            {mode === 'random-10'
              ? 'Encuentra cada nota en la cuerda indicada. Precisión primero; velocidad después.'
              : 'Encuentra las 7 notas naturales cuerda por cuerda, desde la 6.ª (E) hasta la 1.ª (E). Precisión primero; velocidad después.'}
          </p>
        </div>
      </header>

      <section className="level-panel" aria-labelledby="practice-heading">
        <div className="practice-selectors">
          <div className="selector-group">
            <p className="step-label" id="mode-heading">
              Modo de juego
            </p>
            <div
              className="mode-tabs"
              role="tablist"
              aria-labelledby="mode-heading"
            >
              <button
                className={mode === 'random-10' ? 'mode-tab active' : 'mode-tab'}
                type="button"
                role="tab"
                aria-selected={mode === 'random-10'}
                onClick={() => selectMode('random-10')}
              >
                <span>10 notas al azar</span>
                <small>Todas las cuerdas</small>
              </button>
              <button
                className={mode === 'by-string' ? 'mode-tab active' : 'mode-tab'}
                type="button"
                role="tab"
                aria-selected={mode === 'by-string'}
                onClick={() => selectMode('by-string')}
              >
                <span>7 notas por cuerda</span>
                <small>De 6.ª (E) a 1.ª (E)</small>
              </button>
            </div>
          </div>

          <div className="selector-group">
            <p className="step-label" id="practice-heading">
              Nivel de práctica
            </p>
            <div
              className="level-tabs"
              role="tablist"
              aria-labelledby="practice-heading"
            >
              <button
                className={level === 1 ? 'level-tab active' : 'level-tab'}
                type="button"
                role="tab"
                aria-selected={level === 1}
                onClick={() => selectLevel(1)}
              >
                <span>Nivel 1</span>
                <small>Sin reloj</small>
              </button>
              <button
                className={level === 2 ? 'level-tab active' : 'level-tab'}
                type="button"
                role="tab"
                aria-selected={level === 2}
                onClick={() => selectLevel(2)}
              >
                <span>Nivel 2</span>
                <small>30 segundos</small>
              </button>
            </div>
          </div>
        </div>

        <div className="instruction-card">
          <span className="instruction-icon" aria-hidden="true">
            {level === 1 ? '01' : '02'}
          </span>
          <div>
            <h3>
              {mode === 'random-10'
                ? level === 1
                  ? 'Construye una base precisa'
                  : 'Añade velocidad'
                : level === 1
                  ? 'Domina cada cuerda a tu ritmo'
                  : 'Velocidad por cuerda (30 segundos)'}
            </h3>
            {mode === 'random-10' ? (
              level === 1 ? (
                <p>
                  Localiza las diez notas <strong>sin errores</strong>. Parte de
                  una nota ancla y cuenta los trastes en voz alta hasta llegar a
                  cada objetivo.
                </p>
              ) : (
                <p>
                  Pulsa empezar y localiza las diez notas antes de que termine el
                  tiempo. Como guía, pasa a este nivel tras completar el nivel 1
                  sin errores durante tres días consecutivos.
                </p>
              )
            ) : level === 1 ? (
              <p>
                Localiza las 7 notas naturales en la cuerda activa{' '}
                <strong>sin límite de tiempo</strong>. Comienza en la 6.ª cuerda
                (E) y avanza cuerda por cuerda hasta llegar a la 1.ª (E).
              </p>
            ) : (
              <p>
                Pulsa empezar y localiza las 7 notas de la cuerda actual antes de
                que termine el tiempo (<strong>30 segundos por cuerda</strong>).
                Al avanzar a la siguiente cuerda dispondrás de una nueva cuenta
                regresiva.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="practice-panel" aria-labelledby="draw-heading">
        <div className="practice-header">
          <div>
            <p className="step-label">
              {mode === 'random-10'
                ? 'Tu recorrido'
                : `Cuerda ${currentStringIndex + 1} de ${STRING_ORDER.length} · De 6.ª (E) a 1.ª (E)`}
            </p>
            <h2 id="draw-heading">
              {mode === 'random-10'
                ? '10 notas · 10 posiciones'
                : `Cuerda ${currentString}.ª (${STRING_INFO[currentString].tuning} - ${STRING_INFO[currentString].noteName}) · 7 notas`}
            </h2>
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

        {mode === 'by-string' && (
          <nav
            className="string-stepper-wrapper"
            aria-label="Progreso por cuerdas"
          >
            <div
              className="string-stepper"
              role="tablist"
              aria-label="Seleccionar cuerda de práctica"
            >
              {STRING_ORDER.map((strNum, idx) => {
                const isActive = idx === currentStringIndex
                const isCompleted = completedStrings.has(strNum)
                return (
                  <button
                    key={strNum}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`string-step-pill ${isActive ? 'active' : ''} ${
                      isCompleted ? 'completed' : ''
                    }`}
                    onClick={() => handleSelectStringDirectly(idx)}
                    title={`Cuerda ${strNum}.ª (${STRING_INFO[strNum].tuning})`}
                  >
                    <span className="step-str-number">{strNum}.ª</span>
                    <span className="step-str-tuning">
                      ({STRING_INFO[strNum].tuning})
                    </span>
                    {isCompleted && (
                      <span className="step-check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </nav>
        )}

        <ol
          className={`note-grid ${mode === 'by-string' ? 'seven-notes' : ''}`}
          aria-label={
            mode === 'random-10'
              ? 'Diez notas para localizar'
              : `Siete notas de la cuerda ${currentString}.ª`
          }
        >
          {activeDraw.map((pair, index) => (
            <li
              className="note-card"
              key={`${pair.note}-${pair.string}-${index}`}
            >
              <span className="note-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="note-letter" aria-label={`Nota ${pair.note}`}>
                {pair.note}
              </span>
              <span className="string-label">
                cuerda {pair.string}.ª
                {mode === 'by-string' &&
                  ` (${STRING_INFO[pair.string].tuning})`}
              </span>
            </li>
          ))}
        </ol>

        {level === 2 && timerState === 'finished' && (
          <p className="finished-message" role="status">
            {mode === 'random-10'
              ? 'Tiempo terminado. Respira, revisa la precisión y vuelve a intentarlo.'
              : `Tiempo terminado en la cuerda ${currentString}.ª (${STRING_INFO[currentString].tuning}). Respira, revisa la precisión y vuelve a intentarlo o avanza a la siguiente cuerda.`}
          </p>
        )}

        {roundCompleted && mode === 'by-string' && (
          <div className="completion-banner" role="status">
            <h3>¡Ronda completada con éxito! 🎉</h3>
            <p>
              Has recorrido las 7 notas naturales a lo largo de las 6 cuerdas,
              desde la 6.ª (E) hasta la 1.ª (E).
            </p>
            <div className="completion-actions">
              <button
                className="primary-button"
                type="button"
                onClick={handleRestartByStringRound}
              >
                <span aria-hidden="true">↺</span>
                Comenzar nueva ronda (desde 6.ª)
              </button>
            </div>
          </div>
        )}

        <div className="actions">
          {level === 2 && (
            <button
              className="primary-button"
              type="button"
              onClick={startTimer}
            >
              <span aria-hidden="true">
                {timerState === 'running' ? '↻' : '▶'}
              </span>
              {timerLabel}
            </button>
          )}

          {mode === 'random-10' ? (
            <button
              className={level === 1 ? 'primary-button' : 'secondary-button'}
              type="button"
              onClick={generateNewDraw}
            >
              <span aria-hidden="true">↻</span>
              Nueva tirada
            </button>
          ) : (
            <>
              {currentStringIndex > 0 && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handlePrevString}
                >
                  <span aria-hidden="true">←</span>
                  Cuerda anterior
                </button>
              )}

              {currentStringIndex < STRING_ORDER.length - 1 ? (
                <button
                  className={
                    level === 1 ? 'primary-button' : 'secondary-button'
                  }
                  type="button"
                  onClick={handleNextString}
                >
                  Siguiente cuerda ({STRING_ORDER[currentStringIndex + 1]}.ª)
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                !roundCompleted && (
                  <button
                    className={
                      level === 1 ? 'primary-button' : 'secondary-button'
                    }
                    type="button"
                    onClick={handleCompleteRound}
                  >
                    <span aria-hidden="true">✓</span>
                    Finalizar ronda (1.ª cuerda)
                  </button>
                )
              )}

              <button
                className="secondary-button"
                type="button"
                onClick={handleShuffleCurrentString}
                title="Generar otro orden de notas para esta cuerda"
              >
                <span aria-hidden="true">↻</span>
                Barajar esta cuerda
              </button>

              {(currentStringIndex > 0 || roundCompleted) && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleRestartByStringRound}
                  title="Reiniciar ronda desde la 6.ª cuerda con nuevas notas"
                >
                  <span aria-hidden="true">↺</span>
                  Reiniciar desde 6.ª
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <footer>
        <p>Sin puntuaciones. Sin presión. Solo práctica consciente.</p>
      </footer>
    </main>
  )
}

export default App
