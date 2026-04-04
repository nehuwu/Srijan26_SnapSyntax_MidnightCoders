let counts = {
    Happy: 0,
    Sad: 0,
    Angry: 0,
    Calm: 0
};

const quotes = {
    Happy: "Keep shining 🌟",
    Sad: "This too shall pass 💙",
    Angry: "Take a deep breath 🔥",
    Calm: "Peace looks good on you 🌿"
};

function addMood(mood) {
    let reason = document.getElementById("reason").value;

    counts[mood]++;

    updateStats();
    changeBackground(mood);

    document.getElementById("quote").innerText = quotes[mood];

    let container = document.getElementById("moodContainer");

    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `<h3>${mood}</h3><p>${reason}</p>`;

    container.prepend(card);

    document.getElementById("reason").value = "";
}

function updateStats() {
    document.getElementById("stats").innerText =
        `😊 ${counts.Happy} | 😢 ${counts.Sad} | 😡 ${counts.Angry} | 😌 ${counts.Calm}`;
}

function changeBackground(mood) {
    let body = document.body;

    if (mood === "Happy")
        body.style.background = "linear-gradient(135deg, #f7971e, #ffd200)";
    else if (mood === "Sad")
        body.style.background = "linear-gradient(135deg, #4facfe, #00f2fe)";
    else if (mood === "Angry")
        body.style.background = "linear-gradient(135deg, #ff416c, #ff4b2b)";
    else if (mood === "Calm")
        body.style.background = "linear-gradient(135deg, #43cea2, #185a9d)";
}