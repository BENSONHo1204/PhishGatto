export type UserRole = "user" | "admin";

export type User = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};
const CURRENT_USER_KEY = "phish_current_user";

/* -----------------------------
 * REGISTER USER
 * ----------------------------- */
export async function registerUser(..._args: any[]) {
  return {
    status: "success",
    message: "Registered successfully"
  };
}

/* -----------------------------
 * LOGIN USER
 * ----------------------------- */
export async function loginUser(email: string, _password: string) {
  return {
    id: "1",
    username: "Demo User",
    email: email,
    role: email === "admin@test.com" ? "admin" : "user"
  };
}


/* -----------------------------
 * CURRENT USER
 * ----------------------------- */
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/* -----------------------------
 * LOGOUT
 * ----------------------------- */
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}


/* -----------------------------
 * ROLE HELPERS
 * ----------------------------- */
export function isAdmin(): boolean {
  const currentUser = getCurrentUser();
  return currentUser?.role === "admin";
}

/* -----------------------------
 * GET ALL USERS (Admin)
 * ----------------------------- */
export async function getAllUsers() {
  return [
    {
      id: "1",
      username: "Demo User",
      email: "user@test.com",
      role: "user"
    },
    {
      id: "2",
      username: "Admin",
      email: "admin@test.com",
      role: "admin"
    }
  ];
}


/* -----------------------------
 * REMOVE USER (Admin)
 * ----------------------------- */
export async function removeUser(_userId: string) {
  return { status: "success" };
}

/* -----------------------------
 * CHANGE PASSWORD
 * ----------------------------- */
export async function changePassword(
  _userId: string,
  _currentPassword: string,
  _newPassword: string
) {
  return {
    status: "success",
    message: "Password changed successfully"
  };
}