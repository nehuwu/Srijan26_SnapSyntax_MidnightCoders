import { useState } from "react";
import "./style.css";

function App() {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState("");

  const responses = {
    Sad: "Hey… it’s okay to not be okay. Even clouds pass. ☁️",
    Anxiety: "Breathe in… breathe out… you’re safe right now 🌿",
    Overwhelmed: "You don’t have to do everything today. One step is enough.",
    Happy: "Hold onto this moment. You deserve it ✨",
    Burnout: "Rest is productive too. You’re not a machine 💛"
  };

  return (
    <div className="container">
      {!opened ? (
        <div className="head" onClick={() => setOpened(true)}>
          🧠
          <p>Tap to open your mind</p>
        </div>
      ) : (
        <div className="card">
          <h2>How are you feeling?</h2>

          <div className="buttons">
            {Object.keys(responses).map((mood) => (
              <button key={mood} onClick={() => setMessage(responses[mood])}>
                {mood}
              </button>
            ))}
          </div>

          <p className="message">{message}</p>
        </div>
      )}
    </div>
  );
}

export default App;