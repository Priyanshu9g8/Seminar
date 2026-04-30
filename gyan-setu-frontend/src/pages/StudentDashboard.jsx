import { useEffect, useState, useCallback, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { askAI, getActiveExams, getMySubmissions, getMyQuizResults } from "../api/axios.js"
import { useAuth } from "../hooks/useAuth.js"
import api from "../api/axios.js"

const POLL_INTERVAL_MS = 30_000   // refresh every 30 seconds

export default function StudentDashboard() {

    const { t } = useTranslation()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    const [aiLoading, setAiLoading] = useState(false)

    // Active exams (not yet submitted by this student)
    const [activeExams, setActiveExams] = useState([])
    // Submitted exams (completed by this student)
    const [submittedExams, setSubmittedExams] = useState([])
    const [quizResults, setQuizResults] = useState([])
    const [examsLoading, setExamsLoading] = useState(false)
    const [studentClass, setStudentClass] = useState(null)
    // Track when exams were last refreshed (for the "live" indicator)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [newExamAlert, setNewExamAlert] = useState(false)

    // Keep the class level in a ref so the polling callback always has the latest value
    // NOTE: this ref is explicitly reset on user change (see useEffect below)
    const studentClassRef = useRef(null)
    const currentUserIdRef = useRef(null)  // tracks which user's data is loaded

    const askAssistant = async () => {
        if (!question) return
        setAiLoading(true)
        try {
            setAnswer(await askAI(question))
        } catch {
            console.error("AI request failed")
        } finally {
            setAiLoading(false)
        }
    }



    /* ─── Core exam refresh function ─────────────────────────────
       Called on mount, every 30s, and when the tab becomes visible.
       Silent = no loading spinner (used for background polls).
    ────────────────────────────────────────────────────────────── */
    const refreshExams = useCallback(async (silent = false) => {
        if (!silent) setExamsLoading(true)
        try {
            // Get class level — cached per session, cleared on user change
            let cls = studentClassRef.current
            if (!cls) {
                const profileRes = await api.get("/student/profile").catch(() => null)
                cls = profileRes?.data?.classLevel || null
                studentClassRef.current = cls
                setStudentClass(cls)
            }

            // Fetch active exams + my submissions in parallel
            // Both calls use the JWT token — results are always specific to THIS student
            const [allActive, mySubmissions, myQuizResults] = await Promise.all([
                cls ? getActiveExams(cls) : Promise.resolve([]),
                getMySubmissions().catch(() => []),
                getMyQuizResults().catch(() => [])
            ])

            // Find the most recent submission for each exam
            const latestSubmissions = new Map()
            ;(mySubmissions || []).forEach(s => {
                const existing = latestSubmissions.get(String(s.examId))
                if (!existing || new Date(s.submittedAt) > new Date(existing.submittedAt)) {
                    latestSubmissions.set(String(s.examId), s)
                }
            })

            // An exam is "pending" if THIS student has NOT submitted it yet during its current active window.
            // If reactivatedAt is newer than their latest submission, it becomes pending again.
            const pending = (allActive || []).filter(e => {
                const latestSub = latestSubmissions.get(String(e.id))
                if (!latestSub) return true // never taken
                
                // If taken, check if exam was reactivated AFTER the submission
                // reactivatedAt is now correctly returned by the backend
                const reactivated = e.reactivatedAt ? new Date(e.reactivatedAt) : new Date(e.createdAt)
                return new Date(latestSub.submittedAt) < reactivated
            })

            // Detect NEW exams that weren't there before → show toast alert
            setActiveExams(prev => {
                const prevIds = new Set(prev.map(e => String(e.id)))
                const hasNew = pending.some(e => !prevIds.has(String(e.id)))
                if (hasNew && prev.length > 0) setNewExamAlert(true)
                return pending
            })

            // Deduplicate submittedExams by examId — keep only the LATEST submission per exam.
            // The backend /my-submissions returns ALL historical attempts, which caused the
            // same exam to appear multiple times in the "Submitted Exams" list.
            const deduplicatedSubmissions = Array.from(latestSubmissions.values())
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

            // Trust the JWT-based getMySubmissions endpoint 100%.
            // The backend uses findByStudentId(jwtStudentId) which is always correct.
            setSubmittedExams(deduplicatedSubmissions)
            setQuizResults(myQuizResults || [])
            setLastUpdated(new Date())

        } catch (err) {
            console.error("Failed to refresh exams", err)
        } finally {
            if (!silent) setExamsLoading(false)
        }
    }, [user?.id])



    /* ─── CRITICAL: Reset ALL state when user changes ─────────────
       When Student A logs out and Student B logs in, we must clear
       Student A's cached class, active exams, and submitted exams
       so Student B never sees Student A's data.
    ────────────────────────────────────────────────────────────── */
    useEffect(() => {
        if (user?.id && String(user.id) !== String(currentUserIdRef.current)) {
            // User switched — wipe everything
            console.log("[StudentDashboard] User changed from",
                currentUserIdRef.current, "to", user.id, "— clearing state")
            studentClassRef.current = null    // force class re-fetch for new user
            currentUserIdRef.current = user.id
            setStudentClass(null)
            setActiveExams([])
            setSubmittedExams([])
            setQuizResults([])
            setLastUpdated(null)
            setNewExamAlert(false)
        }
    }, [user?.id])

    /* ─── Initial load ─────────────────────────────────────────── */
    useEffect(() => {
        if (user?.id) refreshExams(false)
    }, [user?.id, refreshExams])

    /* ─── Auto-poll every 30s ──────────────────────────────────── */
    useEffect(() => {
        if (!user?.id) return
        const interval = setInterval(() => refreshExams(true), POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [user?.id, refreshExams])

    /* ─── Refresh when tab regains focus ───────────────────────── */
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible" && user?.id) {
                refreshExams(true)
            }
        }
        document.addEventListener("visibilitychange", onVisible)
        return () => document.removeEventListener("visibilitychange", onVisible)
    }, [user?.id, refreshExams])

    /* ─── Auto-dismiss new exam alert after 6s ─────────────────── */
    useEffect(() => {
        if (!newExamAlert) return
        const t = setTimeout(() => setNewExamAlert(false), 6000)
        return () => clearTimeout(t)
    }, [newExamAlert])

    // Format "X seconds/minutes ago"
    const formatUpdated = () => {
        if (!lastUpdated) return ""
        const secs = Math.round((Date.now() - lastUpdated.getTime()) / 1000)
        if (secs < 60) return `${secs}s ago`
        return `${Math.round(secs / 60)}m ago`
    }


    return (
        <>
        <div className="max-w-5xl mx-auto px-4 py-10">

            <h1 className="text-3xl font-bold text-brand-800 mb-6">
                🎓 {t("studentDashboard")}
            </h1>

            {/* ── NEW EXAM TOAST ALERT ── */}
            {newExamAlert && (
                <div style={{
                    position: "fixed", top: 24, right: 24, zIndex: 9999,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff", padding: "16px 24px", borderRadius: 16,
                    boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
                    display: "flex", alignItems: "center", gap: 12,
                    animation: "slideInRight 0.4s ease",
                    maxWidth: 340
                }}>
                    <span style={{ fontSize: 28 }}>🔔</span>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{t("newExamAvailable")}</div>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>{t("newExamAlertMsg")}</div>
                    </div>
                    <button onClick={() => setNewExamAlert(false)} style={{
                        background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                        width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
                        fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>×</button>
                </div>
            )}

            {/* ── ACTIVE EXAMS SECTION ── */}
            <div style={{
                background: "linear-gradient(135deg,#1e1b4b,#312e81)",
                borderRadius: 20, padding: "24px 28px", marginBottom: 20,
                boxShadow: "0 8px 32px rgba(99,102,241,0.3)"
            }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                        }}>📋</div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{t("activeExams")}</h2>
                                {/* Live pulsing dot */}
                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: "50%",
                                        background: "#4ade80",
                                        boxShadow: "0 0 6px #4ade80",
                                        display: "inline-block",
                                        animation: "livePulse 1.5s ease-in-out infinite"
                                    }} />
                                    <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700, letterSpacing: 1 }}>{t("live")}</span>
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                                {studentClass ? `${t("pendingExamsFor")} ${studentClass.replace("CLASS_", "Class ")}` : t("loadingClass")}
                                {lastUpdated && (
                                    <span style={{ marginLeft: 8, opacity: 0.5 }}>· {t("updatedLabel")} {formatUpdated()}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    {/* Manual refresh button */}
                    <button
                        onClick={() => refreshExams(false)}
                        disabled={examsLoading}
                        title="Refresh exams"
                        style={{
                            background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)",
                            color: "#fff", borderRadius: 10, padding: "7px 16px",
                            fontSize: 13, fontWeight: 600, cursor: examsLoading ? "wait" : "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            transition: "background 0.2s"
                        }}
                    >
                        <span style={{ display: "inline-block", animation: examsLoading ? "spin 1s linear infinite" : "none" }}>🔄</span>
                        {examsLoading ? t("refreshing") : t("refresh")}
                    </button>
                </div>

                {examsLoading ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.6)" }}>
                        ⏳ {t("loadingExams")}
                    </div>
                ) : !studentClass ? (
                    <div style={{
                        textAlign: "center", padding: "20px 0",
                        background: "rgba(255,255,255,0.08)", borderRadius: 12,
                        color: "rgba(255,255,255,0.6)", fontSize: 14
                    }}>
                        ℹ️ {t("classNotAvailable")}
                    </div>
                ) : activeExams.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "24px 0",
                        background: "rgba(255,255,255,0.08)", borderRadius: 14
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 14 }}>
                            {t("noPendingExams")}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {activeExams.map(exam => (
                            <div key={exam.id} style={{
                                background: "rgba(255,255,255,0.1)",
                                border: "1.5px solid rgba(255,255,255,0.2)",
                                borderRadius: 14, padding: "16px 20px",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                flexWrap: "wrap", gap: 12
                            }}>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                        <span style={{ fontSize: 18 }}>🎯</span>
                                        <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{exam.topic}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                        {[
                                            { icon: "🏫", text: exam.classLevel?.replace("CLASS_", "Class ") },
                                            { icon: "📝", text: `${exam.questionCount} ${t("questionsSuffix")}` },
                                            { icon: "⏱", text: `${exam.timeLimitMinutes} ${t("minutesSuffix")}` },
                                        ].map(item => (
                                            <span key={item.text} style={{
                                                fontSize: 12, color: "rgba(255,255,255,0.7)",
                                                display: "flex", alignItems: "center", gap: 4
                                            }}>
                                                {item.icon} {item.text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/exam/${exam.id}`)}
                                    style={{
                                        padding: "10px 24px", borderRadius: 10, border: "none",
                                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                        color: "#fff", fontWeight: 700, fontSize: 14,
                                        cursor: "pointer",
                                        boxShadow: "0 4px 16px rgba(99,102,241,0.4)"
                                    }}
                                >
                                    {t("startExamBtn")}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── SUBMITTED EXAMS SECTION ── */}
            <div style={{
                background: "linear-gradient(135deg,#064e3b,#065f46)",
                borderRadius: 20, padding: "24px 28px", marginBottom: 28,
                boxShadow: "0 8px 32px rgba(16,185,129,0.25)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "linear-gradient(135deg,#10b981,#059669)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                    }}>✅</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{t("submittedExamsTitle")}</h2>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                            {t("completedExamsMsg")}
                        </p>
                    </div>
                </div>

                {examsLoading ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.6)" }}>
                        ⏳ {t("loadingResults")}
                    </div>
                ) : submittedExams.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "24px 0",
                        background: "rgba(255,255,255,0.08)", borderRadius: 14
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>
                        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 14 }}>
                            {t("noSubmittedExams")}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {submittedExams.map(sub => {
                            const pct = sub.percentage
                            const grade = pct >= 90 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 45 ? "C" : "D"
                            const gradeColor = pct >= 75 ? "#86efac" : pct >= 45 ? "#fde68a" : "#fca5a5"
                            return (
                                <div key={sub.submissionId} style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1.5px solid rgba(134,239,172,0.35)",
                                    borderRadius: 14, padding: "16px 20px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    flexWrap: "wrap", gap: 12
                                }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                            <span style={{ fontSize: 18 }}>🏆</span>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{sub.topic}</span>
                                            <span style={{
                                                background: "#86efac", color: "#14532d",
                                                fontSize: 11, fontWeight: 700, padding: "2px 8px",
                                                borderRadius: 20
                                            }}>{t("submittedBadge")}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                            {[
                                                { icon: "🏫", text: sub.classLevel?.replace("CLASS_", "Class ") },
                                                { icon: "📝", text: `${sub.score}/${sub.totalQuestions} ${t("correctSuffix")}` },
                                                { icon: "📊", text: `${pct}%` },
                                            ].map(item => (
                                                <span key={item.text} style={{
                                                    fontSize: 12, color: "rgba(255,255,255,0.7)",
                                                    display: "flex", alignItems: "center", gap: 4
                                                }}>
                                                    {item.icon} {item.text}
                                                </span>
                                            ))}
                                            {/* Grade badge */}
                                            <span style={{
                                                background: gradeColor, color: "#14532d",
                                                fontSize: 12, fontWeight: 800, padding: "1px 10px",
                                                borderRadius: 20
                                            }}>{t("gradeLabel")} {grade}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/exam/${sub.examId}`)}
                                        style={{
                                            padding: "10px 24px", borderRadius: 10, border: "none",
                                            background: "rgba(255,255,255,0.15)",
                                            color: "#fff", fontWeight: 700, fontSize: 14,
                                            cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: 8
                                        }}
                                    >
                                        {t("viewResultsBtnFull")}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ── COURSE QUIZ RESULTS SECTION ── */}
            <div style={{
                background: "linear-gradient(135deg,#1e3a8a,#1e40af)",
                borderRadius: 20, padding: "24px 28px", marginBottom: 28,
                boxShadow: "0 8px 32px rgba(30,58,138,0.25)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                    }}>🏅</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{t("courseQuizResults")}</h2>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                            {t("completedQuizzesMsg")}
                        </p>
                    </div>
                </div>

                {examsLoading ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.6)" }}>
                        ⏳ {t("loadingResults")}
                    </div>
                ) : quizResults.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "24px 0",
                        background: "rgba(255,255,255,0.08)", borderRadius: 14
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
                        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 14 }}>
                            {t("noCourseQuizzes")}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {quizResults.map(res => {
                            const pct = res.percentage
                            const grade = pct >= 90 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 45 ? "C" : "D"
                            const gradeColor = pct >= 75 ? "#93c5fd" : pct >= 45 ? "#fde047" : "#fca5a5"
                            return (
                                <div key={res.id} style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1.5px solid rgba(147,197,253,0.35)",
                                    borderRadius: 14, padding: "16px 20px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    flexWrap: "wrap", gap: 12
                                }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                            <span style={{ fontSize: 18 }}>📘</span>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{res.assignmentTitle}</span>
                                            <span style={{
                                                background: "#93c5fd", color: "#1e3a8a",
                                                fontSize: 11, fontWeight: 700, padding: "2px 8px",
                                                borderRadius: 20
                                            }}>{t("completedBadge")}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                            {[
                                                { icon: "📚", text: res.subject },
                                                { icon: "📝", text: `${res.score}/${res.totalQuestions} ${t("correctSuffix")}` },
                                                { icon: "📊", text: `${pct}%` },
                                            ].map(item => (
                                                <span key={item.text} style={{
                                                    fontSize: 12, color: "rgba(255,255,255,0.7)",
                                                    display: "flex", alignItems: "center", gap: 4
                                                }}>
                                                    {item.icon} {item.text}
                                                </span>
                                            ))}
                                            {/* Grade badge */}
                                            <span style={{
                                                background: gradeColor, color: "#1e3a8a",
                                                fontSize: 12, fontWeight: 800, padding: "1px 10px",
                                                borderRadius: 20
                                            }}>{t("gradeLabel")} {grade}</span>
                                        </div>
                                    </div>
                                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                                        {new Date(res.submittedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ======================
               AI STUDENT ASSISTANT
            ====================== */}
            <div className="space-y-6">
                    <div className="card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-200">
                        <h2 className="text-xl font-semibold text-brand-800 mb-4 flex items-center gap-2">
                            🤖 {t("aiStudentAssistant")}
                        </h2>
                        
                        <div className="flex gap-2">
                            <input 
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && askAssistant()}
                                placeholder={t("aiStudentPlaceholder")}
                                className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-sm"
                            />
                            <button
                                onClick={askAssistant}
                                disabled={aiLoading}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:bg-purple-300"
                            >
                                {aiLoading ? t("aiThinking") : t("askBtn") || "Ask"}
                            </button>
                        </div>

                        {answer && (
                            <div className="mt-4 bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
                                <p className="text-purple-900 m-0 leading-relaxed whitespace-pre-wrap text-sm">{answer}</p>
                            </div>
                        )}
                    </div>

                </div>

        </div>

        <style>{`
            @keyframes livePulse {
                0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 6px #4ade80; }
                50%       { opacity: 0.5; transform: scale(1.4); box-shadow: 0 0 12px #4ade80; }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
            }
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(80px); }
                to   { opacity: 1; transform: translateX(0); }
            }
        `}</style>

        </>
    )

}