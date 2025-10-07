import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LEVELS = [
  { id: 'easy', label: 'Easy (1–3)', max: 3 },
  { id: 'medium', label: 'Medium (1–4)', max: 4 },
  { id: 'hard', label: 'Hard (1–6)', max: 6 },
]

const TIMERS = [
  { id: 'off', label: 'No Timer', seconds: 0 },
  { id: '15s', label: '15 sec', seconds: 15 },
  { id: '30s', label: '30 sec', seconds: 30 },
]

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeQuestion(max) {
  const a = randInt(1, max)
  const b = randInt(1, max)
  const answer = a * b
  const options = new Set([answer])
  while (options.size < 4) {
    let delta = randInt(-5, 5); if (delta === 0) delta = 1
    const candidate = Math.max(1, answer + delta)
    options.add(candidate)
  }
  const choices = Array.from(options).sort(() => Math.random() - 0.5)
  return { a, b, answer, choices }
}

export default function NoahMath() {
  const [level, setLevel] = useState(LEVELS[0])
  const [timerMode, setTimerMode] = useState(TIMERS[0])
  const [timeLeft, setTimeLeft] = useState(0)
  const [bananas, setBananas] = useState(0)
  const [q, setQ] = useState(() => makeQuestion(level.max))
  const [running, setRunning] = useState(false)
  const [showStartHint, setShowStartHint] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => { setQ(makeQuestion(level.max)) }, [level])

  useEffect(() => {
    if (!running || timerMode.seconds === 0) return
    setTimeLeft(timerMode.seconds)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          setQ(makeQuestion(level.max))
          return timerMode.seconds
        }
        return t - 1
      })
    }, 1000)
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [running, timerMode, level])

  useEffect(() => { setTimeLeft(timerMode.seconds || 0) }, [timerMode])

  const start = () => { setRunning(true); setShowStartHint(false); setQ(makeQuestion(level.max)); if (timerMode.seconds > 0) setTimeLeft(timerMode.seconds) }
  const stop = () => { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current) }

  const answer = (val) => {
    if (!running) start()
    const correct = val === q.answer
    setBananas((b) => Math.max(0, b + (correct ? 5 : -5)))
    setQ(makeQuestion(level.max))
    if (timerMode.seconds > 0) setTimeLeft(timerMode.seconds)
  }

  const resetAll = () => { stop(); setBananas(0); setQ(makeQuestion(level.max)); setShowStartHint(true); setTimeLeft(timerMode.seconds || 0) }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-white p-4 text-slate-800 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Noah Math</h1>
            <div className="flex flex-wrap items-center gap-2">
              <select value={level.id} onChange={(e) => setLevel(LEVELS.find((l) => l.id === e.target.value) || LEVELS[0])} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800">
                {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
              <select value={timerMode.id} onChange={(e) => setTimerMode(TIMERS.find((t) => t.id === e.target.value) || TIMERS[0])} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800">
                {TIMERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <button onClick={resetAll} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-400 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800">Reset</button>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="order-2 flex flex-col gap-3 md:order-1">
            <StatCard label="Bananas" value={bananas} />
            <StatCard label="Level" value={level.label} />
            <StatCard label="Timer" value={timerMode.label} />
            {timerMode.seconds > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Time Left</p>
                <p className="text-2xl font-bold">{timeLeft}s</p>
              </div>
            )}
          </div>

          <div className="order-1 md:order-2 md:col-span-2">
            <div className="mx-auto flex max-w-[680px] flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Solve:</p>
                <div className="text-5xl font-black tracking-tight">{q.a} × {q.b}</div>
              </div>
              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                {q.choices.map((c) => (
                  <button key={c} onClick={() => answer(c)} className="rounded-2xl bg-green-600 px-4 py-3 text-lg font-bold text-white shadow transition hover:bg-green-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300">
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                {!running ? (
                  <button onClick={ () => start() } className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300">Start</button>
                ) : (
                  <button onClick={ () => stop() } className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-300 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800">Pause</button>
                )}
              </div>
            </div>
            <AnimatePresence>
              {showStartHint && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                  Tip: Choose a level and a timer (15s or 30s). Each correct +5 bananas; wrong −5. Keep going!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </section>

        <footer className="mx-auto max-w-3xl text-center text-xs text-slate-500 dark:text-slate-400">
          <p>Works offline. Install via Safari → Share → Add to Home Screen.</p>
        </footer>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
