export function renderSearchBar(query) {
  return `
    <div class="search-bar">
      <span class="eyebrow" style="font-size: 14px; margin-right: 8px">/</span>
      <input id="mailSearch" type="search" placeholder="Search" value="${query}">
    </div>
  `;
}
