import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

// Token and user must exist together — clear stale user if token is gone
if (storedUser && !storedToken) {
    localStorage.removeItem("user");
}

const initialState = {
    user: storedUser && storedToken ? JSON.parse(storedUser) : null,
};

// Нормализует роль с бэкенда к единому формату (строчные)
// STUDENT/student/user → "student", PROFESSOR → "professor", COMPANY → "company"
function normalizeUser(user) {
    if (!user) return user;
    const rawRole = (user.role || "").toLowerCase();
    // Нормализация ролей: бэкенд хранит TEACHER, фронт использует "professor"
    const role = rawRole === "user" ? "student"
        : rawRole === "teacher" ? "professor"
        : rawRole;

    // companyName: некоторые бэкенды присылают fullName вместо companyName
    const companyName = user.companyName || (role === "company" ? user.fullName : undefined);
    // username: аналогично
    const username = user.username || user.fullName || user.name;

    return { ...user, role, companyName, username };
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = normalizeUser(action.payload);
            localStorage.setItem("user", JSON.stringify(state.user));
        },
        clearUser: (state) => {
            state.user = null;
            localStorage.removeItem("user");
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;