import React, { useState, useRef, useEffect } from 'react';
import './StylingCrewChat.css';

const StylingCrewChat = () => {
  const [messages, setMessages] = useState([
    {
      sender: "System",
      text: "Welcome to the Myntra Styling Crew! Tell us what you're looking for, and our agents (Stylist, Trend, and Finance) will debate to find you the perfect outfit.",
      role: "system"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Replace with actual API key in .env

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAgent = async (agentName, prompt, userMessage) => {
    // If no API key, use fallback mock logic for the hackathon
    if (!apiKey) {
      return new Promise(resolve => {
        setTimeout(() => {
          let response = "";
          if (agentName === "Trend Agent") response = "I've been scanning Pinterest and the 'Office Siren' look is trending right now! We should look for structured blazers and sleek skirts.";
          else if (agentName === "Stylist Agent") response = "I agree, but looking at your wardrobe, you already have a black blazer. Let's find a unique top to pair it with instead.";
          else if (agentName === "Finance Agent") response = "Hold on! The budget is tight. I found a top that matches the trend and you can use your 500 Myntra Insider points to get it for ₹899!";
          resolve(response);
        }, 1500 + Math.random() * 1000);
      });
    }

    try {
      // Call Gemini API (using REST for zero dependencies)
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}\nUser says: ${userMessage}` }] }]
        })
      });
      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      console.error(e);
      return "I'm having trouble connecting to my database.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { sender: "You", text: inputText, role: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // 1. Stylist Agent Speaks
    const stylistPrompt = "You are the Myntra Stylist Agent. You know the user's body type and wardrobe. Keep it to 2 short sentences.";
    const stylistResponse = await simulateAgent("Stylist Agent", stylistPrompt, userMsg.text);
    setMessages(prev => [...prev, { sender: "Stylist Agent", text: stylistResponse, role: "agent-stylist" }]);

    // 2. Trend Agent Speaks
    const trendPrompt = "You are the Myntra Trend Agent. You analyze social media. Suggest something trendy related to what the Stylist said. Keep it to 2 short sentences.";
    const trendResponse = await simulateAgent("Trend Agent", trendPrompt, userMsg.text);
    setMessages(prev => [...prev, { sender: "Trend Agent", text: trendResponse, role: "agent-trend" }]);

    // 3. Finance Agent Speaks
    const financePrompt = "You are the Myntra Finance Agent. You look for coupons and discounts. Make sure the outfit fits a reasonable budget. Keep it to 2 short sentences.";
    const financeResponse = await simulateAgent("Finance Agent", financePrompt, userMsg.text);
    setMessages(prev => [...prev, { sender: "Finance Agent", text: financeResponse, role: "agent-finance" }]);

    setIsTyping(false);
  };

  return (
    <div className="styling-crew-container">
      <div className="crew-header">
        <h2>Myntra Styling Crew</h2>
        <p>3 AI Agents collaborating to style you</p>
      </div>

      <div className="crew-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-bubble ${msg.role}`}>
            <div className="message-sender">{msg.sender}</div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="message-bubble system typing-indicator">
            The Crew is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="crew-input-area" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="E.g., I need an outfit for a beach party under ₹2000" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" disabled={isTyping || !inputText.trim()}>Send</button>
      </form>
    </div>
  );
};

export default StylingCrewChat;
