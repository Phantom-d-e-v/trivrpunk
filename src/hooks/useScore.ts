import { useState } from "react";

export const useScore = () => {
  const [score, setScore] = useState(0);

  const addCoins = (amount: number) => {
    setScore((prev) => prev + amount);
  };

  return { score, addCoins };
};
