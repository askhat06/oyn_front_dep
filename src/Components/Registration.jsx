import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { apiFetch } from "../lib/api";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import "./Auth.css";

function Registration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState(null);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    role: null, email: "", password: "", username: "",
    specialization: "", companyName: "", website: "",
  });

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setFormData({
      role: selectedRole, email: "", password: "",
      username: selectedRole === "student" || selectedRole === "professor" ? "" : undefined,
      specialization: selectedRole === "professor" ? "" : undefined,
      companyName: selectedRole === "company" ? "" : undefined,
      website: selectedRole === "company" ? "" : undefined,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function handleRegistration(e) {
    e.preventDefault();
    if (loading) return;
    if (!formData.email || !formData.password) { toast.error("Email and password are required."); return; }
    if (formData.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }

    let fullName = "User";
    if (role === "student" || role === "professor") {
      if (!formData.username?.trim()) { toast.error("Username is required."); return; }
      if (formData.username.trim().length < 2) { toast.error("Username must be at least 2 characters."); return; }
      fullName = formData.username.trim();
    } else if (role === "company") {
      if (!formData.companyName?.trim()) { toast.error("Company name is required."); return; }
      fullName = formData.companyName.trim();
    }

    const ROLE_MAP = { student: "STUDENT", professor: "TEACHER", company: "COMPANY" };
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email: formData.email, password: formData.password, role: ROLE_MAP[role] }),
      });
      if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
        dispatch(setUser(data.user));
        navigate("/");
      } else {
        setAwaitingVerification(true);
      }
    } catch (error) {
      if (error.status === 409) toast.error("This email is already registered.");
      else if (error.status === 400) toast.error(error.message || "Please check your details.");
      else if (error.status === 429) toast.error("Too many attempts. Please wait.");
      else toast.error(error.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Email verification screen
  if (awaitingVerification) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-brand">OYAN</div>
          <h1 className="auth-tagline">Almost there!</h1>
          <p className="auth-sub">Just one more step to join our community.</p>
        </div>
        <div className="auth-right">
          <div className="auth-form-box">
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <h2 className="auth-title">Check your email</h2>
            <p style={{ color: "#64748b", marginBottom: 8 }}>We've sent a verification link to</p>
            <p style={{ fontWeight: 600, color: "#1e293b", marginBottom: 32 }}>{formData.email}</p>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>
              Click the link in your email to activate your account.
            </p>
            <button className="auth-submit-btn" onClick={() => navigate("/login")}>
              Go to Login →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Role selection screen
  if (!role) {
    return (
      <div>
        <ToastContainer />
        <section className="reg-hero-section">
          <div className="reg-card-container">
            <div className="reg-card" onClick={() => handleRoleChange("student")}>
              <div className="reg-card-background" style={{ backgroundImage: 'url(img/IndexPage/user.jpg)' }}>
                <div className="reg-content">
                  <div className="reg-card-category">role</div>
                  <h3 className="reg-card-heading">STUDENT</h3>
                </div>
              </div>
            </div>
            <div className="reg-card" onClick={() => handleRoleChange("professor")}>
              <div className="reg-card-background" style={{ backgroundImage: 'url(img/IndexPage/professor.png)' }}>
                <div className="reg-content">
                  <div className="reg-card-category">role</div>
                  <h3 className="reg-card-heading">TEACHER</h3>
                </div>
              </div>
            </div>
            <div className="reg-card" onClick={() => handleRoleChange("company")}>
              <div className="reg-card-background" style={{ backgroundImage: 'url(img/IndexPage/company.jpg)' }}>
                <div className="reg-content">
                  <div className="reg-card-category">role</div>
                  <h3 className="reg-card-heading">COMPANY</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Registration form
  const roleLabels = { student: "🎓 Student", professor: "👨‍🏫 Teacher", company: "🏢 Company" };

  return (
    <div className="auth-page">
      <ToastContainer />
      <div className="auth-left">
        <div className="auth-brand">OYAN</div>
        <h1 className="auth-tagline">Start your journey.</h1>
        <p className="auth-sub">Create your account and unlock a world of knowledge.</p>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">
            Registering as{" "}
            <span style={{ fontWeight: 600, color: "#0f3460" }}>{roleLabels[role]}</span>
          </p>

          {(role === "student" || role === "professor") && (
            <div className="auth-field">
              <label className="auth-label">Username</label>
              <input type="text" name="username" value={formData.username}
                onChange={handleChange} placeholder="Your name" className="auth-input" required />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="you@example.com" className="auth-input" required />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <input type={showPassword ? "text" : "password"} name="password"
                value={formData.password} onChange={handleChange}
                placeholder="Min. 8 characters" className="auth-input" required />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {role === "professor" && (
            <div className="auth-field">
              <label className="auth-label">Specialization</label>
              <input type="text" name="specialization" value={formData.specialization}
                onChange={handleChange} placeholder="e.g. Mathematics" className="auth-input" required />
            </div>
          )}

          {role === "company" && (
            <>
              <div className="auth-field">
                <label className="auth-label">Company name</label>
                <input type="text" name="companyName" value={formData.companyName}
                  onChange={handleChange} placeholder="Your company" className="auth-input" required />
              </div>
              <div className="auth-field">
                <label className="auth-label">
                  Website <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
                </label>
                <input type="url" name="website" value={formData.website}
                  onChange={handleChange} placeholder="https://..." className="auth-input" />
              </div>
            </>
          )}

          <button className="auth-submit-btn" onClick={handleRegistration} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <button type="button" onClick={() => setRole(null)}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 0, fontFamily: "Poppins" }}>
              ← Change role
            </button>
            <span className="auth-bottom-text">
              Have an account?{" "}
              <span className="auth-link" onClick={() => navigate("/login")}>Sign in</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;