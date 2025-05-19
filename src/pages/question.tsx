import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/router";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";

type Trivia = {
  question: string;
  options: string[];
  answer: string;
};

function TriviaOrb({ result }: { result: "correct" | "wrong" | null }) {
  // Color changes based on answer result
  let color = "#fff";
  if (result === "correct") color = "#4caf50";
  if (result === "wrong") color = "#f44336";

  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={2}>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
        {/* Glowing effect */}
        <mesh>
          <sphereGeometry args={[1.7, 64, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      </mesh>
      {/* Fun emoji in the center */}
      <Html center>
        <div style={{ fontSize: 48 }}>
          {result === "correct" ? "🎉" : result === "wrong" ? "❌" : "❓"}
        </div>
      </Html>
    </Float>
  );
}

export default function QuestionPage() {
  const router = useRouter();
  const { topic } = router.query;
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (!topic) return;
    fetch("/api/generateQuestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtopic: topic }),
    })
      .then((res) => res.json())
      .then((data) => setTrivia(data));
  }, [topic]);

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    setResult(option === trivia?.answer ? "correct" : "wrong");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #3f5efb 0%, #fc466b 100%)",
        color: "#fff",
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 3D Animated Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Stars radius={30} depth={60} count={2000} factor={4} fade />
          <Suspense fallback={null}>
            <TriviaOrb result={result} />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={false} autoRotate />
        </Canvas>
      </div>
      {/* Foreground UI */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 600,
          margin: "0 auto",
          marginTop: 80,
          background: "rgba(30,60,114,0.7)",
          borderRadius: 24,
          padding: 48,
          boxShadow: "0 8px 32px rgba(63,95,251,0.2)",
          textAlign: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 18, letterSpacing: 1 }}>
          {topic ? `Topic: ${topic}` : "Loading..."}
        </h1>
        {trivia ? (
          <>
            <h2 style={{ fontSize: 26, marginBottom: 24 }}>
              {trivia.question}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {trivia.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                  style={{
                    padding: "18px 0",
                    borderRadius: 12,
                    border: "none",
                    fontSize: 20,
                    fontWeight: "bold",
                    background:
                      selected === opt
                        ? opt === trivia.answer
                          ? "#4caf50"
                          : "#f44336"
                        : "#fff",
                    color: selected === opt ? "#fff" : "#3f5efb",
                    cursor: selected ? "default" : "pointer",
                    boxShadow: "0 2px 8px rgba(63,95,251,0.1)",
                    transition: "all 0.2s",
                    outline: selected === opt ? "3px solid #fff" : "none",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {selected && (
              <div style={{ marginTop: 32, fontSize: 28 }}>
                {result === "correct"
                  ? "🎉 Correct! You rock!"
                  : `❌ Wrong! The answer was: ${trivia.answer}`}
              </div>
            )}
            <button
              style={{
                marginTop: 40,
                padding: "12px 36px",
                borderRadius: 10,
                border: "none",
                background: "#fff",
                color: "#fc466b",
                fontWeight: "bold",
                fontSize: 20,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(63,95,251,0.1)",
                letterSpacing: 1,
              }}
              onClick={() => router.push("/")}
            >
              Back to Topics
            </button>
          </>
        ) : (
          <div style={{ fontSize: 24, marginTop: 40 }}>Loading question...</div>
        )}
      </div>
    </div>
  );
}
