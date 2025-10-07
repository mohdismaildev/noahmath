import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIMERS = [
  { id: 'off', label: 'No Timer', seconds: 0 },
  { id: '15s', label: '15 sec', seconds: 15 },
  { id: '30s', label: '30 sec', seconds: 30 },
]

const ALL_TABLES = Array.from({length: 10}, (_, i) => i + 1) // 1..10

function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeQuestion(selectedTables) {
  const a = randFrom(selectedTables)
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
  const [selectedTables, setSelectedTables] = useState([1,2,3,4,5,6])
  const [timerMode, setTimerMode] = useState(TIMERS[0])
  const [timeLeft, setTimeLeft] = useState(0)
  const [bananas, setBananas] = useState(0)
  const [q, setQ] = useState(() => makeQuestion([1,2,3,4,5,6]))
  const [running, setRunning] = useState(false)
  const [showStartHint, setShowStartHint] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (selectedTables.length === 0) setSelectedTables([1])
    setQ(makeQuestion(selectedTables.length ? selectedTables : [1]))
  }, [selectedTables])

  useEffect(() => {
    if (!running || timerMode.seconds === 0) return
    setTimeLeft(timerMode.seconds)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          setQ(makeQuestion(selectedTables))
          return timerMode.seconds
        }
        return t - 1
      })
    }, 1000)
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [running, timerMode, selectedTables])

  useEffect(() => { setTimeLeft(timerMode.seconds || 0) }, [timerMode])

  const toggleTable = (n) => { setSelectedTables((prev) => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n].sort((a,b)=>a-b)) }
  const selectAll = () => setSelectedTables([...ALL_TABLES])
  const selectNone = () => setSelectedTables([])
  const selectUpTo6 = () => setSelectedTables([1,2,3,4,5,6])

  const start = () => { setRunning(true); setShowStartHint(false); setQ(makeQuestion(selectedTables)); if (timerMode.seconds > 0) setTimeLeft(timerMode.seconds) }
  const stop = () => { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current) }
  const answer = (val) => { if (!running) start(); const correct = val === q.answer; setBananas((b) => Math.max(0, b + (correct ? 5 : -5))); setQ(makeQuestion(selectedTables)); if (timerMode.seconds > 0) setTimeLeft(timerMode.seconds) }
  const resetAll = () => { stop(); setBananas(0); setQ(makeQuestion(selectedTables)); setShowStartHint(true); setTimeLeft(timerMode.seconds || 0) }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-white p-4 text-slate-800 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Noah Math</h1>
              <div className="flex flex-wrap items-center gap-2">
                <select value={timerMode.id} onChange={(e) => setTimerMode(TIMERS.find((t) => t.id === e.target.value) || TIMERS[0])} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800">
                  {TIMERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <button onClick={resetAll} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-400 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800">Reset</button>
              </div>
            </div>

            {/* Table selection */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose multiplication tables to practice:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={selectUpTo6} className="rounded-full border border-green-600 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-900/30">1–6</button>
                <button onClick={selectAll} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">All</button>
                <button onClick={selectNone} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">None</button>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {ALL_TABLES.map((n) => {
                  const active = selectedTables.includes(n)
                  return (
                    <button
                      key={n}
                      onClick={() => toggleTable(n)}
                      className={`rounded-xl px-0 py-2 text-center text-sm font-bold shadow-sm focus:outline-none focus:ring-2 ${active ? 'bg-green-600 text-white focus:ring-green-300' : 'bg-white text-slate-700 border border-slate-300 hover:-translate-y-0.5 hover:shadow focus:ring-green-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'}`}
                    >
                      ×{n}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Clean single-column quiz card */}
        <section className="">
          <div className="mx-auto flex max-w-[680px] flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {/* QUESTION + BANANAS (left) + TIMER (right) */}
            <div className="flex w-full items-center justify-between">
              {/* Bananas badge on the left */}
              <div className="mr-3 shrink-0 rounded-2xl bg-yellow-400/90 px-4 py-2 text-center text-lg font-extrabold text-yellow-900">
                🍌 {bananas}
              </div>
              {/* Question center */}
              <div className="text-center flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Solve:</p>
                <div className="text-5xl font-black tracking-tight">{q.a} × {q.b}</div>
              </div>
              {/* Timer badge on the right */}
              {timerMode.seconds > 0 && (
                <div className={`ml-3 shrink-0 rounded-2xl px-4 py-2 text-center text-lg font-extrabold text-white ${timeLeft <= 5 ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}>
                  {timeLeft}s
                </div>
              )}
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
                <button onClick={start} className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300">Start</button>
              ) : (
                <button onClick={stop} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-300 active:translate-y-0 dark:border-slate-700 dark:bg-slate-800">Pause</button>
              )}
            </div>
          </div>
          <AnimatePresence>
            {showStartHint && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                Tip: Tap the tables you want (×1…×10). Each correct +5 bananas; wrong −5. Use 15s or 30s timer for speed rounds.
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
