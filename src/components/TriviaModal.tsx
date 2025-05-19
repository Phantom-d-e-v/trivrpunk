// /components/TriviaModal.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Mascot from "./Mascot";
import { useScore } from "@/hooks/useScore";

type TriviaModalProps = {
  topic: { title: string; description: string };
  onClose: () => void;
};

type Trivia = {
  question: string;
  options: string[];
  answer: string;
};

const fetchTrivia = async (topic: string): Promise<Trivia> => {
  const res = await fetch("/api/generateQuestion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subtopic: topic }),
  });
  return await res.json();
};

const TriviaModal: React.FC<TriviaModalProps> = ({ topic, onClose }) => {
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const { addCoins } = useScore();

  useEffect(() => {
    fetchTrivia(topic.title).then(setTrivia);
  }, [topic.title]);

  const handleAnswer = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = trivia?.answer === opt;
    setStatus(correct ? "correct" : "wrong");
    if (correct) addCoins(10);
  };

  if (!trivia)
    return <div className="bg-black text-white p-10">Loading...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white">
      <motion.div
        className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl max-w-lg w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold mb-2">{trivia.question}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {trivia.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className={`rounded-full py-2 px-4 transition-all border
                ${
                  selected === opt
                    ? opt === trivia.answer
                      ? "bg-green-600 border-green-400"
                      : "bg-red-600 border-red-400"
                    : "bg-white text-black hover:bg-gray-300 border-gray-400"
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center">
          <Mascot
            mood={status === "correct" ? "happy" : selected ? "sad" : "idle"}
          />
          <p className="mt-2 text-sm text-gray-400">{topic.description}</p>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="text-sm text-pink-400 underline hover:text-pink-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TriviaModal;
