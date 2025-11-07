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
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// Save last viewed quote index to sessionStorage
function saveLastViewed(index) {
  sessionStorage.setItem(LAST_VIEWED_KEY, index);
}

// Load last viewed index from sessionStorage
function loadLastViewed() {
  const value = sessionStorage.getItem(LAST_VIEWED_KEY);
  return value !== null ? Number(value) : null;
}

// Display a quote at a given index
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
    alert("No last viewed quote in this session.");
  }
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();

  if (!textInput || !categoryInput) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text: textInput, category: categoryInput };
  quotes.push(newQuote);

  saveQuotes(); // **Save to localStorage immediately**

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
  displayQuoteAtIndex(quotes.length - 1);
}

// Export quotes to JSON file
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

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes); // push into array
    saveQuotes(); // save to localStorage
    alert("Quotes imported successfully!");
  };
  reader.readAsText(file);
}

// Initialize app
function init() {
  loadQuotes(); // load from localStorage

  // Display last viewed quote if exists
  const lastViewed = loadLastViewed();
  if (lastViewed !== null && lastViewed < quotes.length) {
    displayQuoteAtIndex(lastViewed);
  } else {
    showRandomQuote();
  }
}

document.addEventListener("DOMContentLoaded", init);
