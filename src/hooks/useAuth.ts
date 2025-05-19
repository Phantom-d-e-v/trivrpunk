import { useEffect } from "react";

export const useAuth = () => {
  // No authentication logic, just guest mode
  return { user: { isGuest: true } };
};
