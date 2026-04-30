import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import coursesData from "../data/courses.json"
import { useTranslation } from "react-i18next"

export default function CourseDetails(){

    const { id } = useParams()
    const { t, i18n } = useTranslation()
    const lang = i18n.language || "en"

    const [course, setCourse] = useState(null)

    useEffect(() => {
        let allCourses = []
        if (Array.isArray(coursesData)) {
            allCourses = coursesData
        } else if (coursesData?.courses && Array.isArray(coursesData.courses)) {
            allCourses = coursesData.courses
        }

        const selectedCourse = allCourses.find(
            (c) => c.id === id
        )

        setCourse(selectedCourse)

    }, [id])

    if (!course) {
        return (
            <div className="p-10 text-xl text-center">
                {t("loadingCourse")}
            </div>
        )
    }

    return (

        <section className="max-w-4xl mx-auto px-4 py-10">

            <h1 className="text-3xl font-bold mb-2">
                {course.title?.[lang] || course.title}
            </h1>

            <p className="text-gray-600 mb-6">
                {(course.subject?.[lang] || course.subject)} • {course.classLevel}
            </p>

            <h2 className="text-xl font-semibold mb-4">
                {t("chaptersTitle")}
            </h2>

            <div className="space-y-4">

                {course.chapters?.length > 0 ? (

                    course.chapters.map((chapter, index) => (

                        <Link
                            key={index}
                            to={`/quiz/${id}/${index}`}
                            className="border rounded-lg p-4 block hover:bg-gray-100 transition"
                        >

                            <h3 className="font-semibold">
                                {index + 1}. {chapter.chapterTitle?.[lang] || chapter.chapterTitle}
                            </h3>

                        </Link>

                    ))

                ) : (

                    <p className="text-gray-500">
                        {t("noChapters")}
                    </p>

                )}

            </div>

        </section>

    )
}