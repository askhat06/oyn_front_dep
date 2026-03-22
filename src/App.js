import { BrowserRouter, Route, Routes } from "react-router-dom";
import IndexPage from "./Pages/IndexPage/IndexPage";
import GalleryPage from "./Pages/GalleryPage/GalleryPage";
import { createContext, useState, useEffect } from "react";
import Login from "./Components/Login";
import Registration from "./Components/Registration";
import AddGalleryItem from "./Pages/GalleryPage/AddGalleryItem";
import Edit from "./Components/Edit";
import PhotoshootsPage from "./Pages/PhotoshootsPage/PhotoshootsPage";
import EditPhoto from "./Pages/GalleryPage/EditPhoto";
import CompanyPage from "./Pages/CompanyPage/CompanyPage";
import ProfileSwitch from "./Components/ProfileSwitch";
import AddPhotoshoot from "./Pages/PhotoshootsPage/AddPhotoshoot";
import AddVacancy from "./Pages/CompanyPage/AddVacancy";
import Vacancies from "./Pages/CompanyPage/Vacancies";
import EditPhotoshoot from "./Pages/PhotoshootsPage/EditPhotoshoot";
import RefillBalance from "./Components/RefilBalance";
import { useSelector } from "react-redux";

import CourseCatalog from "./Pages/CoursePage/CourseCatalog";
import CourseLandingPage from "./Pages/CoursePage/CourseLandingPage";
import LessonViewer from "./Pages/LessonPage/LessonViewer";

export const AuthContext = createContext();
export const GalleryContext = createContext();
export const PhotoshootsContext = createContext();
export const CourseContext = createContext();

function App() {
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    document.body.className = theme; 
  }, [theme]);

  const [users, setUsers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [photoshoots, setPhotoshoots] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Legacy json-server endpoints (kept to prevent breaking existing functionality)
    fetch(`http://localhost:3001/gallery`)
      .then(response => response.json())
      .then(data => setGallery(data)).catch(() => console.log("Legacy gallery backend not running"));

    fetch(`http://localhost:3001/users`)
      .then(response => response.json())
      .then(data => setUsers(data)).catch(() => console.log("Legacy users backend not running"));

    fetch(`http://localhost:3001/photoshoots`)
      .then(response => response.json())
      .then(data => setPhotoshoots(data)).catch(() => console.log("Legacy photoshoots backend not running"));

    // Spring Boot endpoint for eLearning courses
    fetch(`http://localhost:7777/api/courses`)
      .then(response => response.json())
      .then(data => setCourses(data)).catch((e) => console.error("Spring Boot backend not running or /api/courses failed", e));
  }, [])

  return (

    <AuthContext.Provider value={{ users }}>
      <GalleryContext.Provider value={{ gallery, setGallery }}>
        <PhotoshootsContext.Provider value={{ photoshoots, setPhotoshoots }}>
          <CourseContext.Provider value={{ courses, setCourses }}>
            <div className="wrapper">
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/registration" element={<Registration />} />

                  <Route path="/" element={<IndexPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/add-item" element={< AddGalleryItem />} />
                  <Route path="/edit-photo/:id" element={<EditPhoto />} />

                  <Route path="/photoshoots" element={<PhotoshootsPage />} />
                  <Route path="/add-photoshoot" element={<AddPhotoshoot />} />
                  <Route path="/edit-photoshoot/:id" element={<EditPhotoshoot />} />

                  <Route path="/company" element={<CompanyPage />} />

                  <Route path="/refill-balance/:id" element={<RefillBalance />} />

                  <Route path="/profile/:role/:id" element={<ProfileSwitch />} />

                  <Route path="/add-vacancy" element={<AddVacancy />} />
                  <Route path="/all-vacancies/:id" element={<Vacancies />} />
                  <Route path="/edit" element={<Edit />} />

                  {/* eLearning MVP Routes */}
                  <Route path="/courses" element={<CourseCatalog />} />
                  <Route path="/courses/:slug" element={<CourseLandingPage />} />
                  <Route path="/courses/:courseSlug/lessons/:lessonSlug" element={<LessonViewer />} />

                </Routes>
              </BrowserRouter>
            </div>
          </CourseContext.Provider>
        </PhotoshootsContext.Provider>
      </GalleryContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;