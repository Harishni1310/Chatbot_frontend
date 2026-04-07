const API_BASE = "http://localhost:8080/api";

export const sendMessage = async (question, userId = null) => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, userId }),
  });
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role: "USER" }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const adminGetFAQs = async (adminId) => {
  const response = await fetch(`${API_BASE}/admin/faqs`, {
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch FAQs");
  return data;
};

export const adminAddFAQ = async (adminId, question, answer) => {
  const response = await fetch(`${API_BASE}/admin/faq`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Admin-Id": adminId },
    body: JSON.stringify({ question, answer }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to add FAQ");
  return data;
};

export const adminUpdateFAQ = async (adminId, id, question, answer) => {
  const response = await fetch(`${API_BASE}/admin/faq/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Admin-Id": adminId },
    body: JSON.stringify({ question, answer }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update FAQ");
  return data;
};

export const adminDeleteFAQ = async (adminId, id) => {
  const response = await fetch(`${API_BASE}/admin/faq/${id}`, {
    method: "DELETE",
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete FAQ");
  return data;
};

export const adminGetChatLogs = async (adminId) => {
  const response = await fetch(`${API_BASE}/admin/chatlogs`, {
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch chat logs");
  return data;
};

export const adminGetUsers = async (adminId) => {
  const response = await fetch(`${API_BASE}/admin/users`, {
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch users");
  return data;
};

export const adminGetQueries = async (adminId) => {
  const response = await fetch(`${API_BASE}/admin/queries`, {
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch queries");
  return data;
};

export const adminGetAnalytics = async (adminId) => {
  const response = await fetch(`${API_BASE}/admin/analytics`, {
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch analytics");
  return data;
};

export const adminCreateNotification = async (adminId, title, message) => {
  const response = await fetch(`${API_BASE}/admin/notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Admin-Id": adminId },
    body: JSON.stringify({ title, message }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create notification");
  return data;
};

export const adminDeleteNotification = async (adminId, id) => {
  const response = await fetch(`${API_BASE}/admin/notification/${id}`, {
    method: "DELETE",
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete notification");
  return data;
};

export const getNotifications = async () => {
  const response = await fetch(`${API_BASE}/notifications`);
  const data = await response.json();
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return data;
};

export const getSuggestions = async (userId = null) => {
  const url = userId
    ? `${API_BASE}/suggestions?userId=${userId}`
    : `${API_BASE}/suggestions`;
  const response = await fetch(url);
  if (!response.ok) return { data: [] };
  return response.json();
};

export const adminGetSuggestedFAQs = async (adminId) => {
  const response = await fetch(`${API_BASE}/admin/suggested-faqs`, {
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch suggested FAQs");
  return data;
};

export const adminAddFAQFromSuggestion = async (adminId, id, question, answer) => {
  const response = await fetch(`${API_BASE}/admin/add-faq-from-suggestion/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Admin-Id": adminId },
    body: JSON.stringify({ question, answer }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to add FAQ from suggestion");
  return data;
};

export const adminDismissSuggestion = async (adminId, id) => {
  const response = await fetch(`${API_BASE}/admin/suggested-faq/${id}`, {
    method: "DELETE",
    headers: { "Admin-Id": adminId },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to dismiss suggestion");
  return data;
};
