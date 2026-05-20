import { apiBase } from "../config.js";

export const apiContract = {
  auth: {
    login: "POST /api/v1/auth/session",
    logout: "DELETE /api/v1/auth/session",
    me: "GET /api/v1/auth/me"
  },
  mailboxes: {
    list: "GET /api/v1/mailboxes",
    stats: "GET /api/v1/mailboxes/:mailboxId/stats"
  },
  messages: {
    list: "GET /api/v1/mailboxes/:mailboxId/messages?folder=inbox&cursor=...",
    detail: "GET /api/v1/mailboxes/:mailboxId/messages/:messageId",
    search: "GET /api/v1/mailboxes/:mailboxId/search?q=...",
    send: "POST /api/v1/messages/send",
    draftSave: "POST /api/v1/drafts",
    delete: "DELETE /api/v1/messages/:messageId",
    spam: "POST /api/v1/messages/:messageId/spam",
    star: "POST /api/v1/messages/:messageId/star",
    thread: "GET /api/v1/threads/:threadId"
  },
  attachments: {
    upload: "POST /api/v1/attachments",
    download: "GET /api/v1/attachments/:attachmentId"
  },
  realtime: {
    stream: "GET /api/v1/events/stream",
    sync: "GET /api/v1/sync?cursor=..."
  }
};

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function login(username, password) {
  const data = await request("/api/v1/auth/session", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  return data.session;
}

export async function logout() {
  const response = await fetch(`${apiBase}/api/v1/auth/session`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Logout failed: ${response.status}`);
  }
}

export async function bootstrapData() {
  const [sessionData, mailboxData] = await Promise.all([
    request("/api/v1/auth/me"),
    request("/api/v1/mailboxes")
  ]);

  return {
    session: sessionData.user,
    mailboxes: mailboxData.mailboxes
  };
}

export async function fetchMessages(mailboxId, folder, query = "") {
  const search = new URLSearchParams();
  if (folder) search.set("folder", folder);
  if (query) search.set("q", query);

  const data = await request(`/api/v1/mailboxes/${mailboxId}?${search.toString()}`);
  return data;
}

export async function fetchMessageDetail(messageId) {
  const data = await request(`/api/v1/messages/${messageId}`);
  return data.message;
}

export async function sendMessage(payload) {
  return request("/api/v1/messages/send", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
