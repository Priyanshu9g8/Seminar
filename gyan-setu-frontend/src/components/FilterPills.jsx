import { useTranslation } from "react-i18next"

export default function FilterPills({ value, onChange }) {

  const { i18n } = useTranslation()

  // Ensure language fallback
  const lang = ["en", "hi", "pa"].includes(i18n.language)
      ? i18n.language
      : "en"

  const classes = [
    { key: "ALL", label: { en: "All Classes", hi: "सभी कक्षाएं", pa: "ਸਾਰੀਆਂ ਕਲਾਸਾਂ" } },
    { key: "CLASS_1", label: { en: "Class 1", hi: "कक्षा 1", pa: "ਕਲਾਸ 1" } },
    { key: "CLASS_2", label: { en: "Class 2", hi: "कक्षा 2", pa: "ਕਲਾਸ 2" } },
    { key: "CLASS_3", label: { en: "Class 3", hi: "कक्षा 3", pa: "ਕਲਾਸ 3" } },
    { key: "CLASS_4", label: { en: "Class 4", hi: "कक्षा 4", pa: "ਕਲਾਸ 4" } },
    { key: "CLASS_5", label: { en: "Class 5", hi: "कक्षा 5", pa: "ਕਲਾਸ 5" } },
    { key: "CLASS_6", label: { en: "Class 6", hi: "कक्षा 6", pa: "ਕਲਾਸ 6" } },
    { key: "CLASS_7", label: { en: "Class 7", hi: "कक्षा 7", pa: "ਕਲਾਸ 7" } },
    { key: "CLASS_8", label: { en: "Class 8", hi: "कक्षा 8", pa: "ਕਲਾਸ 8" } }
  ]

  return (

      <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border border-brand-200 rounded px-3 py-2 text-sm bg-white"
      >

        {classes.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label[lang] || c.label.en}
            </option>
        ))}

      </select>

  )

}