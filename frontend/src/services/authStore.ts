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
export async function registerUser(
  username: string,
  email: string,
  password: string
) {

  const formData = new FormData();

  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);

  const res = await fetch(
    "http://localhost/PhishGatto/backend/api/register.php",
    {
      method: "POST",
      body: formData
    }
  );

  return await res.json();
}

/* -----------------------------
 * LOGIN USER
 * ----------------------------- */
export async function loginUser(email: string, password: string) {

  const formData = new FormData();

  formData.append("email", email);
  formData.append("password", password);

  const res = await fetch(
    "http://localhost/PhishGatto/backend/api/login.php",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (data.status === "success" && data.user) {
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(data.user)
    );
    return data.user;
  }

  return null;
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
  const res = await fetch(
    "http://localhost/PhishGatto/backend/api/getUsers.php"
  );

  const data = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

/* -----------------------------
 * REMOVE USER (Admin)
 * ----------------------------- */
export async function removeUser(userId: string) {
  const formData = new FormData();
  formData.append("user_id", userId);

  const res = await fetch(
    "http://localhost/PhishGatto/backend/api/removeUser.php",
    {
      method: "POST",
      body: formData
    }
  );

  return await res.json();
}

/* -----------------------------
 * CHANGE PASSWORD
 * ----------------------------- */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("current_password", currentPassword);
  formData.append("new_password", newPassword);

  const res = await fetch(
    "http://localhost/PhishGatto/backend/api/changePassword.php",
    {
      method: "POST",
      body: formData,
    }
  );

  return await res.json();
}