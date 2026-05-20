import { mailboxes } from "../data/mailboxes.js";

const listeners = new Set();

export const state = {
  folders: [],
  mailboxes,
  activeMailboxId: mailboxes[0].id,
  activeFolderId: "inbox",
  selectedMessageId: null,
  searchQuery: "",
  composeOpen: false,
  composeDraft: {
    to: "",
    cc: "",
    subject: "",
    body: ""
  },
  loading: true,
  messages: [],
  selectedMessage: null,
  session: null,
  authLoading: false,
  loginForm: {
    username: "",
    password: ""
  }
};

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((listener) => listener(state));
}

export function patchDraft(field, value) {
  state.composeDraft = { ...state.composeDraft, [field]: value };
  listeners.forEach((listener) => listener(state));
}

export function patchLogin(field, value) {
  state.loginForm = { ...state.loginForm, [field]: value };
  listeners.forEach((listener) => listener(state));
}

export function getVisibleMessages() {
  const query = state.searchQuery.trim().toLowerCase();

  return state.messages
    .filter((message) => !state.activeMailboxId || message.mailboxId === state.activeMailboxId)
    .filter((message) => !state.activeFolderId || message.folder === state.activeFolderId)
    .filter((message) => {
      if (!query) return true;

      const haystack = [
        message.senderName,
        message.senderEmail,
        message.subject,
        message.snippet
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    })
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
}

export function getSelectedMessage() {
  const visible = getVisibleMessages();
  return state.selectedMessage || visible.find((message) => message.id === state.selectedMessageId) || visible[0] || null;
}
