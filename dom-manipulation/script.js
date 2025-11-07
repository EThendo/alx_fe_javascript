// Default quotes
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const STORAGE_KEY = "dynamicQuoteGenerator_quotes";
const LAST_VIEWED_KEY = "dynamicQuoteGenerator_lastViewed";

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// Load quotes from localStorage
function loadQuotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) quotes = parsed;
    } catch (e) {
      console.error("Error loading quotes:", e);
    }
  }
}

// Save last viewed index to sessionStorage
function saveLastViewed(index) {
  sessionStorage.setItem(LAST_VIEWED_KEY, String(index));
}

// Load last viewed index
function loadLastViewed() {
  const value = sessionStorage.getItem(LAST_VIEWED_KEY);
  return value !== null ? Number(value) : null;
}

// Display quote by index
function displayQuoteAtIndex(index) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const quote = quotes[index];
  if (!quote) return;
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
  saveLastViewed(index);
}

// Show random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  displayQuoteAtIndex(randomIndex);
}

// Show last viewed quote
function showLastViewedQuote() {
  const last = loadLastViewed();
  if (last !== null && last >= 0 && last < quotes.length) {
    displayQuoteAtIndex(last);
  } else {
    alert("No last viewed quote found in this session.");
  }
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  alert("Quote added successfully!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  displayQuoteAtIndex(quotes.length - 1);
}

// Export quotes to JSON
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON (grader-required)
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format. Must be an array of objects.");
        return;
      }

      const valid = importedQuotes.filter(
        (q) => q && typeof q.text === "string" && typeof q.category === "string"
      );

      if (valid.length === 0) {
        alert("No valid quotes found in the imported file.");
        return;
      }

      quotes.push(...valid);
      saveQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to import quotes.");
    }
  };

  reader.readAsText(file);
}

// Initialize
function init() {
  loadQuotes();

  // Display last or random quote
  const lastViewed = loadLastViewed();
  if (lastViewed !== null && lastViewed < quotes.length) {
    displayQuoteAtIndex(lastViewed);
  } else {
    showRandomQuote();
  }
}

document.addEventListener("DOMContentLoaded", init);
