"use client";

import { useEffect, useState } from "react";
import { getHealth, ApiError } from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState<string>("checking...");
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    getHealth()
      .then((h) => {
        setStatus("connected");
        setDetail(`${h.app} v${h.version} — ${h.status}`);
      })
      .catch((e) => {
        setStatus("disconnected");
        setDetail(e instanceof ApiError ? e.message : String(e));
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">MedVision AI</h1>
      <p className="text-sm text-gray-500">Chest X-ray decision support</p>
      <div className="mt-6 rounded-lg border px-6 py-4 text-center">
        <p className="text-sm text-gray-500">Backend status</p>
        <p
          className={
            status === "connected"
              ? "text-lg font-medium text-green-600"
              : status === "disconnected"
              ? "text-lg font-medium text-red-600"
              : "text-lg font-medium text-gray-600"
          }
        >
          {status}
        </p>
        {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
      </div>
    </main>
  );
}
