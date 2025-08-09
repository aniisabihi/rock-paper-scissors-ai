"use client";

import type { FC } from "react";
import { motion } from "framer-motion";

interface AiAvatarProps {
  readonly mood: "idle" | "win" | "lose" | "draw";
}

const AiAvatar: FC<AiAvatarProps> = ({ mood }) => {
  const getFace = () => {
    switch (mood) {
      case "win":
        return "😎";
      case "lose":
        return "😭";
      case "draw":
        return "😐";
      default:
        return "🤖";
    }
  };

  return (
    <motion.div
      className='text-6xl transform-gpu'
      animate={{
        scale: mood === "win" ? 1.2 : 1,
        rotate: mood === "lose" ? [0, -5, 5, 0] : 0,
      }}
      transition={{
        duration: 0.5,
        repeat: mood === "lose" ? 2 : 0,
      }}
      style={{
        transformOrigin: "center center",
      }}
    >
      {getFace()}
    </motion.div>
  );
};

export default AiAvatar;
