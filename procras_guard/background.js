chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchAIGuardMessage") {
    generateLocalAIMessage(request.site)
      .then((msg) => sendResponse({ message: msg }))
      .catch(() => sendResponse({ message: "You've been scrolling for 30 seconds. Time to switch back to productive work!" }));
    return true; 
  }

  if (request.action === "closeCurrentTab") {
    chrome.tabs.remove(sender.tab.id);
  }
});

async function generateLocalAIMessage(siteName) {
  try {
    const prompt = `You are a supportive, firm focus coach. The user has been doomscrolling on ${siteName} for 30 seconds instead of working. Write a concise, direct, 1-sentence reminder asking them to close the tab and return to work. Keep it punchy and persuasive.`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma:2b",
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.warn("Ollama local connection failed, falling back to default message.", error);
    return "You've been caught scrolling! Let's close this tab and get back on track.";
  }
}