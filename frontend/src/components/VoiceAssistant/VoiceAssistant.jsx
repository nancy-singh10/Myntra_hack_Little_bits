import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Square } from 'lucide-react';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Discover the capabilities of Conversational Agents powered by VoiceAI');
  const [inputText, setInputText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const navigate = useNavigate();

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatHistoryRef = useRef([]); // Add conversation memory

  const apiKey = import.meta.env.VITE_SARVAM_API_KEY;

  const speakSarvam = async (text, onFinished = null) => {
    try {
      if (!apiKey) {
        setStatusText('API Key missing');
        return;
      }

      setStatusText('Speaking...');

      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: "hi-IN",
          speaker: "priya",
          speech_sample_rate: 8000,
          enable_preprocessing: true,
          model: "bulbul:v3"
        })
      });

      const data = await response.json();
      if (data && data.audios && data.audios.length > 0) {
        const audioSrc = `data:audio/wav;base64,${data.audios[0]}`;
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.onended = () => {
            if (onFinished) onFinished();
          };
          audioRef.current.play();
        }
        setStatusText(text);
      } else if (data && data.error) {
        setStatusText(`Error: ${data.error.message.substring(0, 30)}...`);
      } else {
        setStatusText('Error getting audio');
      }
    } catch (error) {
      console.error("Error with Sarvam TTS:", error);
      setStatusText('Voice error');
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setStatusText('Thinking...');
    try {
      const formData = new FormData();
      // Ensure the filename has an extension the API accepts
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'saaras:v3');

      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey
        },
        body: formData
      });

      const data = await response.json();
      if (data && data.transcript) {
        setStatusText(`"${data.transcript}"`);
        processCommand(data.transcript);
      } else {
        setStatusText('Could not understand.');
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setStatusText('Transcription failed.');
    }
  };

  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const rafRef = useRef(null);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setAudioLevel(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        transcribeAudio(audioBlob);

        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        setAudioLevel(0);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };

      mediaRecorder.start();
      setIsListening(true);
      setStatusText('Listening...');

      // Silence detection logic
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.minDecibels = -70;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let silenceStart = performance.now();
      let hasSpoken = false;
      const recordingStartTime = performance.now();

      const checkAudioLevel = () => {
        // Break the loop if we've already stopped recording
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(average);
        const now = performance.now();

        // Hard timeout: Always stop after 15 seconds max to prevent getting stuck
        if (now - recordingStartTime > 15000) {
          stopRecording();
          return;
        }

        if (average > 30) { // Increased threshold to ignore background static/fans
          hasSpoken = true;
          silenceStart = now;
        } else {
          // Wait 2.5 seconds of silence before cutting off after they started speaking
          if (hasSpoken && (now - silenceStart > 2500)) {
            stopRecording();
            return;
          } else if (!hasSpoken && (now - silenceStart > 6000)) {
            stopRecording();
            return;
          }
        }
        rafRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setStatusText('Microphone access denied.');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const simulateTypingAndNavigate = (text, path, afterNavigationCallback = null) => {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.value = '';
      let i = 0;
      const typeChar = () => {
        if (i < text.length) {
          searchInput.value += text.charAt(i);
          i++;
          setTimeout(typeChar, 20); // Sped up to 20ms per character
        } else {
          // Done typing, wait 200ms so user can see it, then navigate (Sped up from 400ms)
          setTimeout(() => {
            navigate(path);
            if (afterNavigationCallback) {
              setTimeout(afterNavigationCallback, 150); // Give page time to load (Sped up from 300ms)
            }
          }, 200);
        }
      };
      typeChar();
    } else {
      navigate(path); // fallback if search bar not found
      if (afterNavigationCallback) {
        setTimeout(afterNavigationCallback, 150);
      }
    }
  };

  const processCommand = async (command) => {
    console.log("VOICE TRANSCRIPT:", command);
    setStatusText('Thinking...');

    // --- DEMO INTERCEPT ---
    const lowerCmd = command.toLowerCase();
    if (lowerCmd.includes('pahle') || lowerCmd.includes('saree') || lowerCmd.includes('cart')) {
      const demoReply = "Yeh saree sach mein bahut sundar hai! Main isse turant aapke cart mein add karke order place kar rahi hoon.";
      speakSarvam(demoReply);
      setStatusText('Processing your order...');
      
      setTimeout(() => {
        navigate('/product/1'); // Open the saree
      }, 1500);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'add-to-bag' } }));
      }, 4000);

      setTimeout(() => {
        navigate('/cart');
      }, 6000);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'place-order' } }));
      }, 8500);

      return;
    }
    // -----------------------

    try {
      const userMessage = { role: "user", content: command };
      const apiMessages = [
        {
          role: "system",
          content: "You are Myntra's conversational AI assistant. You help users shop. You MUST reply in the EXACT SAME LANGUAGE the user speaks (e.g., if they speak Hindi, reply in Hindi. If English, reply in English). ALWAYS output your response as a valid JSON object EXACTLY matching this schema, with no markdown formatting or backticks: {\"reply\": \"Your conversational response spoken back to the user\", \"action\": \"one of: [filter-price, add-to-bag, add-to-wishlist, place-order, deliver-here, navigate-search, navigate-cart, navigate-wishlist, navigate-home, none]\", \"searchQuery\": \"if navigate-search or filter-price or add-to-bag, the item to search (e.g. 'saree', 'kurta'), else null\", \"maxPrice\": \"if filter-price, the maximum price as an integer, else null\"}"
        },
        ...chatHistoryRef.current,
        userMessage
      ];

      const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey
        },
        body: JSON.stringify({
          model: "sarvam-105b-conversations",
          messages: apiMessages
        })
      });

      const data = await response.json();

      if (data && data.choices && data.choices.length > 0) {
        let responseText = data.choices[0].message.content;

        // Robust JSON extraction: Find the first { and last } to ignore conversational filler
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
          responseText = responseText.substring(firstBrace, lastBrace + 1);
        }

        try {
          const intent = JSON.parse(responseText);
          console.log("LLM INTENT:", intent);

          // Update conversation history
          chatHistoryRef.current.push(userMessage);
          chatHistoryRef.current.push({ role: "assistant", content: responseText });

          // Keep only the last 10 messages (5 conversational turns) to avoid blowing up the context window
          if (chatHistoryRef.current.length > 10) {
            chatHistoryRef.current = chatHistoryRef.current.slice(-10);
          }

          let action = intent.action;

          // Contextual Awareness: If they ask to add to bag/wishlist, but they aren't on a product details page,
          // we can't add a generic "kurta" to the bag. We must navigate them to search for it first.
          const isOnProductPage = window.location.pathname.includes('/product/');
          if (['add-to-bag', 'add-to-wishlist'].includes(action) && !isOnProductPage) {
            if (intent.searchQuery) {
              action = 'navigate-search';
              intent.reply = `I need you to select a specific ${intent.searchQuery} first. Taking you to the catalog!`;
            } else {
              intent.reply = "Please open a specific product first before adding to your bag!";
              action = 'none';
            }
          }

          speakSarvam(intent.reply);

          if (action === 'navigate-search' && intent.searchQuery) {
            simulateTypingAndNavigate(intent.searchQuery, `/search?q=${intent.searchQuery}`);
          } else if (action === 'filter-price' && intent.searchQuery && intent.maxPrice) {
            simulateTypingAndNavigate(intent.searchQuery, `/search?q=${intent.searchQuery}`, () => {
              window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'filter-price', maxPrice: intent.maxPrice } }));
            });
          } else if (action === 'navigate-cart') {
            navigate('/cart');
          } else if (action === 'navigate-wishlist') {
            navigate('/wishlist');
          } else if (action === 'navigate-home') {
            navigate('/');
          } else if (['add-to-bag', 'add-to-wishlist', 'place-order', 'deliver-here'].includes(action)) {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action } }));
          }
        } catch (parseError) {
          console.error("Failed to parse LLM JSON:", parseError, responseText);
          speakSarvam("Sorry, I got confused processing that.");
          setStatusText(`Error parsing: ${responseText.substring(0, 50)}...`);
        }
      } else {
        console.error("Invalid LLM response:", data);
        speakSarvam("I'm having trouble connecting to my brain right now.");
        setStatusText(`API Error: ${JSON.stringify(data).substring(0, 50)}...`);
      }
    } catch (error) {
      console.error("Error calling Sarvam Chat API:", error);
      speakSarvam("Sorry, I'm having a network issue.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      speakSarvam('Namaste! I am Maya, your personal stylist. How can I help you dress beautifully today?', () => {
        startRecording();
      });
    } else {
      stopRecording();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      processCommand(inputText);
      setInputText('');
    }
  };

  return (
    <div className="voice-assistant-wrapper">
      <div className={`va-panel ${isOpen ? 'open' : ''}`}>
        <div className="va-header">
          <div className="language-selector">
            <span>🗣️</span> Hinglish / English <span>▼</span>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="orb-container">
          <div
            className={`orb ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            style={isListening ? {
              boxShadow: `0 0 ${audioLevel}px ${audioLevel / 2}px rgba(255, 63, 108, 0.6)`,
              transform: `scale(${1 + audioLevel / 200})`,
              transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out'
            } : {}}
          >
            <div className="orb-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isListening ? <Square fill="currentColor" size={20} /> : <Mic size={24} />}
            </div>
          </div>
        </div>

        <div className="status-text">
          {statusText}
        </div>

        <form className="input-area" onSubmit={handleTextSubmit}>
          <input
            type="text"
            placeholder="Or send a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="send-btn">➤</button>
        </form>
      </div>

      <button
        className="fab-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Voice Assistant"
      >
      </button>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default VoiceAssistant;
