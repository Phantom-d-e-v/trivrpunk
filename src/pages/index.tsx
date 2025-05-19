import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

type Topic = {
  title: string;
  description: string;
};

function FloatingBlock({
  topic,
  onClick,
  index,
}: {
  topic: Topic;
  onClick: () => void;
  index: number;
}) {
  // Animate block in X and Y using CSS keyframes
  const floatDuration = 3 + (index % 3); // Staggered duration
  const floatStyle: React.CSSProperties = {
    animation: `floatXY ${floatDuration}s ease-in-out infinite alternate`,
    cursor: "pointer",
    background: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    boxShadow: "0 4px 24px rgba(63,95,251,0.10)",
    padding: "32px 24px",
    minWidth: 240,
    maxWidth: 320,
    margin: 16,
    backdropFilter: "blur(8px)",
    border: "1.5px solid rgba(255,255,255,0.18)",
    transition: "transform 0.18s, box-shadow 0.18s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    willChange: "transform",
  };

  return (
    <div style={floatStyle} onClick={onClick}>
      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, color: "#1e3c72" }}>
        {topic.title}
      </div>
      <div style={{ fontSize: 15, opacity: 0.85, color: "#222", textAlign: "center" }}>
        {topic.description}
      </div>
    </div>
  );
}

// Add keyframes for floating animation
const styleSheet = `
@keyframes floatXY {
  0%   { transform: translateY(0px) translateX(0px);}
  25%  { transform: translateY(-12px) translateX(10px);}
  50%  { transform: translateY(8px) translateX(-10px);}
  75%  { transform: translateY(-6px) translateX(6px);}
  100% { transform: translateY(0px) translateX(0px);}
}
`;

if (typeof window !== "undefined" && !document.getElementById("floatXY-keyframes")) {
  const style = document.createElement("style");
  style.id = "floatXY-keyframes";
  style.innerHTML = styleSheet;
  document.head.appendChild(style);
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch("/api/generateTopics", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setTopics(data.topics || []))
      .finally(() => setLoading(false));
  }, []);

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
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Animated 3D Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Canvas camera={{ position: [0, 0, 18], fov: 60 }}>
          <ambientLight intensity={0.8} />
          <Stars radius={40} depth={80} count={2500} factor={5} fade />
        </Canvas>
      </div>

      {/* Foreground UI */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          marginTop: 64,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 44, marginBottom: 18, letterSpacing: 2, color: "#fff", textShadow: "0 2px 8px #3f5efb" }}>
          🎯 Choose Your Trivia Topic
        </h1>
        <div style={{ fontSize: 20, opacity: 0.85, marginBottom: 32 }}>
          Click a block to play!
        </div>
        {loading ? (
          <div style={{ fontSize: 22, marginTop: 40 }}>Loading topics...</div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              marginTop: 24,
            }}
          >
            {topics.map((topic, i) => (
              <FloatingBlock
                key={topic.title}
                topic={topic}
                index={i}
                onClick={() =>
                  router.push({
                    pathname: "/question",
                    query: { topic: topic.title },
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
