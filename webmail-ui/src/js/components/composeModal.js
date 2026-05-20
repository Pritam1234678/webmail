export function renderComposeModal(state) {
  return `
    <div class="compose-backdrop ${state.composeOpen ? "open" : ""}">
      <section class="compose-modal" role="dialog" aria-modal="true" aria-labelledby="composeTitle">
        <header class="compose-header">
          <div>
            <p class="eyebrow">New message</p>
            <strong id="composeTitle">Compose</strong>
          </div>
          <button class="icon-button" id="closeCompose" aria-label="Close compose">
            <span></span><span></span><span></span>
          </button>
        </header>
        <div class="compose-fields">
          <input class="compose-input" id="composeTo" placeholder="To" value="${state.composeDraft.to}">
          <input class="compose-input" id="composeCc" placeholder="Cc" value="${state.composeDraft.cc}">
          <input class="compose-input" id="composeSubject" placeholder="Subject" value="${state.composeDraft.subject}">
          <textarea class="compose-textarea" id="composeBody" placeholder="Write your message...">${state.composeDraft.body}</textarea>
          <div class="upload-strip">
            <span class="upload-pill">Drop attachments here</span>
            <span class="upload-pill">Future API: POST /api/v1/attachments</span>
          </div>
        </div>
        <footer class="compose-footer">
          <span class="eyebrow">Prepared for reply, forward, drafts, uploads, and server-side validation.</span>
          <div class="header-actions">
            <button class="ghost-button" id="saveDraftButton">Save draft</button>
            <button class="primary-button" id="sendButton">Send</button>
          </div>
        </footer>
      </section>
    </div>
  `;
}
