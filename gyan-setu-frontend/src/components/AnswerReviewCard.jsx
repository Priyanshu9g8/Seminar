import { useTranslation } from "react-i18next"

export default function AnswerReviewCard({
                                             question,
                                             options,
                                             correct,
                                             userAnswer,
                                             index,
                                             lang
                                         }) {

    const { t } = useTranslation()

    return (

        <div className="bg-white shadow-lg rounded-2xl p-6 border">

            {/* QUESTION */}

            <h3 className="font-semibold mb-4 text-lg">
                {index + 1}. {question?.[lang] || question}
            </h3>

            {/* OPTIONS GRID */}

            <div className="grid md:grid-cols-2 gap-4">

                {Object.entries(options).map(([key,opt]) => {

                    let style =
                        "p-4 rounded-xl border transition text-left"

                    if(key === correct){
                        style += " bg-green-100 border-green-500"
                    }

                    if(key === userAnswer && key !== correct){
                        style += " bg-red-100 border-red-500"
                    }

                    return (

                        <div key={key} className={style}>

              <span className="font-semibold mr-2">
                {key}.
              </span>

                            {opt?.[lang] || opt}

                        </div>

                    )

                })}

            </div>

            {/* ANSWER INFO */}

            <div className="mt-4 text-sm">

                <p>
          <span className="font-semibold">
            {t("yourAnswer")} :
          </span>{" "}
                    {userAnswer || t("notAnswered")}
                </p>

                <p className="text-green-600">
          <span className="font-semibold">
            {t("correctAnswer")} :
          </span>{" "}
                    {correct}
                </p>

            </div>

        </div>

    )

}