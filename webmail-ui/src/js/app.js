import { renderSidebar } from "./components/sidebar.js";
import { renderMailList } from "./components/mailList.js";
import { renderMailView } from "./components/mailView.js";
import { renderComposeModal } from "./components/composeModal.js";
import { renderSearchBar } from "./components/searchBar.js";
import { pushToast } from "./components/toast.js";
import { bootstrapData, fetchMessageDetail, fetchMessages, login, logout, sendMessage } from "./services/api.js";
import { getSelectedMessage, getVisibleMessages, patchDraft, patchLogin, setState, state, subscribe } from "./core/store.js";

function getElements() {
  return {
    app: document.querySelector("#app"),
    toastStack: document.querySelector("#toastStack")
  };
}

function renderAppShell() {
  return `
    <aside class="sidebar" id="sidebar"></aside>
    <main class="workspace">
      <header class="topbar">
        <button class="icon-button mobile-only" id="sidebarToggle" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>
        <div class="brand-mark">
          <div class="brand-badge">C</div>
          <h1 class="eyebrow">Codecoder</h1>
        </div>
        <section class="search-host" id="searchBar"></section>
        <div class="profile-chip">
          <div class="profile-stack" style="text-align: right">
            <strong>${state.session?.email || ""}</strong>
            <span class="eyebrow" style="display: block; font-size: 9px; margin-top: 2px">${state.session?.displayName || ""}</span>
          </div>
          <button class="ghost-button" id="logoutButton" style="padding: 6px 10px; font-size: 11px; margin-left: 12px">Logout</button>
        </div>
      </header>
      <section class="content-grid">
        <section class="mail-list-panel">
          <div class="panel-header">
            <h2 class="eyebrow" id="folderTitle">Inbox</h2>
            <div class="header-actions">
              <button class="ghost-button" id="refreshButton" style="padding: 6px 10px; font-size: 11px">Refresh</button>
              <button class="primary-button" id="composeButton" style="padding: 6px 12px; font-size: 11px">New Message</button>
            </div>
          </div>
          <div class="mail-list-toolbar">
            <button class="ghost-button active" style="padding: 4px 10px; font-size: 11px">All</button>
            <button class="ghost-button" style="padding: 4px 10px; font-size: 11px">Unread</button>
          </div>
          <div class="mail-list" id="mailList"></div>
        </section>
        <section class="mail-view-panel">
          <div class="mail-view" id="mailView"></div>
        </section>
      </section>
    </main>
  `;
}

function renderLoginShell() {
  const loadingLabel = state.authLoading ? "Authenticating..." : "Sign in";

  return `
    <section class="auth-card">
      <div class="brand-mark">
        <div class="brand-badge">C</div>
        <h1 class="eyebrow">Codecoder Mail</h1>
      </div>
      <form class="auth-form" id="loginForm">
        <div class="auth-field">
          <label>Username</label>
          <input class="auth-input" id="loginUsername" name="username" placeholder="e.g. support" value="${state.loginForm.username}">
        </div>
        <div class="auth-field">
          <label>Password</label>
          <input class="auth-input" id="loginPassword" name="password" type="password" placeholder="••••••••" value="${state.loginForm.password}">
        </div>
        <button class="primary-button" type="submit" ${state.authLoading ? "disabled" : ""} style="width: 100%; margin-top: 12px">${loadingLabel}</button>
      </form>
      <p class="eyebrow" style="margin-top: 24px; text-align: center; font-size: 9px">Secure Terminal Access</p>
    </section>
  `;
}

