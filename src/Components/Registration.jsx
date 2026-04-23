import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { apiFetch } from "../lib/api";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
function Registration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState(null);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: null,
    email: "",
    password: "",
    username: "",
    specialization: "",
    companyName: "",
    website: "",
  });

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setFormData({
      role: selectedRole,
      email: "",
      password: "",
    username: selectedRole === "student" || selectedRole === "professor" ? "" : undefined,
      specialization: selectedRole === "professor" ? "" : undefined,
      companyName: selectedRole === "company" ? "" : undefined,
      website: selectedRole === "company" ? "" : undefined,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function handleRegistration(e) {
    e.preventDefault();
    if (loading) return;

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    let fullName = "User";
    if (role === "student" || role === "professor") {
      if (!formData.username || !formData.username.trim()) {
        toast.error("Username is required.");
        return;
      }
      if (formData.username.trim().length < 2) {
        toast.error("Username must be at least 2 characters.");
        return;
      }
      fullName = formData.username.trim();
    } else if (role === "company") {
      if (!formData.companyName || !formData.companyName.trim()) {
        toast.error("Company name is required.");
        return;
      }
      fullName = formData.companyName.trim();
    }

    const ROLE_MAP = { student: "STUDENT", professor: "TEACHER", company: "COMPANY" };

    const newUser = {
      fullName,
      email: formData.email,
      password: formData.password,
      role: ROLE_MAP[role] ?? role.toUpperCase(),
    };

    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      if (data && data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        dispatch(setUser(data.user));
        navigate("/");
      } else {
        setAwaitingVerification(true);
      }
    } catch (error) {
      if (error.status === 409) {
        toast.error("This email is already registered. Try logging in instead.");
      } else if (error.status === 400) {
        toast.error(error.message || "Please check your details and try again.");
      } else if (error.status === 429) {
        toast.error("Too many registration attempts. Please wait a moment and try again.");
      } else {
        toast.error(error.message || "Could not connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (awaitingVerification) {
    return (
      <div className="login-page">
        <div className="login-box">
          <div className="login-container">
            <h2>Check your email</h2>
            <p>We've sent a verification link to your email. Click the link to activate your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      {!role && (
        <section className="reg-hero-section">
          <div className="reg-card-container">
            <div className="reg-card" onClick={() => handleRoleChange("student")}>
              <div
                className="reg-card-background"
                style={{ backgroundImage: 'url(img/IndexPage/user.jpg)' }}
              >
                <div className="reg-content">
                  <div className="reg-card-category">role</div>
                  <h3 className="reg-card-heading">STUDENT</h3>
                </div>
              </div>
            </div>

            <div className="reg-card" onClick={() => handleRoleChange("professor")}>
              <div
                className="reg-card-background"
                style={{ backgroundImage: 'url(img/IndexPage/professor.png)' }}
              >
                <div className="reg-content">
                  <div className="reg-card-category">role</div>
                  <h3 className="reg-card-heading">TEACHER</h3>
                </div>
              </div>
            </div>

            <div className="reg-card" onClick={() => handleRoleChange("company")}>
              <div
                className="reg-card-background"
                style={{ backgroundImage: 'url(img/IndexPage/company.jpg)' }}
              >
                <div className="reg-content">
                  <div className="reg-card-category">role</div>
                  <h3 className="reg-card-heading">COMPANY</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {role && (
        <div className="login-page">
          <div className="login-box">
            <form onSubmit={handleRegistration}>
              <div className="login-container">
                <h2>Registration</h2>

                {(role === "student" || role === "professor") && (
                  <div className="input-box">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                    <label>Username</label>
                  </div>
                )}

                <div className="input-box">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label>Email</label>
                </div>

                <div className="input-box">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label>Password</label>
                </div>

                {role === "professor" && (
                  <div className="input-box">
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    />
                    <label>Specialization</label>
                  </div>
                )}

                {role === "company" && (
                  <>
                    <div className="input-box">
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                      <label>Company name</label>
                    </div>
                    <div className="input-box">
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                      />
                      <label>Website</label>
                    </div>
                  </>
                )}

                <div className="login-btn">
                  <button type="submit" disabled={loading}>
                    {loading ? "Registering…" : "Register"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registration;