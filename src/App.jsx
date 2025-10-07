import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIMERS = [
  { id: 'off', label: 'No Timer', seconds: 0 },
  { id: '15s', label: '15 sec', seconds: 15 },
  { id: '30s', label: '30 sec', seconds: 30 },
]

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeQuestion() {
  const a = 5;            // fixed to ×5 as requested
  const b = randInt(1, 10)
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
  const [timerMode, setTimerMode] = useState(TIMERS[2]) // default 30s
  const [timeLeft, setTimeLeft] = useState(TIMERS[2].seconds)
  const [bananas, setBananas] = useState(0)
  const [q, setQ] = useState(() => makeQuestion())
  const [running, setRunning] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [showStartHint, setShowStartHint] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running || timerMode.seconds === 0) return
    setTimeLeft(timerMode.seconds)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          setSelectedChoice(null)
          setQ(makeQuestion())
          return timerMode.seconds
        }
        return t - 1
      })
    }, 1000)
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [running, timerMode])

  useEffect(() => { setTimeLeft(timerMode.seconds || 0) }, [timerMode])

  const start = () => { setRunning(true); setShowStartHint(false); setQ(makeQuestion()); if (timerMode.seconds > 0) setTimeLeft(timerMode.seconds) }
  const stop = () => { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current) }

  const answer = (val) => {
    if (!running) start()
    setSelectedChoice(val)
    const correct = val === q.answer
    setBananas((b) => Math.max(0, b + (correct ? 5 : -5)))
    setTimeout(() => {
      setSelectedChoice(null)
      setQ(makeQuestion())
      if (timerMode.seconds > 0) setTimeLeft(timerMode.seconds)
    }, 220)
  }

  const resetAll = () => { stop(); setBananas(0); setSelectedChoice(null); setQ(makeQuestion()); setShowStartHint(true); setTimeLeft(timerMode.seconds || 0) }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-white p-4 text-slate-800 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Noah Math</h1>
              <div className="flex flex-wrap items-center gap-2">
                <select value={timerMode.id} onChange={(e) => setTimerMode(TIMERS.find((t) => t.id === e.target.value) || TIMERS[2])} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800">
                  {TIMERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <button onClick={resetAll} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-400 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800">Reset</button>
              </div>
            </div>
          </div>
        </header>

        {/* Clean single-column quiz card */}
        <section className="">
          <div className="mx-auto flex max-w-[680px] flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {/* BANANAS (left) - QUESTION (center) - TIMER (right) */}
            <div className="flex w-full items-center justify-between">
              <div className="mr-3 shrink-0 rounded-2xl bg-white px-4 py-2 text-center text-lg font-extrabold text-yellow-600 border border-yellow-300">
                🍌 {bananas}
              </div>
              <div className="text-center flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Solve:</p>
                <div className="text-5xl font-black tracking-tight">{q.a} × {q.b}</div>
              </div>
              {timerMode.seconds > 0 && (
                <div className={`ml-3 shrink-0 rounded-2xl px-4 py-2 text-center text-lg font-extrabold text-white ${timeLeft <= 5 ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}>
                  {timeLeft}s
                </div>
              )}
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {q.choices.map((c) => {
                const isSelected = selectedChoice === c
                return (
                  <button
                    key={c}
                    onClick={() => answer(c)}
                    className={`rounded-2xl px-4 py-3 text-lg font-bold text-white shadow transition active:scale-95 focus:outline-none focus:ring-2 ${
                      isSelected
                        ? 'bg-blue-600 focus:ring-blue-300'
                        : 'bg-green-600 hover:bg-green-500 focus:ring-green-300'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2 pt-2">
              {!running ? (
                <button onClick={start} className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300">Start</button>
              ) : (
                <button onClick={stop} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-300 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800">Pause</button>
              )}
            </div>
          </div>
          <AnimatePresence>
            {showStartHint && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                Tip: Default is ×5 with 30s per question. Each correct +5 bananas; wrong −5.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        <footer className="mx-auto max-w-3xl text-center text-xs text-slate-500 dark:text-slate-400">
          <p>Made with Love, from Daddy & Mommy ❤️</p>
        </footer>
      </div>
    </div>
  )
}