function render() {
  const { app } = getElements();

  if (!state.session) {
    if (app.className !== "auth-shell") {
      app.className = "auth-shell";
      app.innerHTML = renderLoginShell();
    } else {
      const loginForm = document.querySelector("#loginForm");
      if (loginForm) {
        const submitBtn = loginForm.querySelector("button[type='submit']");
        if (submitBtn) {
          submitBtn.disabled = state.authLoading;
          submitBtn.textContent = state.authLoading ? "Signing in..." : "Sign in";
        }
      }
    }
    return;
  }

  if (app.className !== "app-shell") {
    app.className = "app-shell";
    app.innerHTML = renderAppShell();
  }

  const visibleMessages = getVisibleMessages();
  const selected = getSelectedMessage();
  const activeFolder = state.folders.find((folder) => folder.id === state.activeFolderId);

  if (!state.selectedMessageId && selected) {
    state.selectedMessageId = selected.id;
  }

  const sidebar = document.querySelector("#sidebar");
  if (sidebar) sidebar.innerHTML = renderSidebar(state);

  const searchBar = document.querySelector("#searchBar");
  if (searchBar) {
    const existingSearch = searchBar.querySelector("#mailSearch");
    if (!existingSearch || existingSearch.value !== state.searchQuery) {
        searchBar.innerHTML = renderSearchBar(state.searchQuery);
    }
  }

  const mailList = document.querySelector("#mailList");
  if (mailList) mailList.innerHTML = renderMailList(visibleMessages, state.selectedMessageId, state.loading);

  const mailView = document.querySelector("#mailView");
  if (mailView) mailView.innerHTML = renderMailView(selected, state.loading);

  const composeModal = document.querySelector("#composeModal");
  if (composeModal) {
    const isCurrentlyOpen = composeModal.querySelector(".compose-backdrop")?.classList.contains("open");
    if (isCurrentlyOpen !== state.composeOpen) {
       composeModal.innerHTML = renderComposeModal(state);
    }
  }

  const folderTitle = document.querySelector("#folderTitle");
  if (folderTitle) folderTitle.textContent = activeFolder?.label || "Inbox";

  const profileStack = document.querySelector(".profile-stack");
  if (profileStack) {
    profileStack.innerHTML = `
      <strong>${state.session?.email || ""}</strong>
      <span>${state.session?.displayName || ""}</span>
    `;
  }
}

async function loadMessages() {
  setState({ loading: true });
  const data = await fetchMessages(state.activeMailboxId, state.activeFolderId, state.searchQuery);
  const firstMessageId = data.messages[0]?.id || null;
  setState({
    loading: false,
    mailboxes: state.mailboxes.map((mailbox) => {
      const updated = (data.mailbox?.id === mailbox.id ? data.mailbox : null)
        || (state.mailboxes.find((item) => item.id === mailbox.id) || mailbox);
      return updated;
    }),
    folders: data.mailbox?.folders || state.folders,
    messages: data.messages,
    selectedMessageId: firstMessageId,
    selectedMessage: null
  });

  if (firstMessageId) {
    const message = await fetchMessageDetail(firstMessageId);
    setState({ selectedMessage: message });
  }
}

async function selectMessage(messageId) {
  setState({ selectedMessageId: messageId, loading: true });
  const message = await fetchMessageDetail(messageId);
  setState({ selectedMessage: message, loading: false });
}

async function selectFolder(folderId) {
  setState({ activeFolderId: folderId, selectedMessageId: null, selectedMessage: null });
  await loadMessages();
}

async function selectMailbox(mailboxId) {
  setState({ activeMailboxId: mailboxId, selectedMessageId: null, selectedMessage: null });
  await loadMessages();
}

function openCompose() {
  setState({ composeOpen: true });
}

