import { useParams } from "react-router-dom";
import PhotographerProfile from "../Pages/PhotographerPage/PhotographerProfile";
import CompanyProfile from "../Pages/CompanyPage/CompanyProfile";
import UserProfile from "../Pages/UserPage/UserProfile";
import Header from "./Header";
import Footer from "./Footer";

function ProfileSwitch() {
  const { role } = useParams();
  const normalizedRole = role?.toLowerCase();

  let ProfileComponent = null;
  if (normalizedRole === "company") ProfileComponent = <CompanyProfile />;
  else if (normalizedRole === "professor") ProfileComponent = <PhotographerProfile />;
  else if (normalizedRole === "user" || normalizedRole === "student") ProfileComponent = <UserProfile />;

  if (!ProfileComponent) return (
    <>
      <Header />
      <p style={{ padding: "2rem" }}>404 — Unknown role: {role}</p>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      {ProfileComponent}
      <Footer />
    </>
  );
}

export default ProfileSwitch;


