export function renderSidebar(state) {
  const folderItems = state.folders.map((folder) => `
    <button class="nav-item ${folder.id === state.activeFolderId ? "active" : ""}" data-folder-id="${folder.id}">
      <div class="nav-icon">${folder.icon.toUpperCase()}</div>
      <div class="nav-text">
        <strong>${folder.label}</strong>
        <span>${folder.hint}</span>
      </div>
      <div class="badge">${folder.count}</div>
    </button>
  `).join("");

  const mailboxItems = state.mailboxes.map((mailbox) => `
    <button class="mailbox-item ${mailbox.id === state.activeMailboxId ? "active" : ""}" data-mailbox-id="${mailbox.id}">
      <div class="mailbox-avatar">${mailbox.initials}</div>
      <div class="mailbox-meta">
        <strong>${mailbox.name}</strong>
        <span>${mailbox.email}</span>
      </div>
    </button>
  `).join("");

  return `
    <section class="sidebar-section">
      <div class="mailbox-switcher">
        <strong>${state.session?.displayName || "Frontend shell only"}</strong>
        <span>${state.session?.email || "Ready for API binding over the existing Postfix + Dovecot stack."}</span>
      </div>
    </section>
    <section class="sidebar-section">
      <p class="eyebrow">Folders</p>
      <div class="nav-list">${folderItems}</div>
    </section>
    <section class="sidebar-section">
      <p class="eyebrow">Mailboxes</p>
      <div class="mailbox-list">${mailboxItems}</div>
    </section>
  `;
}
