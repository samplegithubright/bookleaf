const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
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
