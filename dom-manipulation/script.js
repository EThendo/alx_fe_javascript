// Load quotes from localStorage or use default list
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// ----------------------
// Helper Functions
// ----------------------

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
}

// Add new quote dynamically
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newQuoteText = textInput.value.trim();
  const newQuoteCategory = categoryInput.value.trim();

  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text: newQuoteText, category: newQuoteCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
  showRandomQuote();
}

// ----------------------
// Filtering System
// ----------------------

// Populate category dropdown
function populateCategories() {
  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  // Restore saved filter from localStorage
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && uniqueCategories.includes(savedFilter)) {
    categoryFilter.value = savedFilter;
  } else {
    categoryFilter.value = "all";
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory); // ✅ Save filter to localStorage
  showRandomQuote(); // ✅ Update displayed quote
}

// ----------------------
// Initialize
// ----------------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

populateCategories(); // ✅ Build filter menu
showRandomQuote(); // ✅ Display quote when page loads
