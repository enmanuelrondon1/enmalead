// src/app/[slug]/voice-widget.tsx
"use client";

import { useState, useEffect } from "react";
import { getVapiClient } from "@/lib/vapi-client";
import { buildAssistantOverrides } from "@/lib/build-assistant-overrides";

type Property = {
  title: string;
  price: number;
  location: string;
};

type VoiceWidgetProps = {
  agencyId: string;
  agencyName: string;
  assistantTone: string | null;
  properties: Property[];
};

export function VoiceWidget({
  agencyId,
  agencyName,
  assistantTone,
  properties,
}: VoiceWidgetProps) {
  const [status, setStatus] = useState<"idle" | "connecting" | "active">("idle");

  useEffect(() => {
    const vapi = getVapiClient();

    const onCallStart = () => setStatus("active");
    const onCallEnd = () => setStatus("idle");

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
    };
  }, []);

  const handleClick = async () => {
    const vapi = getVapiClient();

    if (status === "active") {
      vapi.stop();
      return;
    }

    setStatus("connecting");

    const overrides = buildAssistantOverrides({
      agencyName,
      assistantTone,
      properties,
      agencyId,
    });

    await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, overrides);
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 rounded-full shadow-lg px-6 py-4 font-medium text-white transition flex items-center gap-2 ${
        status === "active"
          ? "bg-red-600 hover:bg-red-700"
          : "bg-accent hover:bg-accent-dim"
      }`}
    >
      {status === "idle" && "🎙️ Habla con nuestro asistente"}
      {status === "connecting" && "Conectando..."}
      {status === "active" && "🔴 Terminar llamada"}
    </button>
  );
}