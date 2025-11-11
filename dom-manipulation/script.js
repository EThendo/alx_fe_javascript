let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const STORAGE_KEY = "dynamicQuoteGenerator_quotes";
const LAST_VIEWED_KEY = "dynamicQuoteGenerator_lastViewed";

function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) quotes = JSON.parse(s);
}

function saveLastViewed(index) {
  sessionStorage.setItem(LAST_VIEWED_KEY, index);
}

function loadLastViewed() {
  const v = sessionStorage.getItem(LAST_VIEWED_KEY);
  return v !== null ? Number(v) : null;
}

function getCategories() {
  const set = new Set(quotes.map(q => q.category || "Uncategorized"));
  return Array.from(set).sort();
}

function renderCategoryFilter() {
  const sel = document.getElementById("categoryFilter");
  const prev = sel.value || "All";
  sel.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "All";
  allOpt.textContent = "All categories";
  sel.appendChild(allOpt);
  getCategories().forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    sel.appendChild(o);
  });
  sel.value = prev in sel ? prev : "All";
}

function displayQuoteAtIndex(index) {
  const display = document.getElementById("quoteDisplay");
  const q = quotes[index];
  if (!q) return;
  display.textContent = `"${q.text}" — [${q.category}]`;
  saveLastViewed(index);
}

function showRandomQuote() {
  const filter = document.getElementById("categoryFilter").value;
  const pool = filter === "All" ? quotes : quotes.filter(q => q.category === filter);
  if (pool.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available for the selected category.";
    return;
  }
  const idxInPool = Math.floor(Math.random() * pool.length);
  const quote = pool[idxInPool];
  const globalIndex = quotes.findIndex(q => q === quote);
  displayQuoteAtIndex(globalIndex);
}

function showLastViewedQuote() {
  const last = loadLastViewed();
  if (last !== null && last >= 0 && last < quotes.length) displayQuoteAtIndex(last);
  else alert("No last viewed quote in this session.");
}

function addQuoteToList(text, category) {
  if (!text || !category) return false;
  quotes.push({ text: text.trim(), category: category.trim() });
  saveQuotes();
  renderAllQuotes();
  renderCategoryFilter();
  displayQuoteAtIndex(quotes.length - 1);
  return true;
}

function addQuote() {
  const t = document.getElementById("newQuoteText").value.trim();
  const c = document.getElementById("newQuoteCategory").value.trim();
  if (!t || !c) { alert("Please enter both a quote and a category."); return; }
  addQuoteToList(t, c);
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}

function removeQuote(index) {
  if (index < 0 || index >= quotes.length) return;
  if (!confirm("Delete this quote?")) return;
  quotes.splice(index, 1);
  saveQuotes();
  renderAllQuotes();
  renderCategoryFilter();
  const last = loadLastViewed();
  if (last === index) sessionStorage.removeItem(LAST_VIEWED_KEY);
  showRandomQuote();
}

function renderAllQuotes() {
  const list = document.getElementById("quotesList");
  list.innerHTML = "";
  const filter = document.getElementById("categoryFilter").value;
  quotes.forEach((q, idx) => {
    if (filter !== "All" && q.category !== filter) return;
    const card = document.createElement("div");
    card.className = "quote-card";
    const left = document.createElement("div");
    const p = document.createElement("div");
    p.textContent = q.text;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `[${q.category}]`;
    left.appendChild(p);
    left.appendChild(meta);
    const right = document.createElement("div");
    const showBtn = document.createElement("button");
    showBtn.textContent = "Show";
    showBtn.onclick = () => displayQuoteAtIndex(idx);
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => removeQuote(idx);
    right.appendChild(showBtn);
    right.appendChild(delBtn);
    card.appendChild(left);
    card.appendChild(right);
    list.appendChild(card);
  });
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
  alert("Quotes exported as JSON file successfully!");
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) { alert("Invalid JSON format. Expecting an array of quotes."); return; }
      const valid = imported.filter(item => item && typeof item.text === "string" && typeof item.category === "string");
      if (valid.length === 0) { alert("No valid quotes found in the file."); return; }
      quotes.push(...valid);
      saveQuotes();
      renderCategoryFilter();
      renderAllQuotes();
      displayQuoteAtIndex(quotes.length - 1);
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Error reading file. Make sure it's a valid JSON file.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function createAddQuoteForm() {
  const container = document.getElementById("addFormContainer");
  container.innerHTML = "";
  const wrapper = document.createElement("div");
  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";
  const inputCat = document.createElement("input");
  inputCat.id = "newQuoteCategory";
  inputCat.type = "text";
  inputCat.placeholder = "Enter quote category";
  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.className = "primary";
  btn.onclick = addQuote;
  const row = document.createElement("div");
  row.className = "form-row";
  row.appendChild(inputText);
  row.appendChild(inputCat);
  row.appendChild(btn);
  wrapper.appendChild(row);
  container.appendChild(wrapper);
}

function init() {
  loadQuotes();
  renderCategoryFilter();
  createAddQuoteForm();
  renderAllQuotes();
  const last = loadLastViewed();
  if (last !== null && last >= 0 && last < quotes.length) displayQuoteAtIndex(last);
  else showRandomQuote();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("lastViewed").addEventListener("click", showLastViewedQuote);
  document.getElementById("categoryFilter").addEventListener("change", () => {
    renderAllQuotes();
    showRandomQuote();
  });
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

document.addEventListener("DOMContentLoaded", init);
