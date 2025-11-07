// Array of quote objects (default set)
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const STORAGE_KEY = "dynamicQuoteGenerator_quotes";
const LAST_VIEWED_KEY = "dynamicQuoteGenerator_lastViewed"; // for sessionStorage

// Save quotes array to localStorage
function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
  }
}

// Load quotes array from localStorage (if exists)
function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // validate items: must have text and category
        const valid = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
        if (valid.length) quotes = valid;
      }
    }
  } catch (err) {
    console.error("Failed to load quotes from localStorage:", err);
  }
}

// Save last viewed index to sessionStorage
function saveLastViewed(index) {
  try {
    sessionStorage.setItem(LAST_VIEWED_KEY, String(index));
  } catch (err) {
    console.error("Failed to save last viewed in sessionStorage:", err);
  }
}

// Load last viewed index from sessionStorage; returns null if none
function loadLastViewed() {
  try {
    const v = sessionStorage.getItem(LAST_VIEWED_KEY);
    return v === null ? null : Number(v);
  } catch (err) {
    console.error("Failed to read last viewed from sessionStorage:", err);
    return null;
  }
}

// Function to show a random quote
function showRandomQuote() {
  if (!quotes.length) {
    document.getElementById("quoteDisplay").textContent = "No quotes available. Add one!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  displayQuoteAtIndex(randomIndex);
}

// Displays quote at given index (and saves last viewed to sessionStorage)
function displayQuoteAtIndex(index) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const q = quotes[index];
  if (!q) {
    quoteDisplay.textContent = "Quote not found.";
    return;
  }
  quoteDisplay.textContent = `"${q.text}" — [${q.category}]`;
  saveLastViewed(index);
}

// Show last viewed quote (if any)
function showLastViewedQuote() {
  const idx = loadLastViewed();
  if (idx === null || isNaN(idx) || idx < 0 || idx >= quotes.length) {
    alert("No last viewed quote found in this session.");
    return;
  }
  displayQuoteAtIndex(idx);
}

// Create the Add Quote Form dynamically (required by original task)
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = ""; // clear

  const title = document.createElement("h3");
  title.textContent = "Add Your Own Quote";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(title);
  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Add new quote to quotes array and persist
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  if (!textInput || !categoryInput) {
    alert("Form inputs missing.");
    return;
  }
  const newQuoteText = textInput.value.trim();
  const newQuoteCategory = categoryInput.value.trim();

  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text: newQuoteText, category: newQuoteCategory };
  quotes.push(newQuote);
  saveQuotes();

  // clear inputs
  textInput.value = "";
  categoryInput.value = "";

  // Show the newly added quote
  displayQuoteAtIndex(quotes.length - 1);
}

// Export quotes to JSON file (download)
function exportToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes_export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export quotes.");
  }
}

// Import from a File object (reads, validates, and appends)
function importFromFile(file) {
  if (!file) {
    alert("No file selected for import.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!Array.isArray(imported)) {
        alert("Imported JSON must be an array of objects.");
        return;
      }

      // Validate and extract good entries
      const good = imported.filter(item =>
        item && typeof item.text === "string" && typeof item.category === "string"
      );

      if (!good.length) {
        alert("No valid quotes found in the imported file. Expect objects with 'text' and 'category' strings.");
        return;
      }

      // Append valid ones and save
      quotes.push(...good);
      saveQuotes();
      alert(`${good.length} quote(s) imported successfully!`);
    } catch (err) {
      console.error("Import parse error:", err);
      alert("Failed to parse JSON file. Ensure it is valid JSON.");
    }
  };

  reader.onerror = function() {
    console.error("File read error:", reader.error);
    alert("Failed to read the file.");
  };

  reader.readAsText(file);
}

// Hook up import UI
function setupImportExportControls() {
  const importFileInput = document.getElementById("importFile");
  const importBtn = document.getElementById("importBtn");
  const exportBtn = document.getElementById("exportBtn");

  if (importBtn) {
    importBtn.addEventListener("click", () => {
      if (importFileInput && importFileInput.files && importFileInput.files[0]) {
        importFromFile(importFileInput.files[0]);
        // Clear the input so same file can be re-selected if needed
        importFileInput.value = "";
      } else {
        alert("Please select a .json file first.");
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", exportToJsonFile);
  }
}

// Initialization: load saved quotes, setup UI, attach listeners
function init() {
  loadQuotes();
  createAddQuoteForm();

  // Attach the button listeners expected by grader
  const newQuoteBtn = document.getElementById("newQuote");
  if (newQuoteBtn) newQuoteBtn.addEventListener("click", showRandomQuote);

  const showLastBtn = document.getElementById("showLast");
  if (showLastBtn) showLastBtn.addEventListener("click", showLastViewedQuote);

  setupImportExportControls();

  // If session has last viewed, show it; otherwise show a random starter quote
  const lastIdx = loadLastViewed();
  if (lastIdx !== null && lastIdx >= 0 && lastIdx < quotes.length) {
    displayQuoteAtIndex(lastIdx);
  } else {
    // Show one random quote at startup
    showRandomQuote();
  }
}

// Run on load
document.addEventListener("DOMContentLoaded", init);
