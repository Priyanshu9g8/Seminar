import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useTranslation } from 'react-i18next'

export default function Login(){

  const { t } = useTranslation()

  const { login } = useAuth()
  const nav = useNavigate()

  const [form, setForm] = useState({
    username: '',
    password: ''
  })

  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()

    setError(null)
    setBusy(true)

    try {

      const user = await login(
          form.username.trim(),
          form.password
      )

      // Role Based Redirect
      if (user.role === "TEACHER") {
        nav("/teacher")
      }
      else if (user.role === "STUDENT") {
        nav("/student")
      }
      else if (user.role === "ADMIN") {
        nav("/admin")
      }
      else {
        setError(t("invalidRole"))
      }

    }
    catch (err) {

      setError(
          err?.response?.data?.message || t("loginFailed")
      )

    }
    finally {
      setBusy(false)
    }
  }

  return (

      <div className="max-w-md mx-auto px-4 py-10">

        <div className="card p-6">

          <h2 className="font-display text-2xl text-brand-800 mb-4">
            {t("welcomeBack")}
          </h2>

          {error && (
              <div className="mb-3 text-sm text-red-600">
                {error}
              </div>
          )}

          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-brand-800">
                {t("usernameLabel")}
              </label>

              <input
                  required
                  value={form.username}
                  onChange={e =>
                      setForm({...form, username:e.target.value})
                  }
                  className="w-full mt-1 rounded-xl border border-brand-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-800">
                {t("passwordLabel")}
              </label>

              <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e =>
                      setForm({...form, password:e.target.value})
                  }
                  className="w-full mt-1 rounded-xl border border-brand-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <button
                disabled={busy}
                className="btn-primary w-full"
            >
              {busy ? t("signingIn") : t("loginButton")}
            </button>

          </form>

          <p className="text-sm mt-4 text-brand-700/80">
            {t("studentNoReg")}
          </p>

        </div>

      </div>
  )
}