import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import Loader from '../components/Loader'
import { useTranslation } from 'react-i18next'

export default function Test() {
    const { id } = useParams()
    const { t } = useTranslation()

    const [questions, setQuestions] = useState([])
    const [answers, setAnswers] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
    const [violations, setViolations] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Prevent Exit
    useEffect(() => {
        if (loading || submitted) return
        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = t("exitWarning")
            return t("exitWarning")
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [loading, submitted, t])

    // Tab Switching
    useEffect(() => {
        if (loading || submitted) return
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setViolations(v => v + 1)
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [loading, submitted])

    // Monitor Fullscreen
    useEffect(() => {
        if (loading || submitted) return
        const handleFS = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", handleFS)
        return () => document.removeEventListener("fullscreenchange", handleFS)
    }, [loading, submitted])

    const enterFullscreen = () => {
        const el = document.documentElement
        if (el.requestFullscreen) el.requestFullscreen()
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
        else if (el.msRequestFullscreen) el.msRequestFullscreen()
    }

    useEffect(() => {
        const fetchQuestions = async () => {
            const { data } = await api.get(`/questions/assignment/${id}`)
            setQuestions(data)
            setLoading(false)
        }
        fetchQuestions()
    }, [id])

    // TIMER
    useEffect(() => {
        if (submitted) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [submitted])

    // Auto-submit on violations
    useEffect(() => {
        if (violations >= 5 && !submitted) {
            alert(t("autoSubmitted"))
            handleSubmit()
        } else if (violations > 0 && !submitted) {
            alert(t("tabSwitchWarning", { count: violations }))
        }
    }, [violations, submitted, t])

    const handleSelect = (questionId, option) => {
        if (submitted) return
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }))
    }

    const handleSubmit = async () => {
        let correct = 0

        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                correct++
            }
        })

        setScore(correct)
        setSubmitted(true)

        // SAVE RESULT TO BACKEND
        try {
            await api.post('/results', {
                assignmentId: id,
                score: correct,
                totalQuestions: questions.length
            })
        } catch (err) {
            console.log('Result save failed')
        }
    }

    if (loading) return <Loader />

    const progress = (Object.keys(answers).length / questions.length) * 100

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Fullscreen Overlay */}
            {!isFullscreen && !submitted && (
                <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-6xl mb-6">🖥️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {t("fullscreenRequired")}
                    </h2>
                    <button
                        onClick={enterFullscreen}
                        className="px-8 py-4 bg-brand-500 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-brand-600 transition-all"
                    >
                        {t("enterFullscreen")}
                    </button>
                </div>
            )}

            {/* TIMER */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{t("mcqTestTitle")}</h2>
                <div className="text-lg font-semibold text-red-600">
                    ⏳ {Math.floor(timeLeft / 60)}:
                    {String(timeLeft % 60).padStart(2, '0')}
                </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                    className="bg-brand-500 h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {questions.map((q, index) => (
                <div key={q.id} className="mb-6 p-4 border rounded-lg">
                    <p className="font-semibold mb-3">
                        {index + 1}. {q.questionText}
                    </p>

                    <div className="space-y-2">
                        {['A', 'B', 'C', 'D'].map(letter => {
                            const isCorrect = q.correctAnswer === letter
                            const isSelected = answers[q.id] === letter

                            let style = ''
                            if (submitted) {
                                if (isCorrect) style = 'text-green-600 font-semibold'
                                else if (isSelected) style = 'text-red-600'
                            }

                            return (
                                <label key={letter} className={`block cursor-pointer ${style}`}>
                                    <input
                                        type="radio"
                                        name={q.id}
                                        value={letter}
                                        checked={isSelected}
                                        onChange={() => handleSelect(q.id, letter)}
                                        disabled={submitted}
                                        className="mr-2"
                                    />
                                    {q[`option${letter}`]}
                                </label>
                            )
                        })}
                    </div>
                </div>
            ))}

            {!submitted && (
                <button
                    onClick={handleSubmit}
                    className="mt-6 px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
                >
                    {t("submitTestBtn")}
                </button>
            )}

            {submitted && (
                <div className="mt-8 text-center">
                    <h2 className="text-3xl font-bold mb-3">{t("testCompleted")}</h2>
                    <p className="text-xl">
                        {t("yourScore")} <strong>{score}</strong> / {questions.length}
                    </p>
                </div>
            )}
        </div>
    )
}
