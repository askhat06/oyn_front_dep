import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { apiFetch } from "../lib/api";
import 'react-toastify/dist/ReactToastify.css';
function Registration() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

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

    if (!role) {
      alert("Please select a role.");
      return;
    }

    if (!formData.email || !formData.password) {
      alert("Email and password are required.");
      return;
    }

    // Spring Boot expects fullName, email, password, role
    let fullName = "User";
    if (role === "student" || role === "professor") {
      if (!formData.username) {
        alert("Username is required.");
        return;
      }
      fullName = formData.username;
    } else if (role === "company") {
      if (!formData.companyName) {
        alert("Company name is required.");
        return;
      }
      fullName = formData.companyName;
    }

    const newUser = {
      fullName,
      email: formData.email,
      password: formData.password,
      role: role.toUpperCase(), // backend might expect uppercase roles like STUDENT, PROFESSOR
    };

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      if (error.status === 429) {
        toast.error("Too many registration attempts. Please wait.");
      } else {
        toast.error(`Registration failed: ${error.message || "Unknown error"}`);
      }
    }
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
                style={{ backgroundImage: 'url(img/IndexPage/professor.jpg)' }}
              >
                <div className="reg-content">
                  <div className="reg-card-category">role</div>
                  <h3 className="reg-card-heading">PROFESSOR</h3>
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
                  <button type="submit">Register</button>
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