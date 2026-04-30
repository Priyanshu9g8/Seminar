import { useTranslation } from "react-i18next"

export default function WhySection(){

    const { t } = useTranslation()

    const items = [
        { icon: "📚", title: t("whyLessonsTitle"), text: t("whyLessonsText") },
        { icon: "🤖", title: t("whyAITitle"), text: t("whyAIText") },
        { icon: "🎯", title: t("whyQuizTitle"), text: t("whyQuizText") }
    ]

    return (

        <section className="bg-gray-50 py-14 mt-10">

            <div className="max-w-6xl mx-auto px-4">

                <h2 className="text-3xl font-bold text-center text-brand-800 mb-10">
                    {t("whyTitle")}
                </h2>

                <div className="grid md:grid-cols-3 gap-8">

                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition text-center"
                        >

                            <div className="text-4xl mb-3">{item.icon}</div>

                            <h3 className="font-semibold text-lg text-brand-800 mb-2">
                                {item.title}
                            </h3>

                            <p className="text-gray-600 text-sm">
                                {item.text}
                            </p>

                        </div>
                    ))}

                </div>

            </div>

        </section>

    )
}