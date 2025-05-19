import React from "react";

type ScoreBarProps = {
  score: number;
};

const ScoreBar: React.FC<ScoreBarProps> = ({ score }) => {
  return (
    <div style={{ padding: 12, background: "#222", color: "white" }}>
      Score: {score}
    </div>
  );
};

export default ScoreBar;
