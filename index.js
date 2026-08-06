/* ============================================
   SATHI.ai — a small rule-based classroom chatbot
   Pure HTML/CSS/JS. No backend, no API key.
   ============================================ */

/* ---------- Boot sequence ---------- */
const bootLines = [
  "booting SATHI.ai …",
  "loading class notes … done",
  "loading roast module … done",
  "ready."
];

function runBoot() {
  const bootScreen = document.getElementById("boot-screen");
  const bootText = document.getElementById("boot-text");
  const app = document.getElementById("app");
  let lineIndex = 0;
  let charIndex = 0;
  let current = "";

  function typeNext() {
    if (lineIndex >= bootLines.length) {
      setTimeout(() => {
        bootScreen.style.transition = "opacity 0.4s ease";
        bootScreen.style.opacity = "0";
        setTimeout(() => {
          bootScreen.hidden = true;
          app.hidden = false;
          initChat();
        }, 400);
      }, 350);
      return;
    }
    const line = bootLines[lineIndex];
    if (charIndex < line.length) {
      current += line[charIndex];
      bootText.textContent = current;
      charIndex++;
      setTimeout(typeNext, 22);
    } else {
      current += "\n";
      lineIndex++;
      charIndex = 0;
      setTimeout(typeNext, 180);
    }
  }
  typeNext();
}

/* ---------- Response engine ---------- */

const KALU_ROASTS = [
  "Kalu nahi, Calculator bolte hain isko—har time bas calculation hi chalti rehti hai. 😂",
  "Bhai itna serious rehta hai ki attendance bhi usse permission leke lagti hai.",
  "Shivam ko dekh ke lagta hai syllabus uska personal dushman hai.",
  "Class ka CEO bina salary ke.",
  "Teacher ka unofficial assistant."
];

function pickRoastLines() {
  // Return all lines in a fixed, readable order (as a single multi-line reply)
  return KALU_ROASTS.join("\n");
}

const jokes = [
  "Why did the student eat his homework? Because the teacher said it was a piece of cake.",
  "Why was the math book sad? It had too many problems.",
  "Teacher: Where were you born? Student: I don't know, I was too young to remember."
];

function safeCalculate(expr) {
  // Only allow digits, spaces, and basic operators — no letters, no function calls.
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)();
    if (typeof result === "number" && isFinite(result)) return result;
  } catch (e) {
    return null;
  }
  return null;
}

function getBotReply(rawInput) {
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  // 1. The "kalu" easter egg — roast mode
  if (lower.includes("kalu")) {
    return { text: pickRoastLines(), roast: true };
  }

  // 2. Creator question
  if (
    lower.includes("aadarsh yadav") ||
    ((lower.includes("who made you") || lower.includes("who created you") || lower.includes("your developer") || lower.includes("your creator")) )
  ) {
    return { text: "Aadarsh is a class 10th developer — he built me! 🚀" };
  }

  // Greetings
  if (/\b(hi|hello|hey|hii+|yo)\b/.test(lower)) {
    return { text: "Hey! 👋 I'm SATHI, your classroom AI. Ask me anything." };
  }

  // How are you
  if (lower.includes("how are you")) {
    return { text: "Running at 100% uptime and zero attendance issues. How about you?" };
  }

  // What can you do / help
  if (lower.includes("what can you do") || lower === "help" || lower.includes("help me")) {
    return {
      text:
        "I can chat, do quick math (try '12*8+4'), tell a joke, tell you the time, and I know a thing or two about the class. Try the suggestion chips below!"
    };
  }

  // Name
  if (lower.includes("your name") || lower === "who are you") {
    return { text: "I'm SATHI — Student's AI companion, built for the classroom." };
  }

  // Time / date
  if (lower.includes("time") && !lower.includes("sometimes")) {
    return { text: `Right now it's ${new Date().toLocaleTimeString()}.` };
  }
  if (lower.includes("date") || lower.includes("today")) {
    return { text: `Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.` };
  }

  // Joke
  if (lower.includes("joke") || lower.includes("funny")) {
    return { text: jokes[Math.floor(Math.random() * jokes.length)] };
  }

  // Thanks
  if (/\b(thanks|thank you|thx)\b/.test(lower)) {
    return { text: "Anytime! That's what I'm here for. 🙂" };
  }

  // Bye
  if (/\b(bye|goodbye|see ya)\b/.test(lower)) {
    return { text: "Bye! Good luck with the studying. 📚" };
  }

  // Simple calculator
  if (/[0-9]/.test(lower) && /[+\-*/]/.test(lower)) {
    const cleaned = input.replace(/[^0-9+\-*/().\s]/g, "");
    const result = safeCalculate(cleaned);
    if (result !== null) {
      return { text: `${cleaned.trim()} = ${result}` };
    }
  }

  // Fallback
  const fallbacks = [
    "I'm a small classroom project, so I might not know that one yet — try asking something else!",
    "Hmm, that's outside what I've been taught so far. Ask me something else?",
    "I don't have an answer for that yet, but I'm always learning. Try another question!"
  ];
  return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
}

/* ---------- UI wiring ---------- */

function initChat() {
  const chatWindow = document.getElementById("chat-window");
  const composer = document.getElementById("composer");
  const input = document.getElementById("user-input");
  const suggestions = document.getElementById("suggestions");

  function addMessage(text, sender, opts = {}) {
    const bubble = document.createElement("div");
    bubble.className = `msg ${sender}` + (opts.roast ? " roast" : "");
    bubble.textContent = text;
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.id = "typing-indicator";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chatWindow.appendChild(typing);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
  }

  function handleSend(text) {
    const message = text.trim();
    if (!message) return;
    addMessage(message, "user");
    input.value = "";
    showTyping();

    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      removeTyping();
      const reply = getBotReply(message);
      addMessage(reply.text, "bot", { roast: reply.roast });
    }, delay);
  }

  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSend(input.value);
  });

  suggestions.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    handleSend(chip.dataset.msg);
  });

  // Opening message
  addMessage("Hi! I'm SATHI, a simple AI built for the classroom. Ask me anything — try 'who is kalu' 👀", "bot");
  input.focus();
}

document.addEventListener("DOMContentLoaded", runBoot);
