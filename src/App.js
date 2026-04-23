import { BrowserRouter, Route, Routes } from "react-router-dom";
import IndexPage from "./Pages/IndexPage/IndexPage";
import { createContext, useState, useEffect } from "react";
import Login from "./Components/Login";
import Registration from "./Components/Registration";
import Edit from "./Components/Edit";
import CompanyPage from "./Pages/CompanyPage/CompanyPage";
import ProfileSwitch from "./Components/ProfileSwitch";
import AddVacancy from "./Pages/CompanyPage/AddVacancy";
import Vacancies from "./Pages/CompanyPage/Vacancies";
import RefillBalance from "./Components/RefilBalance";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "./redux/userSlice";
import { apiFetch } from "./lib/api";

import CourseCatalog from "./Pages/CoursePage/CourseCatalog";
import CourseLandingPage from "./Pages/CoursePage/CourseLandingPage";
import LessonViewer from "./Pages/LessonPage/LessonViewer";
import VerifyEmail from "./Pages/VerifyEmailPage/VerifyEmail";
import AboutPlatform from "./Pages/About/AboutPlatform";

export const AuthContext = createContext();
export const CourseContext = createContext();

function App() {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Session Hydration
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiFetch("/api/auth/me")
        .then(user => dispatch(setUser(user)))
        .catch(err => {
          console.error("Session hydration failed", err);
        });
    }
  }, [dispatch]);

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    apiFetch("/api/courses")
      .then(data => setCourses(data))
      .catch((e) => console.error("Spring Boot backend not running or /api/courses failed", e));
  }, []);

  return (
    <AuthContext.Provider value={{}}>
      <CourseContext.Provider value={{ courses, setCourses }}>
        <div className="wrapper">
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route path="/" element={<IndexPage />} />

              <Route path="/about" element={<AboutPlatform />} />

              <Route path="/refill-balance/:id" element={<RefillBalance />} />
              <Route path="/profile/:role/:id" element={<ProfileSwitch />} />

              <Route path="/add-vacancy" element={<AddVacancy />} />
              <Route path="/all-vacancies/:id" element={<Vacancies />} />
              <Route path="/edit" element={<Edit />} />

              {/* eLearning Routes */}
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:slug" element={<CourseLandingPage />} />
              <Route path="/courses/:courseSlug/lessons/:lessonSlug" element={<LessonViewer />} />
            </Routes>
          </BrowserRouter>
        </div>
      </CourseContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
