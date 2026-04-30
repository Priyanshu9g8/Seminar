import { useTranslation } from "react-i18next"

export default function QuestionNavigator({
                                              questions,
                                              currentQuestion,
                                              answers,
                                              setCurrentQuestion
                                          }) {

    const { t } = useTranslation()

    return (


<div className="bg-white rounded-2xl shadow-xl p-8 border w-full sticky top-24">

  {/* TITLE */}
  <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">
    {t("questionNavigator")}
  </h3>

  {/* GRID */}
  <div className="grid grid-cols-6 gap-5 justify-items-center mt-4">

    {questions.map((q, index) => {

      let style = "bg-gray-100 border-gray-300 text-gray-700"

      if (index === currentQuestion) {
        style = "bg-blue-500 text-white border-blue-500 shadow-md"
      }
      else if (answers[index]) {
        style = "bg-green-500 text-white border-green-500"
      }

      return (

        <button
          key={index}
          onClick={() => setCurrentQuestion(index)}
          className={`
    w-12 h-12 rounded-xl border font-semibold text-sm
    flex items-center justify-center
    hover:scale-105 hover:shadow-md
    transition-all duration-200
    ${style}
    `}
        >
          {index + 1}
        </button>

      )

    })}

  </div>

  {/* LEGEND */}
  <div className="mt-8 space-y-3 text-sm text-gray-700">

    <div className="flex items-center gap-3">
      <div className="w-4 h-4 bg-blue-500 rounded"></div>
      <span>{t("current")}</span>
    </div>

    <div className="flex items-center gap-3">
      <div className="w-4 h-4 bg-green-500 rounded"></div>
      <span>{t("answered")}</span>
    </div>

    <div className="flex items-center gap-3">
      <div className="w-4 h-4 bg-gray-300 rounded"></div>
      <span>{t("notAnswered")}</span>
    </div>

  </div>

</div>

)

}
