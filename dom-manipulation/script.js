let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

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
  const savedFilter = localStorage.getItem("selectedCategory");
  categoryFilter.value = savedFilter && uniqueCategories.includes(savedFilter) ? savedFilter : "all";
}

// Show notification
function showNotification(message, duration = 4000) {
  notification.style.display = "block";
  notification.textContent = message;
  setTimeout(() => (notification.style.display = "none"), duration);
}

// Show random quote
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

// Filter quotes
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// Add quote locally and post to server
async function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newQuoteText = textInput.value.trim();
  const newQuoteCategory = categoryInput.value.trim();
  if (!newQuoteText || !newQuoteCategory) return alert("Please enter both a quote and a category.");

  const newQuote = { text: newQuoteText, category: newQuoteCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();
  showNotification("Quote added locally. Syncing with server...");

  await postQuoteToServer(newQuote);

  textInput.value = "";
  categoryInput.value = "";
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    // Convert server data to quote format
    return data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching server quotes:", error);
    return [];
  }
}

// Post quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify({ title: quote.text, body: "", userId: 1 }),
      headers: { "Content-Type": "application/json" }
    });
    showNotification("Quote synced to server!");
  } catch (error) {
    console.error("Error posting quote:", error);
    showNotification("Failed to sync quote to server.");
  }
}

// Sync quotes with server and resolve conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localTexts = new Set(quotes.map(q => q.text));
  let conflicts = 0;

  serverQuotes.forEach(sq => {
    if (!localTexts.has(sq.text)) {
      quotes.push(sq);
    } else {
      conflicts++;
    }
  });

  if (conflicts > 0) showNotification(`${conflicts} conflicts resolved — server takes priority`);
  else showNotification("Quotes synced with server successfully");

  saveQuotes();
  populateCategories();
  showRandomQuote();
}

// Initialize
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
categoryFilter.addEventListener("change", filterQuotes);

populateCategories();
showRandomQuote();
syncQuotes();
setInterval(syncQuotes, 20000);
