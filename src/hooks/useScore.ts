import { useState } from "react";
import { useAuth } from "./useAuth";

export const useScore = () => {
  const { user } = useAuth();
  const [score, setScore] = useState(0);

  const addCoins = (amount: number) => {
    setScore((prev) => prev + amount);
  };

  return { score, addCoins };
};
