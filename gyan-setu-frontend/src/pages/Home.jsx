import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Features from "../components/Features"

export default function Home(){

  const { t } = useTranslation()

  return (

      <>

        <section className="relative overflow-hidden bg-brand-50 pt-20 pb-28 sm:pt-32 sm:pb-36 lg:pb-40">
          
          {/* Subtle Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-[1200px] h-[600px] bg-gradient-to-b from-white/80 to-transparent blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-300/40 rounded-full blur-3xl opacity-50 pointer-events-none mix-blend-multiply" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl opacity-50 pointer-events-none mix-blend-multiply" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

              {/* LEFT CONTENT */}
              <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left space-y-8 z-10">

                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  <span className="block mb-2 text-brand-800">{t("heroTitle")}</span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 pb-2">
                    ✨
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t("heroSubtitle")}
                </p>

                {/* Stylish Feature Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm font-medium">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-brand-100 rounded-full text-brand-700 shadow-sm transition-transform hover:-translate-y-0.5">
                    <span className="text-lg">📚</span> {t("learnLabel")}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-full text-indigo-700 shadow-sm transition-transform hover:-translate-y-0.5">
                    <span className="text-lg">🎯</span> {t("practiceLabel")}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-rose-100 rounded-full text-rose-700 shadow-sm transition-transform hover:-translate-y-0.5">
                    <span className="text-lg">🤖</span> {t("askAiLabel")}
                  </div>
                </div>

                {/* Call To Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link
                      to="/courses"
                      className="w-full sm:w-auto text-center px-8 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-full shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-1 transition-all duration-300"
                  >
                    {t("browseCourses")}
                  </Link>

                  <Link
                      to="/login"
                      className="w-full sm:w-auto text-center px-8 py-3.5 bg-white text-slate-700 font-semibold rounded-full shadow-sm border border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:-translate-y-1 transition-all duration-300"
                  >
                    {t("login") || "Login"}
                  </Link>
                </div>

              </div>

              {/* RIGHT IMAGE WITH GLASS EFFECT */}
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                {/* Decorative Ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-100 to-indigo-100 rounded-[2.5rem] transform rotate-3 scale-105 opacity-50 blur-lg transition-transform hover:rotate-6 duration-700" />
                
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 bg-white/20 backdrop-blur-sm group">
                  
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                  <img
                      src="/images/learn1.jpg"
                      alt="Kids learning"
                      className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Floating Badge */}
                  <div className="absolute bottom-6 -left-2 sm:-left-6 z-20">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/40 flex items-center gap-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-xl">
                        🚀
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {t("heroClasses")}
                        <div className="text-xs text-brand-600 font-medium tracking-wide uppercase">Join Today</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <Features />

      </>

  )
}