const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://138.68.69.122:8080/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const user = JSON.parse(localStorage.getItem("gebzem_user") || "null");
    return user?.token || null;
  } catch {
    return null;
  }
}

function getBusinessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const b = JSON.parse(localStorage.getItem("gebzem_business") || "null");
    return b?.token || null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Bir hata olustu");
  return data as T;
}

// Auth
export const api = {
  auth: {
    sendOTP: (phone: string) =>
      request<{ message: string; dev_otp?: string }>("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),

    verifyOTP: (phone: string, code: string, name?: string) =>
      request<{ token: string; user_id: string }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, code, name }),
      }),

    businessLogin: (email: string, password: string) =>
      request<{ token: string; business_id: string; type: string }>(
        "/auth/business/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      ),

    emailRegister: (name: string, email: string, password: string) =>
      request<{ token: string; user_id: string }>("/auth/email/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),

    emailLogin: (email: string, password: string) =>
      request<{ token: string; user_id: string }>("/auth/email/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    businessRegister: (data: {
      name: string;
      type: string;
      email: string;
      password: string;
      phone: string;
    }) =>
      request<{ message: string; id: string }>("/auth/business/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  user: {
    getMe: () => request<Record<string, unknown>>("/user/me", {}, getToken()),

    updateMe: (data: { name: string; email: string }) =>
      request("/user/me", { method: "PUT", body: JSON.stringify(data) }, getToken()),

    getConversations: () =>
      request<unknown[]>("/user/conversations", {}, getToken()),

    startConversation: (businessId: string, text?: string) =>
      request<{ conversation_id: string }>(
        "/user/conversations",
        { method: "POST", body: JSON.stringify({ business_id: businessId, text }) },
        getToken()
      ),

    getMessages: (convId: string) =>
      request<unknown[]>(`/user/conversations/${convId}/messages`, {}, getToken()),

    sendMessage: (convId: string, text: string) =>
      request(
        `/user/conversations/${convId}/messages`,
        { method: "POST", body: JSON.stringify({ text }) },
        getToken()
      ),

    getReservations: () =>
      request<unknown[]>("/user/reservations", {}, getToken()),

    createReservation: (data: {
      business_id: string;
      date: string;
      time: string;
      note?: string;
      type?: string;
      party_size?: number;
    }) =>
      request("/user/reservations", { method: "POST", body: JSON.stringify(data) }, getToken()),
  },

  admin: {
    login: (email: string, password: string) =>
      request<{ token: string }>("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    getStats: (token: string) =>
      request<Record<string, number>>("/admin/stats", {}, token),

    getUsers: (token: string) =>
      request<unknown[]>("/admin/users", {}, token),

    toggleUser: (id: string, isActive: boolean, token: string) =>
      request(`/admin/users/${id}/toggle`, {
        method: "PUT",
        body: JSON.stringify({ is_active: isActive }),
      }, token),

    getBusinesses: (token: string) =>
      request<unknown[]>("/admin/businesses", {}, token),

    approveBusiness: (id: string, approve: boolean, token: string) =>
      request(`/admin/businesses/${id}/approve`, {
        method: "PUT",
        body: JSON.stringify({ approve }),
      }, token),

    getSettings: (token: string) =>
      request<Record<string, string>>("/admin/settings", {}, token),

    updateSettings: (data: Record<string, string>, token: string) =>
      request("/admin/settings", {
        method: "POST",
        body: JSON.stringify(data),
      }, token),
  },

  business: {
    getMe: () => request<Record<string, unknown>>("/business/me", {}, getBusinessToken()),

    updateMe: (data: { name: string; phone: string; address: string; description: string }) =>
      request("/business/me", { method: "PUT", body: JSON.stringify(data) }, getBusinessToken()),

    getConversations: () =>
      request<unknown[]>("/business/conversations", {}, getBusinessToken()),

    getMessages: (convId: string) =>
      request<unknown[]>(`/business/conversations/${convId}/messages`, {}, getBusinessToken()),

    replyMessage: (convId: string, text: string) =>
      request(
        `/business/conversations/${convId}/messages`,
        { method: "POST", body: JSON.stringify({ text }) },
        getBusinessToken()
      ),

    getReservations: () =>
      request<unknown[]>("/business/reservations", {}, getBusinessToken()),

    updateReservationStatus: (resId: string, status: string) =>
      request(
        `/business/reservations/${resId}/status`,
        { method: "PUT", body: JSON.stringify({ status }) },
        getBusinessToken()
      ),
  },
};
