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
      request<{ token: string; business_id: string; type: string; name: string }>(
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

    getMyListings: () =>
      request<unknown[]>("/user/listings", {}, getToken()),

    createListing: (data: {
      title: string;
      category: string;
      sub_category?: string;
      price: number;
      description?: string;
      location?: string;
      features?: Record<string, string>;
      photos?: string[];
    }) =>
      request<{ id: string }>("/user/listings", {
        method: "POST",
        body: JSON.stringify(data),
      }, getToken()),

    updateListing: (id: string, data: Record<string, unknown>) =>
      request(`/user/listings/${id}`, { method: "PUT", body: JSON.stringify(data) }, getToken()),

    deleteListing: (id: string) =>
      request(`/user/listings/${id}`, { method: "DELETE" }, getToken()),

    createReservation: (data: {
      business_id: string;
      date: string;
      time: string;
      note?: string;
      type?: string;
      party_size?: number;
    }) =>
      request("/user/reservations", { method: "POST", body: JSON.stringify(data) }, getToken()),

    // ─── SİPARİŞ (yemek/market) ─────────────────────────────────────────
    getOrders: (filter?: "aktif" | "gecmis") => {
      const q = filter ? `?filter=${filter}` : "";
      return request<unknown[]>(`/user/orders${q}`, {}, getToken());
    },

    getOrder: (id: string) =>
      request<Record<string, unknown>>(`/user/orders/${id}`, {}, getToken()),

    createOrder: (data: {
      business_id: string;
      items: Array<{
        menu_item_id: string;
        name: string;
        price: number;
        quantity: number;
        note?: string;
      }>;
      payment_method: "nakit" | "kart_kapida" | "eft";
      delivery_address: string;
      delivery_lat?: number;
      delivery_lng?: number;
      delivery_district?: string;
      contact_phone: string;
      contact_name?: string;
      user_note?: string;
    }) =>
      request<{ id: string; total: number; estimated_delivery_min?: number }>(
        "/user/orders",
        { method: "POST", body: JSON.stringify(data) },
        getToken()
      ),

    cancelOrder: (id: string, reason?: string) =>
      request(
        `/user/orders/${id}/cancel`,
        { method: "PUT", body: JSON.stringify({ reason: reason || "" }) },
        getToken()
      ),

    rateOrder: (id: string, rating: number, comment?: string) =>
      request(
        `/user/orders/${id}/rate`,
        { method: "PUT", body: JSON.stringify({ rating, comment: comment || "" }) },
        getToken()
      ),

    // ─── ADRESLER ───────────────────────────────────────────────────────
    getAddresses: () =>
      request<unknown[]>("/user/addresses", {}, getToken()),

    createAddress: (data: {
      label?: string;
      address: string;
      district?: string;
      lat?: number;
      lng?: number;
      contact_phone?: string;
      contact_name?: string;
      is_default?: boolean;
    }) =>
      request<{ id: string }>(
        "/user/addresses",
        { method: "POST", body: JSON.stringify(data) },
        getToken()
      ),

    updateAddress: (id: string, data: Record<string, unknown>) =>
      request(
        `/user/addresses/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
        getToken()
      ),

    deleteAddress: (id: string) =>
      request(`/user/addresses/${id}`, { method: "DELETE" }, getToken()),
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

    updateMe: (data: { name: string; phone: string; address: string; description: string; logo_url?: string; cover_url?: string }) =>
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

    getMyListings: () =>
      request<unknown[]>("/business/listings", {}, getBusinessToken()),

    getMyServices: () =>
      request<unknown[]>("/business/services", {}, getBusinessToken()),

    createService: (data: { name: string; description?: string; price?: number; duration?: string; category?: string }) =>
      request<{ id: string }>("/business/services", { method: "POST", body: JSON.stringify(data) }, getBusinessToken()),

    updateService: (id: string, data: Record<string, unknown>) =>
      request(`/business/services/${id}`, { method: "PUT", body: JSON.stringify(data) }, getBusinessToken()),

    deleteService: (id: string) =>
      request(`/business/services/${id}`, { method: "DELETE" }, getBusinessToken()),

    updateReservationStatus: (resId: string, status: string) =>
      request(
        `/business/reservations/${resId}/status`,
        { method: "PUT", body: JSON.stringify({ status }) },
        getBusinessToken()
      ),

    getListing: (id: string) =>
      request<Record<string, unknown>>(`/listings/${id}`, {}),

    updateListing: (id: string, data: Record<string, unknown>) =>
      request(`/business/listings/${id}`, { method: "PUT", body: JSON.stringify(data) }, getBusinessToken()),

    updateListingStatus: (id: string, status: string) =>
      request(`/business/listings/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }, getBusinessToken()),

    deleteListing: (id: string) =>
      request(`/business/listings/${id}`, { method: "DELETE" }, getBusinessToken()),

    // ─── SİPARİŞLER ─────────────────────────────────────────────────────
    getOrders: (filter?: "yeni" | "aktif" | "tamamlandi" | "iptal") => {
      const q = filter ? `?filter=${filter}` : "";
      return request<unknown[]>(`/business/orders${q}`, {}, getBusinessToken());
    },

    getOrder: (id: string) =>
      request<Record<string, unknown>>(`/business/orders/${id}`, {}, getBusinessToken()),

    updateOrderStatus: (
      id: string,
      status:
        | "onaylandi"
        | "hazirlaniyor"
        | "hazir"
        | "yolda"
        | "teslim_edildi"
        | "iptal",
      reason?: string
    ) =>
      request(
        `/business/orders/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status, reason: reason || "" }),
        },
        getBusinessToken()
      ),

    // ─── TESLİMAT AYARLARI ──────────────────────────────────────────────
    getDeliverySettings: () =>
      request<Record<string, unknown>>(
        "/business/delivery-settings",
        {},
        getBusinessToken()
      ),

    updateDeliverySettings: (data: {
      accepts_orders?: boolean;
      delivery_fee?: number;
      free_delivery_threshold?: number;
      min_order_amount?: number;
      delivery_radius_km?: number;
      estimated_delivery_min?: number;
      accepts_cash?: boolean;
      accepts_card_at_door?: boolean;
      accepts_eft?: boolean;
      eft_iban?: string;
      eft_bank_name?: string;
      eft_account_holder?: string;
      open_hour?: number;
      close_hour?: number;
    }) =>
      request(
        "/business/delivery-settings",
        { method: "PUT", body: JSON.stringify(data) },
        getBusinessToken()
      ),
  },
};

// Business public delivery info (auth gerek değil — restoran sayfasında gösterilir)
export const publicApi = {
  getBusinessDelivery: (businessId: string) =>
    request<Record<string, unknown>>(`/businesses/${businessId}/delivery`),
};
