import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter } from "next/router";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Stars, Html } from "@react-three/drei";

type Trivia = {
  question: string;
  options: string[];
  answer: string;
};

function InteractiveOrb({
  result,
  onClick,
  spin,
}: {
  result: "correct" | "wrong" | null;
  onClick: () => void;
  spin: boolean;
}) {
  const meshRef = useRef<any>(null);

  // Handle orb spin animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += spin ? 0.2 : 0.005;
    }
  });

  let color = "#fff";
  if (result === "correct") color = "#4caf50";
  if (result === "wrong") color = "#f44336";

  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={2}>
      <mesh ref={meshRef} onClick={onClick} style={{ cursor: "pointer" }}>
        <sphereGeometry args={[1.7, 64, 64]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.8} emissive={color} emissiveIntensity={0.15} />
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.13} />
        </mesh>
        <Html center>
          <div style={{ fontSize: 54, userSelect: "none", pointerEvents: "none" }}>
            {result === "correct" ? "🎉" : result === "wrong" ? "❌" : "❓"}
          </div>
        </Html>
      </mesh>
    </Float>
  );
}

export default function QuestionPage() {
  const router = useRouter();
  const { topic } = router.query;
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [orbSpin, setOrbSpin] = useState(false);

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

  // Fun: Spin the orb on click
  const handleOrbClick = () => {
    setOrbSpin(true);
    setTimeout(() => setOrbSpin(false), 1200);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "radial-gradient(ellipse at top, #3f5efb 0%, #fc466b 100%)",
        color: "#fff",
        padding: 0,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Stars radius={40} depth={80} count={2500} factor={5} fade />
        </Canvas>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        <div style={{ width: 320, height: 320, marginBottom: -60 }}>
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <Suspense fallback={null}>
              <InteractiveOrb
                result={result}
                onClick={handleOrbClick}
                spin={orbSpin}
              />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
          </Canvas>
        </div>
        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.13)",
            borderRadius: 24,
            boxShadow: "0 8px 32px rgba(63,95,251,0.18)",
            padding: "38px 32px 32px 32px",
            backdropFilter: "blur(14px)",
            textAlign: "center",
            marginTop: 0,
            border: "1.5px solid rgba(255,255,255,0.18)",
          }}
        >
          <h2 style={{ fontSize: 28, marginBottom: 18, letterSpacing: 1, color: "#fff" }}>
            {topic ? `Topic: ${topic}` : "Loading..."}
          </h2>
          {trivia ? (
            <>
              <div style={{ fontSize: 22, marginBottom: 22, color: "#fff" }}>
                {trivia.question}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {trivia.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!selected}
                    style={{
                      padding: "16px 0",
                      borderRadius: 12,
                      border: "none",
                      fontSize: 18,
                      fontWeight: "bold",
                      background:
                        selected === opt
                          ? opt === trivia.answer
                            ? "#4caf50"
                            : "#f44336"
                          : "rgba(255,255,255,0.85)",
                      color: selected === opt ? "#fff" : "#3f5efb",
                      cursor: selected ? "default" : "pointer",
                      boxShadow: "0 2px 8px rgba(63,95,251,0.08)",
                      transition: "all 0.2s",
                      outline: selected === opt ? "3px solid #fff" : "none",
                      opacity: selected && selected !== opt ? 0.7 : 1,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selected && (
                <div style={{ marginTop: 28, fontSize: 24 }}>
                  {result === "correct"
                    ? "🎉 Correct! You rock!"
                    : `❌ Wrong! The answer was: ${trivia.answer}`}
                </div>
              )}
              <button
                style={{
                  marginTop: 36,
                  padding: "12px 36px",
                  borderRadius: 10,
                  border: "none",
                  background: "#fff",
                  color: "#fc466b",
                  fontWeight: "bold",
                  fontSize: 18,
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
            <div style={{ fontSize: 22, marginTop: 30, color: "#fff" }}>Loading question...</div>
          )}
        </div>
        <div style={{ marginTop: 18, color: "#fff", fontSize: 14, opacity: 0.7 }}>
          Tip: Click the orb for a surprise spin!
        </div>
      </div>
    </div>
  );
}
