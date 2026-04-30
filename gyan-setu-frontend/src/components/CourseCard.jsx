import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function CourseCard({ course }) {

    const { t, i18n } = useTranslation()
    const lang = i18n.language || "en"

    const subject = course.subject?.toLowerCase()

    let image = "/images/learn1.jpg"

    if (subject === "mathematics") image = "/images/maths1.jpg"
    if (subject === "english") image = "/images/english1.jpg"
    if (subject === "evs") image = "/images/evs1.jpg"
    if (subject === "science") image = "/images/science1.jpg"

    return (

        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition group">

            {/* Image Section */}
            <div className="relative overflow-hidden">

                <img
                    src={image}
                    alt={course.title?.[lang] || course.title?.en}
                    className="w-full h-44 object-cover transform group-hover:scale-105 transition duration-300"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                {/* AI Badge */}
                <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-md shadow">
          🤖 {t("aiLearning")}
        </span>

                {/* Class Badge */}
                <span className="absolute bottom-3 left-3 bg-white text-gray-700 text-xs px-2 py-1 rounded shadow">
          {t(`class_${course.classLevel}`)}
        </span>

            </div>

            {/* Content */}
            <div className="p-4 space-y-2">

                {/* Title */}
                <h3 className="font-semibold text-lg text-gray-800">
                    {typeof course.title === 'string' ? course.title : (course.title?.[lang] || course.title?.en || "Course Title")}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">
                    {typeof course.description === 'string' ? course.description : (course.description?.[lang] || course.description?.en || t("courseDescription"))}
                </p>

                {/* Subject Badge */}
                <div className="flex justify-between items-center pt-2">

          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold">
            {t(`subject_${course.subject}`)}
          </span>

                </div>

                {/* Explore Button */}
                <Link
                    to={`/courses/${course.id}`}
                    className="block mt-3 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition transform group-hover:translate-y-0.5"
                >
                    {t("explore")}
                </Link>

            </div>

        </div>

    )
}