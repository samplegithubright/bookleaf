function getApiBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!url) {
    return "http://localhost:8000/api/v1";
  }
  // Strip trailing slashes
  url = url.replace(/\/+$/, "");
  // If the user provided the root Render domain without /api/v1, append it automatically
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }
  return url;
}

export const API_BASE_URL = getApiBaseUrl();

export function getWebSocketUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Explicit WebSocket URL override
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const base = process.env.NEXT_PUBLIC_WS_URL.trim().replace(/\/+$/, "");
    return `${base}${cleanPath}`;
  }

  // Derive WebSocket URL from API_BASE_URL (http -> ws, https -> wss)
  const apiUrl = API_BASE_URL.replace(/\/+$/, "");
  const wsProto = apiUrl.startsWith("https://") ? "wss://" : "ws://";
  const hostAndPath = apiUrl.replace(/^https?:\/\//, "");
  return `${wsProto}${hostAndPath}${cleanPath}`;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "author" | "admin";
  author_id?: string | null;
  city?: string | null;
  phone?: string | null;
}

export interface Book {
  id?: string;
  book_id: string;
  author_id: string;
  author_name?: string;
  title: string;
  isbn?: string | null;
  genre?: string | null;
  publication_date?: string | null;
  status: string;
  mrp?: number | null;
  author_royalty_per_copy?: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  last_royalty_payout_date?: string | null;
  print_partner?: string | null;
  available_on: string[];
}

export interface TicketMessage {
  message_id: string;
  sender_role: "author" | "admin" | "system";
  sender_name: string;
  content: string;
  created_at: string;
  is_internal_note?: boolean;
}

export interface InternalNote {
  note_id: string;
  admin_name: string;
  content: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  author_id: string;
  author_name: string;
  author_email: string;
  book_id?: string | null;
  book_title?: string | null;
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  category: string;
  ai_category?: string | null;
  priority: "Critical" | "High" | "Medium" | "Low";
  ai_priority?: string | null;
  assigned_to?: string | null;
  assigned_admin_name?: string | null;
  attachment_name?: string | null;
  ai_draft_response?: string | null;
  ai_reasoning?: string | null;
  messages: TicketMessage[];
  internal_notes: InternalNote[];
  created_at: string;
  updated_at: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("bookleaf_token") : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    if (typeof window !== "undefined" && API_BASE_URL.includes("localhost") && window.location.hostname !== "localhost") {
      throw new Error(`Backend connection error: NEXT_PUBLIC_API_URL is currently pointing to "${API_BASE_URL}". Please configure NEXT_PUBLIC_API_URL in your Vercel Environment Variables to your Render backend URL and redeploy.`);
    }
    throw new Error(`Unable to reach backend server at ${API_BASE_URL}. If your Render service is on the free tier, it may take ~45-60 seconds to spin up from sleep. Please check Render logs or try again shortly.`);
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined" && !endpoint.includes("/auth/login")) {
      localStorage.removeItem("bookleaf_token");
      localStorage.removeItem("bookleaf_user");
    }

    let errorDetail = "An unexpected error occurred.";
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch {
      errorDetail = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
