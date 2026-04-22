import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";
import { apiFetch } from "../../lib/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("This link is invalid or has expired. Please register again.");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }

    apiFetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((data) => {
        localStorage.setItem("token", data.accessToken);
        dispatch(setUser(data.user));
        navigate("/");
      })
      .catch((err) => {
        if (err.message) setErrorMessage(err.message);
        setStatus("error");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "invalid") {
    return (
      <div className="login-page">
        <div className="login-box">
          <div className="login-container">
            <h2>Invalid Link</h2>
            <p>This verification link is invalid. No token was found in the URL.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="login-page">
        <div className="login-box">
          <div className="login-container">
            <h2>Verification Failed</h2>
            <p>{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-container">
          <h2>Verifying your email…</h2>
          <p>Please wait a moment.</p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
