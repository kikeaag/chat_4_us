"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Message } from "./domain/entities/message.entity";

const ID = Math.random().toString(36).slice(2, 7);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY || '',
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
      }
    );

    const channel = pusher.subscribe("chat");

    channel.bind("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      pusher.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!input) return;

    const msg = {
      text: input,
      from: ID,
      time: new Date().toLocaleTimeString(),
    };

    await fetch("/api/message", {
      method: "POST",
      body: JSON.stringify(msg),
    });

    setInput("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.chat}>
        {messages.map((m, i) => {
          const isMe = m.from === ID;

          return (
            <div
              key={i}
              style={{
                ...styles.row,
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  background: isMe ? "#DCF8C6" : "#E5E5EA",
                }}
              >
                <div style={{color: 'black'}}>{m.text}</div>
                <div style={styles.time}>{m.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}

const styles = {
  container: { height: "100vh", display: "flex", flexDirection: "column" },
  chat: { flex: 1, overflow: "auto", padding: 10 },
  row: { display: "flex", marginBottom: 8 },
  bubble: { padding: 10, borderRadius: 10, maxWidth: "70%" },
  inputRow: { display: "flex", padding: 10 },
  input: { flex: 1, marginRight: 10 },
  time: { fontSize: 10, opacity: 0.6, textAlign: "right" },
} as const;