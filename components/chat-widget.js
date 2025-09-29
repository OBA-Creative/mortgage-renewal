// components/ChatWidget.tsx
"use client"; // make this a client component

import { useEffect } from "react";

export default function ChatWidget() {
  useEffect(() => {
    // Insert tawk.to widget script
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/68dafd8b62ed4a194e8eabd8/1j6bmsq84";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
