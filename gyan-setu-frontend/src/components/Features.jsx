import { useTranslation } from "react-i18next";

export default function Features() {
    const { t } = useTranslation();

    const features = [
        {
            icon: "📚",
            title: t("featInteractiveTitle"),
            text: t("featInteractiveText"),
            gradient: "from-blue-500 to-indigo-600",
            shadow: "shadow-blue-200"
        },
        {
            icon: "🎯",
            title: t("featPracticeTitle"),
            text: t("featPracticeText"),
            gradient: "from-rose-400 to-red-500",
            shadow: "shadow-rose-200"
        },
        {
            icon: "🤖",
            title: t("featAiTitle"),
            text: t("featAiText"),
            gradient: "from-emerald-400 to-teal-500",
            shadow: "shadow-emerald-200"
        },
        {
            icon: "🌍",
            title: t("featLocalTitle"),
            text: t("featLocalText"),
            gradient: "from-amber-400 to-orange-500",
            shadow: "shadow-amber-200"
        }
    ];

    return (
        <section className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
            
            {/* Background ambient blur */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white" />

            <div className="text-center mb-20 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
                        {t("whyLoveGyanSetu")}
                    </span>
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-brand-500 to-indigo-500 mx-auto rounded-full opacity-80" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((f, i) => (
                    <div
                        key={i}
                        className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-100 hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-2xl overflow-hidden"
                    >
                        {/* Subtle background glow on hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${f.gradient}`} />
                        
                        {/* Icon Container */}
                        <div 
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-lg ${f.shadow} bg-gradient-to-br ${f.gradient} transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 ease-out`}
                        >
                            <span className="drop-shadow-sm">{f.icon}</span>
                        </div>

                        <h3 className="font-bold text-xl mb-4 text-slate-800 tracking-tight group-hover:text-brand-700 transition-colors">
                            {f.title}
                        </h3>

                        <p className="text-slate-600 leading-relaxed">
                            {f.text}
                        </p>
                    </div>
                ))}
            </div>

        </section>
    );
}