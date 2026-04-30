import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useTranslation } from "react-i18next"

export default function Navbar(){

  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (


<header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-brand-100">

  <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

    <Link to="/" className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl bg-brand-500 grid place-content-center text-white font-bold">
        GS
      </div>
      <span className="font-display text-xl text-brand-700">
        Gyan Setu
      </span>
    </Link>

    <div className="flex items-center gap-4">

      {/* Courses */}
      <NavLink
        to="/courses"
        className="text-brand-700 hover:text-brand-900 font-semibold"
      >
        {t("courses")}
      </NavLink>

      {user?.role === "ADMIN" && (
        <NavLink
          to="/admin"
          className="text-brand-700 hover:text-brand-900 font-semibold"
        >
          {t("dashboardLink")}
        </NavLink>
      )}

      {/* 🌍 Language Switcher */}
      <div className="flex bg-indigo-50/50 border border-indigo-100 rounded-lg p-1 text-sm font-semibold shadow-sm">
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1 rounded-md transition-all ${
              i18n.language === 'en'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                  : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage('hi')}
          className={`px-3 py-1 rounded-md transition-all ${
              i18n.language === 'hi'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                  : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          हिंदी
        </button>
        <button
          onClick={() => changeLanguage('pa')}
          className={`px-3 py-1 rounded-md transition-all ${
              i18n.language === 'pa'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                  : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          ਪੰਜਾਬੀ
        </button>
      </div>

      {user ? (
        <>
          <span className="text-sm text-brand-700">
            {t("hiName", { name: user.fullName?.split(' ')[0] })}
          </span>

          <button
            onClick={logout}
            className="btn-primary !py-1"
          >
            {t("logout")}
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" className="pill">
            {t("loginLink")}
          </NavLink>
        </>
      )}

    </div>

  </nav>

</header>


  )
}
