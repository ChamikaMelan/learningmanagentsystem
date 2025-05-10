import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker?url";

import "./PDFViewer.css";

// Configure the PDF.js worker
GlobalWorkerOptions.workerSrc = workerUrl;

const PDFViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfUrl = location.state?.pdfUrl;

  const [pdfText, setPdfText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadPdfText = async () => {
      if (!pdfUrl) return;

      const loadingTask = getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      let textContent = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const text = await page.getTextContent();
        const pageText = text.items.map((item) => item.str).join(" ");
        textContent += pageText + " ";
      }

      setPdfText(textContent);
    };

    loadPdfText();

    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [pdfUrl]);

  const handlePlay = () => {
    if (!pdfText) return;
    if (window.speechSynthesis.speaking) return;

    const utterance = new SpeechSynthesisUtterance(pdfText);
    utterance.rate = rate;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!pdfUrl) {
    return (
      <div className="p-4">
        <p>No PDF available</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Lecture PDF</h2>
      <iframe
        src={pdfUrl}
        className="w-full h-[80vh] border rounded mb-4"
        title="Lecture PDF"
      ></iframe>

      {/* Speed Controller */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Speed: {rate.toFixed(1)}x</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Voice Selector */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Voice:</label>
        <select
          value={selectedVoice?.name || ""}
          onChange={(e) => {
            const voice = voices.find((v) => v.name === e.target.value);
            setSelectedVoice(voice);
          }}
          className="w-full p-2 border rounded"
        >
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={handlePlay}
          disabled={isSpeaking}
          className="px-4 py-2 bg-black text-white rounded"
        >
          ▶️ Play
        </button>
        <button
          onClick={handlePause}
          disabled={!isSpeaking || isPaused}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          ⏸️ Pause
        </button>
        <button
          onClick={handleResume}
          disabled={!isPaused}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          ▶️ Resume
        </button>
        <button
          onClick={handleStop}
          disabled={!isSpeaking}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          ⏹️ Stop
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