function closeCompose() {
  setState({ composeOpen: false });
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    if (event.target.id === "logoutButton") {
      logout()
        .catch(() => {})
        .finally(() => {
          setState({
            session: null,
            mailboxes: [],
            folders: [],
            messages: [],
            selectedMessage: null,
            selectedMessageId: null,
            composeOpen: false
          });
        });
      return;
    }

    const folderButton = event.target.closest("[data-folder-id]");
    if (folderButton) {
      selectFolder(folderButton.dataset.folderId);
      if (window.innerWidth <= 980) {
        document.querySelector("#sidebar")?.classList.remove("open");
      }
      return;
    }

    const mailboxButton = event.target.closest("[data-mailbox-id]");
    if (mailboxButton) {
      selectMailbox(mailboxButton.dataset.mailboxId);
      return;
    }

    const messageRow = event.target.closest("[data-message-id]");
    if (messageRow) {
      selectMessage(messageRow.dataset.messageId);
      return;
    }

    if (event.target.id === "composeButton") {
      openCompose();
      return;
    }

    if (event.target.id === "closeCompose") {
      closeCompose();
      return;
    }

    if (event.target.id === "saveDraftButton") {
      pushToast(getElements().toastStack, "Draft saved", "Prepared for a future POST /api/v1/drafts integration.");
      closeCompose();
      return;
    }

    if (event.target.id === "sendButton") {
      sendMessage({
        mailboxId: state.activeMailboxId,
        ...state.composeDraft
      }).then(() => {
        pushToast(getElements().toastStack, "Queued for send", "Message accepted by the mail bridge.");
        closeCompose();
      }).catch(() => {
        pushToast(getElements().toastStack, "Send failed", "The mail bridge rejected the request.");
      });
      return;
    }

    if (event.target.id === "refreshButton") {
      loadMessages().then(() => {
        pushToast(getElements().toastStack, "Mailbox synced", "Mailbox data refreshed.");
      });
      return;
    }

    if (event.target.closest("#sidebarToggle")) {
      document.querySelector("#sidebar")?.classList.toggle("open");
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const action = actionButton.dataset.action;
      pushToast(getElements().toastStack, `${action[0].toUpperCase()}${action.slice(1)} ready`, "This control is prepared for backend integration.");
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "loginUsername") {
      patchLogin("username", event.target.value);
      return;
    }

    if (event.target.id === "loginPassword") {
      patchLogin("password", event.target.value);
      return;
    }

    if (event.target.id === "mailSearch") {
      setState({ searchQuery: event.target.value, selectedMessageId: null, selectedMessage: null });
      window.clearTimeout(bindEvents.searchTimer);
      bindEvents.searchTimer = window.setTimeout(() => {
        loadMessages();
      }, 180);
      return;
    }

    if (event.target.id === "composeTo") patchDraft("to", event.target.value);
    if (event.target.id === "composeCc") patchDraft("cc", event.target.value);
    if (event.target.id === "composeSubject") patchDraft("subject", event.target.value);
    if (event.target.id === "composeBody") patchDraft("body", event.target.value);
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "loginForm") {
      return;
    }

    event.preventDefault();
    setState({ authLoading: true });

    login(state.loginForm.username.trim(), state.loginForm.password)
      .then(async () => {
        const data = await bootstrapData();
        const activeMailbox = data.mailboxes.find((mailbox) => mailbox.id === data.session.mailboxId) || data.mailboxes[0];

        setState({
          session: data.session,
          mailboxes: data.mailboxes,
          activeMailboxId: activeMailbox?.id || "support",
          folders: activeMailbox?.folders || [],
          activeFolderId: activeMailbox?.folders?.[0]?.id || "inbox",
          loading: false,
          authLoading: false,
          loginForm: {
            username: "",
            password: ""
          }
        });

        await loadMessages();
        pushToast(getElements().toastStack, "Signed in", "Mailbox session established.");
      })
      .catch(() => {
        setState({ authLoading: false });
        pushToast(getElements().toastStack, "Login failed", "Check mailbox username and password.");
      });
  });
}

async function boot() {
  subscribe(render);
  render();
  bindEvents();
  try {
    const data = await bootstrapData();
    const primaryMailbox = data.session?.mailboxId || data.mailboxes[0]?.id || "support";
    const activeMailbox = data.mailboxes.find((mailbox) => mailbox.id === primaryMailbox) || data.mailboxes[0];

    setState({
      session: data.session,
      mailboxes: data.mailboxes,
      activeMailboxId: activeMailbox?.id || "support",
      folders: activeMailbox?.folders || [],
      activeFolderId: activeMailbox?.folders?.[0]?.id || "inbox",
      loading: false
    });

    await loadMessages();
  } catch (error) {
    setState({ session: null, loading: false });
  }
}

boot();
