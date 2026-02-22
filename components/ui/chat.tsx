"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Message = {
  role: "user" | "ai";
  text: string;
};

const demoSteps: Message[] = [
  {
    role: "user",
    text: "List me how to initialise a repo",
  },
  {
    role: "ai",
    text:
      "1. Create a new directory\n" +
      "2. Run git init\n" +
      "3. Add files using git add .\n" +
      '4. Commit with git commit -m "initial commit"',
  },
  {
    role: "user",
    text: "How do I push it to GitHub?",
  },
  {
    role: "ai",
    text:
      "1. Create a repository on GitHub\n" +
      "2. Add the remote origin\n" +
      "3. Set the main branch\n" +
      "4. Push your code to GitHub",
  },
];

export default function AiChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= demoSteps.length) return;

    const current = demoSteps[step];
    let index = 0;

    const interval = setInterval(() => {
      index++;

      setMessages((prev) => {
        const updated = [...prev];
        if (!updated[step]) {
          updated.push({
            role: current.role,
            text: current.text.slice(0, index),
          });
        } else {
          updated[step] = {
            ...updated[step],
            text: current.text.slice(0, index),
          };
        }
        return updated;
      });

      if (index >= current.text.length) {
        clearInterval(interval);
        setTimeout(() => setStep((s) => s + 1), 600);
      }
    }, current.role === "user" ? 40 : 18);

    return () => clearInterval(interval);
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="mt-20 w-full max-w-2xl mx-auto"
    >
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col h-[500px] sm:h-[600px]">
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between bg-white dark:bg-neutral-900">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              Git Friend AI
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Demo conversation
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100 animate-pulse" />
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 p-6 overflow-y-auto bg-white dark:bg-neutral-950">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "rounded-tr-none bg-neutral-900 text-white"
                    : "rounded-tl-none bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
                }`}
              >
                {msg.text}
                <span className="inline-block w-[2px] h-4 ml-1 bg-current animate-pulse align-middle" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
          <div className="flex gap-2">
            <input
              disabled
              placeholder="Ask a Git question..."
              className="flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 placeholder-neutral-500 focus:outline-none"
            />
            <button
              disabled
              className="rounded-lg bg-neutral-900 dark:bg-neutral-200 text-white dark:text-neutral-900 px-4 py-2 text-sm font-medium opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}