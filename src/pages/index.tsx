import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/router";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Stars, Html } from "@react-three/drei";

type Topic = {
  title: string;
  description: string;
};

function TopicCard3D({
  topic,
  onClick,
}: {
  topic: Topic;
  onClick: () => void;
}) {
  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5}>
      <mesh
        onClick={onClick}
        scale={[1.2, 1.2, 1.2]}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.8, 1.6, 0.4]} />
        <meshStandardMaterial color="#fff" roughness={0.2} metalness={0.7} />
        <Html center>
          <div
            style={{
              width: 220,
              textAlign: "center",
              color: "#1e3c72",
              fontWeight: "bold",
              fontSize: 20,
              pointerEvents: "none",
              userSelect: "none",
              padding: 8,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{topic.title}</div>
            <div style={{ fontSize: 15, opacity: 0.8 }}>{topic.description}</div>
          </div>
        </Html>
      </mesh>
    </Float>
  );
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

  // Arrange topics in a circle for 3D effect
  const radius = 5;
  const topicPositions =
    topics.length > 0
      ? topics.map((_, i) => {
          const angle = (i / topics.length) * Math.PI * 2;
          return [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * 0.5,
            0,
          ] as [number, number, number];
        })
      : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #3f5efb 0%, #fc466b 100%)",
        color: "#fff",
        padding: 0,
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
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Stars radius={30} depth={60} count={2000} factor={4} fade />
          <Suspense fallback={null}>
            {topics.map((topic, i) => (
              <group key={topic.title} position={topicPositions[i]}>
                <TopicCard3D
                  topic={topic}
                  onClick={() =>
                    router.push({
                      pathname: "/question",
                      query: { topic: topic.title },
                    })
                  }
                />
              </group>
            ))}
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={false} autoRotate />
        </Canvas>
      </div>

      {/* Foreground UI */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 700,
          margin: "0 auto",
          marginTop: 60,
          background: "rgba(30,60,114,0.7)",
          borderRadius: 24,
          padding: 36,
          boxShadow: "0 8px 32px rgba(63,95,251,0.2)",
          textAlign: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 style={{ fontSize: 40, marginBottom: 24, letterSpacing: 2 }}>
          🎯 Choose Your Trivia Topic
        </h1>
        <div style={{ fontSize: 18, opacity: 0.85, marginBottom: 12 }}>
          Click a 3D card to play!
        </div>
        {loading && (
          <div style={{ fontSize: 22, marginTop: 40 }}>Loading topics...</div>
        )}
      </div>
    </div>
  );
}
