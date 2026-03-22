export const springApiBaseUrl = process.env.REACT_APP_SPRING_API || "http://localhost:7777";
export const legacyApiBaseUrl = process.env.REACT_APP_LEGACY_API || "http://localhost:3001";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${springApiBaseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Clear session on 401 Unauthorized
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login" && window.location.pathname !== "/registration") {
      window.location.href = "/login"; 
    }
    throw new Error("Unauthorized - session expired.");
  }

  if (response.status === 403) {
    throw new Error("Forbidden - insufficient permissions.");
  }

  if (response.status === 429) {
    throw new Error("Too many requests - please try again later.");
  }
  
  if (response.status === 204) {
    // No content, return null/empty successfully
    return null;
  }

  if (!response.ok) {
    let errorMsg = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Not JSON
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
