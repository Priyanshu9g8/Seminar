
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useTranslation } from 'react-i18next'

export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const nav = useNavigate()

  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await register(form)
      nav('/teacher')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="card p-6">

        {/* Teacher-only banner */}
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <span className="text-xl leading-none mt-0.5">🎓</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">{t("teacherRegOnly")}</p>
            <p className="text-amber-700 text-xs mt-0.5">
              {t("teacherRegDesc")}{' '}
              <Link to="/login" className="underline font-semibold">
                {t("goToLogin")}
              </Link>
            </p>
          </div>
        </div>

        <h2 className="font-display text-2xl text-brand-800 mb-4">
          {t("teacherRegTitle")}
        </h2>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-brand-800">{t("fullName")}</label>
            <input
              required
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder={t("egPriya")}
              className="w-full mt-1 rounded-xl border border-brand-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-800">{t("usernameLabel")}</label>
            <input
              required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder={t("egTeacherPriya")}
              className="w-full mt-1 rounded-xl border border-brand-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-800">{t("emailLabel")} <span className="font-normal text-brand-500">{t("optionalText")}</span></label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder={t("egEmail")}
              className="w-full mt-1 rounded-xl border border-brand-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-800">{t("passwordLabel")}</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder={t("min6chars")}
              className="w-full mt-1 rounded-xl border border-brand-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* Role badge — always TEACHER, read-only */}
          <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">
            <span className="text-sm font-semibold text-brand-700">{t("roleLabel")}</span>
            <span className="text-sm bg-brand-500 text-white px-2 py-0.5 rounded-full font-semibold">
              TEACHER
            </span>
            <span className="text-xs text-brand-500 ml-auto">{t("autoAssigned")}</span>
          </div>

          <button disabled={busy} className="btn-primary w-full">
            {busy ? t("creatingAccount") : t("registerTeacherBtn")}
          </button>
        </form>

        <p className="text-sm mt-4 text-brand-700/80">
          {t("alreadyHaveAccount")}{' '}
          <Link to="/login" className="text-brand-700 font-semibold">
            {t("loginButton")}
          </Link>
        </p>

      </div>
    </div>
  )
}
