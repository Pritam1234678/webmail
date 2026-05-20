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
          <div>
            <p class="eyebrow">Codecoder Mail</p>
            <h1>Inbox</h1>
          </div>
        </div>
        <section class="search-host" id="searchBar"></section>
        <div class="profile-chip">
          <div class="presence-dot"></div>
          <div class="profile-actions">
            <div class="profile-stack">
              <strong>${state.session?.email || ""}</strong>
              <span>${state.session?.displayName || ""}</span>
            </div>
            <button class="ghost-button" id="logoutButton">Logout</button>
          </div>
        </div>
      </header>
      <section class="content-grid">
        <section class="panel mail-list-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Messages</p>
              <h2 id="folderTitle">Inbox</h2>
            </div>
            <div class="header-actions">
              <button class="ghost-button" id="refreshButton">Refresh</button>
              <button class="primary-button" id="composeButton">Compose</button>
            </div>
          </div>
          <div class="mail-list-toolbar">
            <button class="filter-chip active">Unread</button>
            <button class="filter-chip">Starred</button>
            <button class="filter-chip">Attachments</button>
          </div>
          <div class="mail-list" id="mailList" aria-live="polite"></div>
        </section>
        <section class="panel mail-view-panel">
          <div class="mail-view" id="mailView"></div>
        </section>
      </section>
    </main>
  `;
}

function renderLoginShell() {
  const loadingLabel = state.authLoading ? "Signing in..." : "Sign in";

  return `
    <section class="auth-card">
      <div class="auth-header">
        <div class="brand-mark">
          <div class="brand-badge">C</div>
          <div>
            <p class="eyebrow">Codecoder Mail</p>
            <h1>Sign in</h1>
          </div>
        </div>
        <p>Use your mailbox username and password. Supported mailboxes are <strong>support</strong> and <strong>noreply</strong>.</p>
      </div>
      <form class="auth-form" id="loginForm">
        <div class="auth-field">
          <label for="loginUsername">Username</label>
          <input class="auth-input" id="loginUsername" name="username" autocomplete="username" value="${state.loginForm.username}" placeholder="support">
        </div>
        <div class="auth-field">
          <label for="loginPassword">Password</label>
          <input class="auth-input" id="loginPassword" name="password" type="password" autocomplete="current-password" value="${state.loginForm.password}" placeholder="Password">
        </div>
        <div class="auth-footer">
          <span class="auth-note">API base: https://mail.codecoder.in/api</span>
          <button class="primary-button" type="submit" ${state.authLoading ? "disabled" : ""}>${loadingLabel}</button>
        </div>
      </form>
    </section>
  `;
}

function render() {
  const { app } = getElements();

  if (!state.session) {
    app.className = "auth-shell";
    app.innerHTML = renderLoginShell();
    return;
  }

  app.className = "app-shell";
  app.innerHTML = renderAppShell();

  const visibleMessages = getVisibleMessages();
  const selected = getSelectedMessage();
  const activeFolder = state.folders.find((folder) => folder.id === state.activeFolderId);

  if (!state.selectedMessageId && selected) {
    state.selectedMessageId = selected.id;
  }

  document.querySelector("#sidebar").innerHTML = renderSidebar(state);
  document.querySelector("#searchBar").innerHTML = renderSearchBar(state.searchQuery);
  document.querySelector("#mailList").innerHTML = renderMailList(visibleMessages, state.selectedMessageId, state.loading);
  document.querySelector("#mailView").innerHTML = renderMailView(selected, state.loading);
  document.querySelector("#composeModal").innerHTML = renderComposeModal(state);
  document.querySelector("#folderTitle").textContent = activeFolder?.label || "Inbox";
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
