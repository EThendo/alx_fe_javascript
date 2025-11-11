let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const STORAGE_KEY = "dynamicQuoteGenerator_quotes";
const LAST_VIEWED_KEY = "dynamicQuoteGenerator_lastViewed";
const FILTER_KEY = "dynamicQuoteGenerator_lastFilter";

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// Save last viewed quote index (sessionStorage)
function saveLastViewed(index) {
  sessionStorage.setItem(LAST_VIEWED_KEY, index);
}

// Load last viewed quote index
function loadLastViewed() {
  const value = sessionStorage.getItem(LAST_VIEWED_KEY);
  return value !== null ? Number(value) : null;
}

// Display a quote at a specific index
function displayQuoteAtIndex(index) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const quote = quotes[index];
  if (!quote) return;
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
  saveLastViewed(index);
}

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes found for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").textContent = `"${quote.text}" — [${quote.category}]`;
}

// Show last viewed quote
function showLastViewedQuote() {
  const last = loadLastViewed();
  if (last !== null && last >= 0 && last < quotes.length) {
    displayQuoteAtIndex(last);
  } else {
    alert("No last viewed quote in this session.");
  }
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();

  if (!textInput || !categoryInput) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text: textInput, category: categoryInput };
  quotes.push(newQuote);
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");

  populateCategories(); // Update dropdown dynamically
  displayQuoteAtIndex(quotes.length - 1);
}

// Populate categories in dropdown dynamically
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];

  select.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    select.appendChild(option);
  });

  const savedFilter = localStorage.getItem(FILTER_KEY);
  if (savedFilter && uniqueCategories.includes(savedFilter)) {
    select.value = savedFilter;
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem(FILTER_KEY, selected);
  const filteredQuotes = getFilteredQuotes();

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes found for this category.";
  } else {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    document.getElementById("quoteDisplay").textContent = `"${quote.text}" — [${quote.category}]`;
  }
}

// Get quotes based on selected filter
function getFilteredQuotes() {
  const selected = localStorage.getItem(FILTER_KEY) || "all";
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category.toLowerCase() === selected.toLowerCase());
}

// Export to JSON
function exportToJsonFile() {
  const data = JSON.stringify(quotes);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(file);
}

// Initialize app
function init() {
  loadQuotes();
  populateCategories();
  const savedFilter = localStorage.getItem(FILTER_KEY);
  if (savedFilter) {
    document.getElementById("categoryFilter").value = savedFilter;
  }
  filterQuotes(); // show quotes based on saved filter

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("lastViewedBtn").addEventListener("click", showLastViewedQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

document.addEventListener("DOMContentLoaded", init);
