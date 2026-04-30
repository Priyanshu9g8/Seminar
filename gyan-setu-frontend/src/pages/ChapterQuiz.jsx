import { useParams } from "react-router-dom"
import coursesData from "../data/courses.json"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import QuestionNavigator from "../components/QuestionNavigator"
import { useAuth } from "../hooks/useAuth.js"
import api from "../api/axios"

export default function ChapterQuiz(){

    const { courseId, chapterIndex } = useParams()
    const { t, i18n } = useTranslation()
    const { user } = useAuth()

    const lang = i18n.language || "en"

    const course = coursesData.find(c => c.id === courseId)
    const chapter = course?.chapters?.[Number(chapterIndex)]

    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selected, setSelected] = useState(null)
    const [answers, setAnswers] = useState({})
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(60)
    const [violations, setViolations] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const isQuizActive = currentQuestion < chapter.questions.length

    // Prevent Exit
    useEffect(() => {
        if (!isQuizActive) return
        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = t("exitWarning")
            return t("exitWarning")
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isQuizActive, t])

    // Tab Switching
    useEffect(() => {
        if (!isQuizActive) return
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setViolations(v => v + 1)
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [isQuizActive])

    // Monitor Fullscreen
    useEffect(() => {
        if (!isQuizActive) return
        const handleFS = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", handleFS)
        return () => document.removeEventListener("fullscreenchange", handleFS)
    }, [isQuizActive])

    const enterFullscreen = () => {
        const el = document.documentElement
        if (el.requestFullscreen) el.requestFullscreen()
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
        else if (el.msRequestFullscreen) el.msRequestFullscreen()
    }

    if(!chapter){
        return <div className="p-10 text-center">{t("chapterNotFound")}</div>
    }

    const question = chapter.questions[currentQuestion]

    /* TIMER */

    useEffect(() => {

        if(!question) return

        if(timeLeft === 0){

            if(currentQuestion < chapter.questions.length - 1){
                handleNext()
            }else{
                handleSubmit()
            }

            return
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1)
        },1000)

        return () => clearTimeout(timer)

    },[timeLeft, currentQuestion])

    // Auto-submit on violations
    useEffect(() => {
        if (violations >= 5 && isQuizActive) {
            alert(t("autoSubmitted"))
            handleSubmit()
        } else if (violations > 0 && isQuizActive) {
            alert(t("tabSwitchWarning", { count: violations }))
        }
    }, [violations, isQuizActive, t])



    /* Sync selected when question changes */

    useEffect(()=>{
        setSelected(answers[currentQuestion] || null)
    },[currentQuestion, answers])



    function handleSelect(option){

        setSelected(option)

        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: option
        }))
    }



    function handleNext(){

        if(currentQuestion < chapter.questions.length - 1){

            setCurrentQuestion(prev => prev + 1)
            setTimeLeft(60)

        }
    }



    function handlePrevious(){

        if(currentQuestion > 0){

            setCurrentQuestion(prev => prev - 1)
            setTimeLeft(60)

        }
    }



    function handleSubmit(){

        let finalScore = 0

        chapter.questions.forEach((q,index)=>{
            if(answers[index] === q.answer){
                finalScore++
            }
        })

        setScore(finalScore)
        setCurrentQuestion(chapter.questions.length)

        if (user?.id) {
            api.post("/results", {
                studentId: user.id,
                assignmentId: null,
                score: finalScore,
                totalQuestions: chapter.questions.length
            }).catch(err => console.error("Failed to save result", err))
        }
    }



    return (
        <section className="max-w-[1200px] mx-auto p-6">
            {/* Fullscreen Overlay */}
            {!isFullscreen && isQuizActive && (
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

            <h1 className="text-2xl font-bold mb-6 text-brand-800">
                {chapter.chapterTitle?.[lang] || chapter.chapterTitle}
            </h1>


            {question ? (

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 items-start">

                    {/* QUIZ AREA */}

                    <div>

                        {/* Progress */}

                        <div className="mb-6">

                            <div className="flex justify-between text-sm mb-1">
                                <span>{t("progress")}</span>
                                <span>{currentQuestion + 1} / {chapter.questions.length}</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded h-3">
                                <div
                                    className="bg-blue-500 h-3 rounded"
                                    style={{
                                        width:`${((currentQuestion+1)/chapter.questions.length)*100}%`
                                    }}
                                />
                            </div>

                        </div>


                        {/* TIMER */}

                        <div className="mb-4 text-sm text-red-600 font-semibold">
                            ⏱ {t("quizTimer")} : {timeLeft}s
                        </div>


                        {/* QUESTION */}

                        <h2 className="text-lg font-semibold mb-6">
                            {question.question?.[lang] || question.question}
                        </h2>


                        {/* OPTIONS FLOATING BOXES */}

                        <div className="grid md:grid-cols-2 gap-4">

                            {Object.entries(question.options).map(([key,opt]) => (

                                <button
                                    key={key}
                                    onClick={()=>handleSelect(key)}
                                    className={`p-4 rounded-xl border shadow-sm text-left transition hover:shadow-md
${selected === key ? "bg-blue-100 border-blue-500" : "bg-white"}
`}
                                >
                                    <span className="font-semibold mr-2">{key}.</span>
                                    {opt?.[lang] || opt}
                                </button>

                            ))}

                        </div>


                        {/* NAVIGATION */}

                        <div className="flex justify-between mt-6">

                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className="bg-gray-200 px-4 py-2 rounded"
                            >
                                {t("quizPrevious")}
                            </button>


                            {currentQuestion === chapter.questions.length - 1 ? (

                                <button
                                    onClick={handleSubmit}
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    {t("quizSubmit")}
                                </button>

                            ) : (

                                <button
                                    onClick={handleNext}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    {t("quizNext")}
                                </button>

                            )}

                        </div>

                    </div>


                    {/* NAVIGATOR */}

                    <QuestionNavigator
                        questions={chapter.questions}
                        currentQuestion={currentQuestion}
                        answers={answers}
                        setCurrentQuestion={setCurrentQuestion}
                    />

                </div>

            ) : (

                /* QUIZ RESULT + FLOATING ANSWER CARDS */

                <div>

                    <h2 className="text-2xl font-bold mb-4 text-center">
                        🎉 {t("quizCompleted")}
                    </h2>

                    <p className="text-lg mb-8 text-center">
                        {t("quizScore")}: {score} / {chapter.questions.length}
                    </p>

                    <div className="space-y-6">

                        {chapter.questions.map((q,index)=>{

                            const userAnswer = answers[index]
                            const correct = q.answer

                            return(

                                <div key={index} className="bg-white border rounded-2xl shadow-md p-6">

                                    <p className="font-semibold mb-4 text-lg">
                                        {index+1}. {q.question?.[lang] || q.question}
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-3">

                                        {Object.entries(q.options).map(([key,opt])=>{

                                            let style = "p-3 rounded-lg border"

                                            if(key === correct){
                                                style += " bg-green-100 border-green-500"
                                            }

                                            if(key === userAnswer && key !== correct){
                                                style += " bg-red-100 border-red-500"
                                            }

                                            return(

                                                <div key={key} className={style}>
                                                    <span className="font-semibold mr-2">{key}.</span>
                                                    {opt?.[lang] || opt}
                                                </div>

                                            )

                                        })}

                                    </div>

                                    <p className="mt-3 text-sm">
                                        {t("yourAnswer")}: {userAnswer || t("notAnswered")}
                                    </p>

                                    <p className="text-sm text-green-600">
                                        {t("correctAnswer")}: {correct}
                                    </p>

                                </div>

                            )

                        })}

                    </div>

                </div>

            )}

        </section>

    )

}