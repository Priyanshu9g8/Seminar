import { useTranslation } from "react-i18next";

export default function Footer(){
  const { t } = useTranslation();
  return (
    <footer className="border-t border-brand-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-brand-700 flex flex-col sm:flex-row items-center justify-between">
        <p>© {new Date().getFullYear()} Gyan Setu – Kids Learning</p>
        <p className="opacity-80">{t("madeWithLove")}</p>
      </div>
    </footer>
  )
}
