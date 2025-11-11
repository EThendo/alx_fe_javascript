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
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

function saveLastViewed(index) {
  sessionStorage.setItem(LAST_VIEWED_KEY, index);
}

function loadLastViewed() {
  const value = sessionStorage.getItem(LAST_VIEWED_KEY);
  return value !== null ? Number(value) : null;
}

function displayQuoteAtIndex(index) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const quote = quotes[index];
  if (!quote) return;
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
  saveLastViewed(index);
}

function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  displayQuoteAtIndex(randomIndex);
}

function showLastViewedQuote() {
  const last = loadLastViewed();
  if (last !== null && last >= 0 && last < quotes.length) {
    displayQuoteAtIndex(last);
  } else {
    alert("No last viewed quote in this session.");
  }
}

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
  displayQuoteAtIndex(quotes.length - 1);
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
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format. Please upload a valid quotes array.");
        return;
      }
      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
      displayQuoteAtIndex(quotes.length - 1);
    } catch (error) {
      alert("Error reading file. Make sure it's a valid JSON file.");
    }
  };
  reader.readAsText(file);
}

function init() {
  loadQuotes();
  const lastViewed = loadLastViewed();
  if (lastViewed !== null && lastViewed < quotes.length) {
    displayQuoteAtIndex(lastViewed);
  } else {
    showRandomQuote();
  }
}

document.addEventListener("DOMContentLoaded", init);

