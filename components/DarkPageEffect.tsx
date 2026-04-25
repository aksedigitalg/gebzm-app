"use client";
import { useEffect } from "react";

export function DarkPageEffect() {
  useEffect(() => {
    document.documentElement.classList.add("dark-page");
    return () => { document.documentElement.classList.remove("dark-page"); };
  }, []);
  return null;
}
