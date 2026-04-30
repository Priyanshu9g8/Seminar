import { useState } from "react"
import { useTranslation } from "react-i18next"
import { generateQuiz as apiGenerateQuiz } from "../api/axios"

export default function AIQuizGenerator(){

    const { t, i18n } = useTranslation()

    const [topic, setTopic] = useState("")
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(false)

    async function generateQuiz(){

        if(!topic) return

        setLoading(true)

        try{
            const data = await apiGenerateQuiz(topic, i18n.language)
            setQuestions(data.questions || [])
        }catch(err){
            console.error("Failed to generate quiz", err)
        }

        setLoading(false)
    }

    return(

        <div className="max-w-3xl mx-auto p-6">

            <h1 className="text-3xl font-bold mb-6">
                {t("aiQuizGenerator")}
            </h1>

            <div className="flex gap-3 mb-6">

                <input
                    type="text"
                    placeholder={t("enterTopic")}
                    className="border rounded-lg px-4 py-2 flex-1"
                    value={topic}
                    onChange={(e)=>setTopic(e.target.value)}
                />

                <button
                    onClick={generateQuiz}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    {loading ? t("generating") : t("generateQuiz")}
                </button>

            </div>

            <div className="space-y-4">

                {questions.map((q,index)=>(
                    <div key={index} className="border p-4 rounded-lg">

                        <p className="font-semibold">
                            {index+1}. {q.question}
                        </p>

                        <ul className="mt-2 space-y-1">
                            {q.options.map((opt,i)=>(
                                <li key={i}>• {opt}</li>
                            ))}
                        </ul>

                    </div>
                ))}

            </div>

        </div>

    )
}