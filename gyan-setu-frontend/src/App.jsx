import { Route, Routes, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AITeacherWidget from "./components/AITeacherWidget";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import ChapterQuiz from "./pages/ChapterQuiz.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AIQuizGenerator from "./pages/AIQuizGenerator.jsx";
import AIExam from "./pages/AIExam.jsx";
import Test from "./pages/Test.jsx";

import { useAuth } from "./hooks/useAuth.js";

export default function App() {

    const { user } = useAuth();

    return (

        <div className="min-h-screen flex flex-col">

            <Navbar />

            <main className="flex-1">

                <Routes>

                    {/* HOME — redirect logged-in users to their dashboard */}
                    <Route
                        path="/"
                        element={
                            user
                                ? user.role === "TEACHER"
                                    ? <Navigate to="/teacher" replace />
                                    : user.role === "ADMIN"
                                        ? <Navigate to="/admin" replace />
                                        : <Navigate to="/student" replace />
                                : <Home />
                        }
                    />

                    {/* LOGIN */}
                    <Route
                        path="/login"
                        element={
                            user
                                ? user.role === "TEACHER"
                                    ? <Navigate to="/teacher" />
                                    : user.role === "ADMIN"
                                        ? <Navigate to="/admin" />
                                        : <Navigate to="/student" />
                                : <Login />
                        }
                    />

                    {/* REGISTER — removed; teacher registration is admin-only */}
                    <Route path="/register" element={<Navigate to="/login" replace />} />

                    {/* COURSES */}
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetails />} />

                    {/* QUIZ */}
                    <Route
                        path="/quiz/:courseId/:chapterIndex"
                        element={user ? <ChapterQuiz /> : <Navigate to="/login" />}
                    />

                    {/* ADMIN DASHBOARD */}
                    <Route
                        path="/admin"
                        element={
                            user && user.role === "ADMIN"
                                ? <AdminDashboard />
                                : <Navigate to="/login" />
                        }
                    />

                    {/* TEACHER DASHBOARD */}
                    <Route
                        path="/teacher"
                        element={
                            user && user.role === "TEACHER"
                                ? <TeacherDashboard />
                                : <Navigate to="/login" />
                        }
                    />

                    {/* STUDENT DASHBOARD */}
                    <Route
                        path="/student"
                        element={
                            user && user.role === "STUDENT"
                                ? <StudentDashboard />
                                : <Navigate to="/login" />
                        }
                    />

                    {/* AI QUIZ GENERATOR */}
                    <Route path="/ai-quiz" element={user ? <AIQuizGenerator /> : <Navigate to="/login" />} />

                    {/* AI EXAM — timed, personalized MCQ exam */}
                    <Route path="/exam/:examId" element={user ? <AIExam /> : <Navigate to="/login" />} />

                    {/* TEST PAGE */}
                    <Route path="/test/:id" element={user ? <Test /> : <Navigate to="/login" />} />

                    {/* FALLBACK ROUTE */}
                    <Route path="*" element={<Navigate to="/" />} />

                </Routes>

            </main>

            <Footer />

            {/* Floating AI teacher */}
            <AITeacherWidget />

        </div>

    );

}