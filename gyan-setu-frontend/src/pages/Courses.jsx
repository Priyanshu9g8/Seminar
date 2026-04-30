import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import coursesData from "../data/courses.json"

import CourseCard from "../components/CourseCard.jsx"
import Loader from "../components/Loader.jsx"
import EmptyState from "../components/EmptyState.jsx"
import FilterPills from "../components/FilterPills.jsx"

export default function Courses() {

  const { t } = useTranslation()

  const [filter, setFilter] = useState("ALL")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    setLoading(true)

    try {

      let allCourses = []

      if (Array.isArray(coursesData)) {
        allCourses = coursesData
      }
      else if (coursesData?.courses && Array.isArray(coursesData.courses)) {
        allCourses = coursesData.courses
      }
      else if (coursesData) {
        allCourses = [coursesData]
      }

      let filteredCourses = allCourses

      if (filter !== "ALL") {
        filteredCourses = allCourses.filter(
            (course) => course.classLevel === filter
        )
      }

      setItems(filteredCourses)

    } catch (error) {

      console.error("Course loading error:", error)
      setItems([])

    } finally {

      setLoading(false)

    }

  }, [filter])

  // Group courses by class
  const groupedCourses = items.reduce((acc, course) => {

    const key = course.classLevel || "OTHER"

    if (!acc[key]) {
      acc[key] = []
    }

    acc[key].push(course)

    return acc

  }, {})

  return (

      <section className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">

          <div>
            <h2 className="font-display text-3xl text-brand-800">
              {t("courses")}
            </h2>

            <p className="text-brand-700/80">
              {t("freeLessons")}
            </p>
          </div>

          <FilterPills
              value={filter}
              onChange={setFilter}
          />

        </div>

        {/* Loader */}
        {loading && <Loader />}

        {/* Empty State */}
        {!loading && items.length === 0 && (
            <EmptyState
                title={t("noCourses")}
                subtitle={t("tryDifferent")}
            />
        )}

        {/* Grouped Courses */}
        {!loading && Object.keys(groupedCourses).map((cls) => (

            <div key={cls} className="mb-10">

              {/* Class Title */}
              <h3 className="text-xl font-semibold mb-4 text-brand-700">
                {t(`class_${cls}`)}
              </h3>

              {/* Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {groupedCourses[cls].map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                    />
                ))}

              </div>

            </div>

        ))}

      </section>

  )
}