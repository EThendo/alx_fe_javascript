let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  quotes = JSON.parse(localStorage.getItem("quotes")) || quotes;
}

function showNotification(message, duration = 4000) {
  notification.style.display = "block";
  notification.textContent = message;
  setTimeout(() => (notification.style.display = "none"), duration);
}

function populateCategories() {
  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter && uniqueCategories.includes(savedFilter)) {
    categoryFilter.value = savedFilter;
  } else {
    categoryFilter.value = "all";
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes =
    selectedCategory === "all"
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
  showNotification("Quote added locally. Will sync with server soon!");
  showRandomQuote();
  textInput.value = "";
  categoryInput.value = "";
}

async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();
    const serverQuotes = [
      { text: "Server wisdom always wins.", category: "Server" },
      { text: "Conflicts teach synchronization.", category: "Learning" }
    ];
    resolveConflicts(serverQuotes);
  } catch (error) {
    console.error("Server fetch failed:", error);
  }
}

function resolveConflicts(serverQuotes) {
  const localTexts = new Set(quotes.map(q => q.text));
  let conflicts = 0;
  serverQuotes.forEach(serverQuote => {
    if (!localTexts.has(serverQuote.text)) {
      quotes.push(serverQuote);
    } else {
      conflicts++;
    }
  });
  if (conflicts > 0) {
    showNotification(`${conflicts} conflicts resolved — server data took priority.`);
  } else {
    showNotification("Data synced with server successfully!");
  }
  saveQuotes();
  populateCategories();
}

setInterval(fetchServerQuotes, 20000);

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

populateCategories();
showRandomQuote();
fetchServerQuotes();
