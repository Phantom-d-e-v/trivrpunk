// /components/Mascot.tsx
import React from "react";

type MascotProps = {
  mood: "happy" | "sad" | "idle";
};

const Mascot: React.FC<MascotProps> = ({ mood }) => {
  let emoji = "🙂";
  if (mood === "happy") emoji = "😄";
  else if (mood === "sad") emoji = "😢";

  return (
    <div
      style={{
        fontSize: 48,
        transition: "all 0.3s ease",
        transform: mood === "happy" ? "scale(1.2)" : "scale(1)",
      }}
      aria-label={`Mascot is feeling ${mood}`}
      role="img"
    >
      {emoji}
    </div>
  );
};

export default Mascot;
