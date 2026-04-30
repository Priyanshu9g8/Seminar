import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { getExamById, submitExam, getExamResult } from "../api/axios"
import { useTranslation } from "react-i18next"

/* ─────────────────────────────────────────────
   Seeded shuffle — same student always gets
   the same subset from the same pool
────────────────────────────────────────────── */
function seededShuffle(arr, seed) {
    const a = [...arr]
    let s = seed
    for (let i = a.length - 1; i > 0; i--) {
        s = ((s * 1664525) + 1013904223) & 0xffffffff
        const j = Math.abs(s) % (i + 1);
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

const OPTION_KEYS = ["A", "B", "C", "D"]
const OPTION_COLORS = {
    A: { bg: "#eff6ff", border: "#3b82f6", selected: "#1d4ed8" },
    B: { bg: "#f0fdf4", border: "#22c55e", selected: "#15803d" },
    C: { bg: "#fff7ed", border: "#f97316", selected: "#c2410c" },
    D: { bg: "#fdf4ff", border: "#a855f7", selected: "#7e22ce" },
}

/* Language config */
const LANGS = [
    { code: "en", label: "EN",    name: "English"  },
    { code: "hi", label: "हिंदी", name: "Hindi"    },
    { code: "pa", label: "ਪੰਜਾਬੀ",name: "Punjabi"  },
]

/** Get question text in the selected language (falls back to English) */
function qText(q, lang) {
    if (!q) return ""
    if (lang === "hi" && q.question_hi) return q.question_hi
    if (lang === "pa" && q.question_pa) return q.question_pa
    return q.question
}

/** Get option text in the selected language (falls back to English) */
function optText(q, key, lang) {
    if (!q) return ""
    const suffix = lang === "hi" ? "_hi" : lang === "pa" ? "_pa" : ""
    return q[`option${key}${suffix}`] || q[`option${key}`]
}

/* ─────────────────────────────────────────────
   RESULT REVIEW SCREEN
────────────────────────────────────────────── */
function ResultScreen({ questions, submissionData, examTopic, onBack, lang = "en", t }) {
    const pct = Math.round((submissionData.score / submissionData.totalQuestions) * 100)
    const grade = pct >= 90 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 45 ? "C" : "D"
    const gradeColor = pct >= 75 ? "#16a34a" : pct >= 45 ? "#d97706" : "#dc2626"

    // Parse saved answers
    let savedAnswers = {}
    try { savedAnswers = JSON.parse(submissionData.answersJson || "{}") } catch { }

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px", fontFamily: "Inter, sans-serif" }}>
            {/* Header result card */}
            <div style={{
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                borderRadius: 20, padding: "32px 36px", marginBottom: 32,
                color: "#fff", textAlign: "center"
            }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>
                    {pct >= 75 ? "🎉" : pct >= 45 ? "👍" : "📚"}
                </div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{t("examComplete")}</h1>
                <p style={{ margin: "8px 0 20px", opacity: 0.85, fontSize: 15 }}>{examTopic}</p>

                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                        { label: t("scoreLabel"), value: `${submissionData.score}/${submissionData.totalQuestions}` },
                        { label: t("percentageLabel"), value: `${pct}%` },
                        { label: t("gradeLabel"), value: grade },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: 14, padding: "14px 24px"
                        }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: gradeColor === "#16a34a" ? "#bbf7d0" : gradeColor === "#d97706" ? "#fde68a" : "#fca5a5" }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Answer review */}
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>📋 {t("answerReview")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {questions.map((q, i) => {
                    const userAns = savedAnswers[i] || null
                    const correct = q.correctAnswer
                    const isRight = userAns === correct
                    return (
                        <div key={i} style={{
                            background: "#fff", borderRadius: 16,
                            border: `2px solid ${isRight ? "#bbf7d0" : "#fecaca"}`,
                            padding: "20px 24px",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                        }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                                <div style={{
                                    minWidth: 28, height: 28, borderRadius: "50%",
                                    background: isRight ? "#16a34a" : "#dc2626",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0
                                }}>
                                    {isRight ? "✓" : "✗"}
                                </div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, lineHeight: 1.5 }}>
                                     Q{i + 1}. {qText(q, lang)}
                                 </p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                {OPTION_KEYS.map(key => {
                                    const isCorrect = key === correct
                                    const isSelected = key === userAns
                                    let bg = "#f9fafb", border = "#e5e7eb", textColor = "#374151"
                                    if (isCorrect) { bg = "#dcfce7"; border = "#22c55e"; textColor = "#15803d" }
                                    else if (isSelected && !isCorrect) { bg = "#fee2e2"; border = "#ef4444"; textColor = "#b91c1c" }
                                    return (
                                        <div key={key} style={{
                                            background: bg, border: `1.5px solid ${border}`,
                                            borderRadius: 10, padding: "10px 14px",
                                            display: "flex", alignItems: "center", gap: 10
                                        }}>
                                            <span style={{
                                                minWidth: 26, height: 26, borderRadius: "50%",
                                                background: isCorrect ? "#22c55e" : isSelected ? "#ef4444" : "#e5e7eb",
                                                color: (isCorrect || isSelected) ? "#fff" : "#6b7280",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 12, fontWeight: 700, flexShrink: 0
                                            }}>{key}</span>
                                            <span style={{ fontSize: 13, color: textColor, fontWeight: isCorrect ? 600 : 400 }}>{optText(q, key, lang)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            {!userAns && (
                                <p style={{ margin: "10px 0 0", fontSize: 12, color: "#9ca3af" }}>⚠️ {t("notAnswered")}</p>
                            )}
                        </div>
                    )
                })}
            </div>

            <button onClick={onBack} style={{
                marginTop: 32, width: "100%", padding: "14px 0",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", border: "none", borderRadius: 14,
                fontWeight: 700, fontSize: 16, cursor: "pointer"
            }}>
                {t("backToDashboard")}
            </button>
        </div>
    )
}

/* ─────────────────────────────────────────────
   MAIN AI EXAM PAGE
────────────────────────────────────────────── */
export default function AIExam() {
    const { examId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [exam, setExam] = useState(null)
    const [questions, setQuestions] = useState([])   // student's personal subset
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState({})       // { qIndex: "A"|"B"|"C"|"D" }
    const [timeLeft, setTimeLeft] = useState(null)   // seconds
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submissionData, setSubmissionData] = useState(null)
    const [lang, setLang] = useState(() => localStorage.getItem("gs_exam_lang") || "en")

    const switchLang = (code) => {
        setLang(code)
        localStorage.setItem("gs_exam_lang", code)
    }

    const timerRef = useRef(null)

    /* ── Integrity Monitoring ── */
    const [violations, setViolations] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Prevent Exit
    useEffect(() => {
        if (loading || submitted || submitting) return
        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = t("exitWarning")
            return t("exitWarning")
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [loading, submitted, submitting, t])

    // Tab Switching
    useEffect(() => {
        if (loading || submitted || submitting) return
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setViolations(v => v + 1)
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [loading, submitted, submitting])

    // Monitor Fullscreen
    useEffect(() => {
        if (loading || submitted || submitting) return
        const handleFS = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", handleFS)
        return () => document.removeEventListener("fullscreenchange", handleFS)
    }, [loading, submitted, submitting])

    const enterFullscreen = () => {
        const el = document.documentElement
        if (el.requestFullscreen) el.requestFullscreen()
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
        else if (el.msRequestFullscreen) el.msRequestFullscreen()
    }

    /* ── Load exam ── */
    useEffect(() => {
        const load = async () => {
        if (!user?.id) {
                setError(t("loginToTakeExam"))
                setLoading(false)
                return
            }

            try {
                const data = await getExamById(examId)
                setExam(data)

                // Check for existing submission (JWT-authenticated — only returns THIS student's result)
                try {
                    const existing = await getExamResult(examId)
                    // Already submitted — show result view
                    const pool = JSON.parse(data.questionPool)
                    const shuffled = seededShuffle(pool, user.id)
                    // ✅ Safety guard: use all available pool questions if pool < questionCount
                    const count = Math.min(data.questionCount, shuffled.length)
                    const myQuestions = shuffled.slice(0, count)
                    console.log(`[AIExam] Pool size: ${pool.length}, showing: ${count} questions`)
                    setQuestions(myQuestions)
                    setSubmissionData(existing)
                    setSubmitted(true)
                    setLoading(false)
                    return
                } catch {
                    // No submission yet — continue to exam
                }

                // Parse question pool and pick student's personal subset using their ID as seed
                const pool = JSON.parse(data.questionPool)
                const shuffled = seededShuffle(pool, user.id)  // always use authenticated user's ID
                // ✅ Safety guard: never slice more than what's available in the pool
                const count = Math.min(data.questionCount, shuffled.length)
                const myQuestions = shuffled.slice(0, count)
                console.log(`[AIExam] Pool size: ${pool.length}, questionCount: ${data.questionCount}, showing: ${count} questions`)

                setQuestions(myQuestions)
                setTimeLeft(data.timeLimitMinutes * 60)
                setLoading(false)
            } catch (err) {
                setError(t("failedLoadExam"))
                setLoading(false)
            }
        }
        load()
    }, [examId, user?.id])

    /* ── Countdown timer ── */
    // Store handleSubmit in a ref so the timer always has the latest version
    const handleSubmitRef = useRef(null)

    /* ── Submit ── */
    const handleSubmit = useCallback(async (autoSubmit = false) => {
        if (submitted || submitting) return
        setSubmitting(true)
        clearTimeout(timerRef.current)

        // Calculate score using latest answers state
        setAnswers(currentAnswers => {
            // Run async submit with captured answers
            ;(async () => {
                let score = 0
                questions.forEach((q, i) => {
                    if (currentAnswers[i] === q.correctAnswer) score++
                })

                // Build answers map for review — every question gets an entry (null if unanswered)
                const answersForReview = {}
                questions.forEach((_, i) => {
                    answersForReview[i] = currentAnswers[i] || null
                })

                try {
                    // ⚠ Do NOT send studentId in the body — backend derives it from JWT token
                    const result = await submitExam({
                        examId: Number(examId),
                        score,
                        totalQuestions: questions.length,
                        answersJson: JSON.stringify(answersForReview)
                    })
                    console.log("[AIExam] Submission saved:", result.id, "studentId from JWT")
                    // Merge server result with local answersJson for immediate review display
                    setSubmissionData({
                        ...result,
                        answersJson: result.answersJson || JSON.stringify(answersForReview)
                    })
                    setSubmitted(true)
                } catch (err) {
                    console.error("Submit error", err)
                } finally {
                    setSubmitting(false)
                }
            })()

            return currentAnswers  // don't change answers state
        })
    }, [submitted, submitting, questions, examId, user])

    // Keep ref in sync
    useEffect(() => { handleSubmitRef.current = handleSubmit }, [handleSubmit])

    // Auto-submit on violations
    useEffect(() => {
        if (violations >= 5 && !submitted && !submitting) {
            alert(t("autoSubmitted"))
            handleSubmit(true)
        } else if (violations > 0 && !submitted && !submitting) {
            alert(t("tabSwitchWarning", { count: violations }))
        }
    }, [violations, submitted, submitting, t, handleSubmit])

    useEffect(() => {
        if (timeLeft === null || submitted) return
        if (timeLeft <= 0) {
            handleSubmitRef.current?.(true)
            return
        }
        timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
        return () => clearTimeout(timerRef.current)
    }, [timeLeft, submitted])

    /* ── Loading / Error states ── */
    if (loading) return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Inter, sans-serif", background: "#f8fafc"
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                <p style={{ fontSize: 18, color: "#6366f1", fontWeight: 600 }}>{t("loadingExamTitle")}</p>
                <p style={{ color: "#9ca3af", fontSize: 13 }}>{t("loadingExamSub")}</p>
            </div>
        </div>
    )

    if (error) return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Inter, sans-serif"
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                <p style={{ color: "#dc2626", fontSize: 16, fontWeight: 600 }}>{error}</p>
                <button onClick={() => navigate(-1)} style={{
                    marginTop: 16, padding: "10px 24px", borderRadius: 10,
                    background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600
                }}>{t("goBack")}</button>
            </div>
        </div>
    )

    /* ─── Result screen ─── */
    if (submitted && submissionData) {
        return (
            <ResultScreen
                questions={questions}
                submissionData={submissionData}
                examTopic={exam?.topic}
                lang={lang}
                t={t}
                onBack={() => navigate("/student")}
            />
        )
    }

    /* ── Exam UI ── */
    const q = questions[currentQ]
    const mins = String(Math.floor((timeLeft || 0) / 60)).padStart(2, "0")
    const secs = String((timeLeft || 0) % 60).padStart(2, "0")
    const timeColor = timeLeft <= 60 ? "#dc2626" : timeLeft <= 300 ? "#d97706" : "#16a34a"
    const answered = Object.keys(answers).length
    const progress = Math.round((answered / questions.length) * 100)

    return (
        <div style={{
            minHeight: "100vh", background: "#f8fafc",
            fontFamily: "Inter, sans-serif"
        }}>
            {/* Fullscreen Overlay */}
            {!isFullscreen && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    padding: 24, textAlign: "center"
                }}>
                    <div style={{ fontSize: 64, marginBottom: 24 }}>🖥️</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>
                        {t("fullscreenRequired")}
                    </h2>
                    <button
                        onClick={enterFullscreen}
                        style={{
                            padding: "16px 32px", borderRadius: 16,
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: "#fff", border: "none",
                            fontWeight: 700, fontSize: 18, cursor: "pointer",
                            boxShadow: "0 10px 25px -5px rgba(99,102,241,0.5)"
                        }}
                    >
                        {t("enterFullscreen")}
                    </button>
                </div>
            )}

            {/* ── Top Bar ── */}
            <div style={{
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                padding: "0 24px", height: 64,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                position: "sticky", top: 0, zIndex: 100,
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)"
            }}>
                {/* Topic */}
                <div style={{ color: "#fff" }}>
                    <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 500 }}>{t("aiExamLabel")}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {exam?.topic}
                    </div>
                </div>

                {/* Timer */}
                <div style={{
                    background: "rgba(255,255,255,0.2)", borderRadius: 12,
                    padding: "8px 18px", textAlign: "center",
                    border: timeLeft <= 60 ? "2px solid #fca5a5" : "2px solid transparent",
                    animation: timeLeft <= 60 ? "pulse 1s infinite" : "none"
                }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{t("timeLeft")}</div>
                    <div style={{
                        fontSize: 22, fontWeight: 900,
                        color: timeLeft <= 60 ? "#fca5a5" : "#fff",
                        letterSpacing: 2
                    }}>
                        {mins}:{secs}
                    </div>
                </div>

                {/* Submit button */}
                <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    style={{
                        background: "#fff", color: "#6366f1",
                        border: "none", borderRadius: 10, padding: "8px 20px",
                        fontWeight: 700, fontSize: 14, cursor: submitting ? "wait" : "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                    }}
                >
                    {submitting ? t("submittingBtn") : t("submitExamBtn")}
                </button>
            </div>

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px", display: "flex", gap: 24 }}>

                {/* ── Question Area ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Progress bar */}
                    <div style={{
                        background: "#fff", borderRadius: 14, padding: "16px 20px",
                        marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                                {t("questionOf")} {currentQ + 1} {t("ofTotal")} {questions.length}
                            </span>
                            <span style={{ fontSize: 13, color: "#6b7280" }}>
                                {answered} {t("answeredDone")} · {questions.length - answered} {t("remaining")}
                            </span>
                        </div>
                        <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8 }}>
                            <div style={{
                                width: `${progress}%`, height: "100%",
                                background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                                borderRadius: 999, transition: "width 0.4s ease"
                            }} />
                        </div>
                    </div>

                    {/* Question card */}
                    <div style={{
                        background: "#fff", borderRadius: 20,
                        padding: "28px 32px", marginBottom: 20,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{
                            display: "inline-block", background: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
                            color: "#7c3aed", fontSize: 12, fontWeight: 700, padding: "4px 12px",
                            borderRadius: 20, marginBottom: 16
                        }}>
                            Q{currentQ + 1}
                        </div>
                        <h2 style={{
                            fontSize: 19, fontWeight: 700, lineHeight: 1.55,
                            color: "#111827", margin: "0 0 28px"
                        }}>
                            {qText(q, lang)}
                        </h2>

                        {/* Options */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            {OPTION_KEYS.map(key => {
                                const isSelected = answers[currentQ] === key
                                const colors = OPTION_COLORS[key]
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: key }))}
                                        style={{
                                            background: isSelected ? colors.selected : colors.bg,
                                            border: `2px solid ${isSelected ? colors.selected : colors.border}`,
                                            borderRadius: 14, padding: "14px 18px",
                                            cursor: "pointer", textAlign: "left",
                                            display: "flex", alignItems: "center", gap: 14,
                                            transition: "all 0.2s ease",
                                            transform: isSelected ? "scale(1.02)" : "scale(1)",
                                            boxShadow: isSelected ? `0 4px 16px ${colors.selected}40` : "none"
                                        }}
                                    >
                                        <span style={{
                                            minWidth: 32, height: 32, borderRadius: "50%",
                                            background: isSelected ? "rgba(255,255,255,0.3)" : colors.border,
                                            color: "#fff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 13, fontWeight: 800, flexShrink: 0
                                        }}>{key}</span>
                                        <span style={{
                                            fontSize: 14, fontWeight: isSelected ? 600 : 400,
                                            color: isSelected ? "#fff" : "#374151",
                                            lineHeight: 1.4
                                        }}>{optText(q, key, lang)}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <button
                            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                            disabled={currentQ === 0}
                            style={{
                                flex: 1, padding: "12px 0",
                                background: currentQ === 0 ? "#f3f4f6" : "#fff",
                                color: currentQ === 0 ? "#9ca3af" : "#374151",
                                border: "1.5px solid #e5e7eb", borderRadius: 12,
                                fontWeight: 600, fontSize: 14, cursor: currentQ === 0 ? "default" : "pointer",
                                transition: "all 0.2s"
                            }}
                        >{t("prevBtn")}</button>
                        {currentQ < questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQ(q => q + 1)}
                                style={{
                                    flex: 2, padding: "12px 0",
                                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                    color: "#fff", border: "none", borderRadius: 12,
                                    fontWeight: 700, fontSize: 14, cursor: "pointer"
                                }}
                            >{t("nextQuestionBtn")}</button>
                        ) : (
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                style={{
                                    flex: 2, padding: "12px 0",
                                    background: "linear-gradient(135deg,#16a34a,#15803d)",
                                    color: "#fff", border: "none", borderRadius: 12,
                                    fontWeight: 700, fontSize: 14, cursor: "pointer"
                                }}
                            >{submitting ? t("submittingBtn") : t("submitExamBtnTick")}</button>
                        )}
                    </div>
                </div>

                {/* ── Question Navigator Sidebar ── */}
                <div style={{ width: 220, flexShrink: 0 }}>
                    <div style={{
                        background: "#fff", borderRadius: 20, padding: 20,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        position: "sticky", top: 80
                    }}>
                        <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 14, color: "#374151" }}>
                            🗂 {t("questionsListTitle")}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                            {questions.map((_, i) => {
                                const isAnswered = answers[i] !== undefined
                                const isCurrent = i === currentQ
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentQ(i)}
                                        style={{
                                            width: "100%", aspectRatio: "1",
                                            borderRadius: 8, border: "none",
                                            background: isCurrent
                                                ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                                                : isAnswered ? "#dcfce7" : "#f3f4f6",
                                            color: isCurrent ? "#fff" : isAnswered ? "#15803d" : "#9ca3af",
                                            fontWeight: isCurrent || isAnswered ? 700 : 500,
                                            fontSize: 13, cursor: "pointer",
                                            boxShadow: isCurrent ? "0 2px 8px rgba(99,102,241,0.4)" : "none",
                                            transition: "all 0.15s"
                                        }}
                                    >{i + 1}</button>
                                )
                            })}
                        </div>

                        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                            {[
                                { color: "linear-gradient(135deg,#6366f1,#8b5cf6)", label: t("currentLegend") },
                                { color: "#dcfce7", label: t("answeredLegend"), text: "#374151" },
                                { color: "#f3f4f6", label: t("notAnswered"), text: "#374151" },
                            ].map(item => (
                                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{
                                        width: 14, height: 14, borderRadius: 4,
                                        background: item.color
                                    }} />
                                    <span style={{ fontSize: 11, color: "#6b7280" }}>{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div style={{
                            marginTop: 20, padding: "12px 14px",
                            background: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
                            borderRadius: 12
                        }}>
                            <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600, marginBottom: 4 }}>{t("progressUpper")}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "#4c1d95" }}>{progress}%</div>
                            <div style={{ fontSize: 11, color: "#7c3aed" }}>{answered} {t("ofTotal")} {questions.length} {t("doneText")}</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.75; }
                }
                * { box-sizing: border-box; }
            `}</style>
        </div>
    )
}
