"use client";

import {
  Button,
  Column,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
} from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiChatBubbleLeftRight } from "react-icons/hi2";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AiCloneChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open, scrollToBottom]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextThread: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextThread);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextThread }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }
      if (!data.reply) {
        throw new Error("Empty response from assistant");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <>
      {!open && (
        <Flex
          position="fixed"
          style={{ bottom: "1.25rem", right: "1.25rem", zIndex: 200 }}
        >
          <Button
            variant="primary"
            size="m"
            prefixIcon="chat"
            label="Ask Magret (AI)"
            onClick={() => setOpen(true)}
            style={{ boxShadow: "var(--shadow-l)" }}
          />
        </Flex>
      )}

      {open && (
        <Column
          position="fixed"
          fillWidth
          style={{
            bottom: "1.25rem",
            right: "1.25rem",
            zIndex: 200,
            width: "min(100% - 2rem, 22rem)",
            maxHeight: "min(70vh, 32rem)",
            boxShadow: "var(--shadow-l)",
          }}
          background="surface"
          border="neutral-medium"
          radius="l"
          overflow="hidden"
        >
          <Flex
            fillWidth
            padding="12"
            horizontal="between"
            vertical="center"
            background="brand-alpha-weak"
            border="neutral-alpha-weak"
            style={{ borderWidth: "0 0 1px 0" }}
          >
            <Flex vertical="center" gap="8">
              <HiChatBubbleLeftRight size={22} aria-hidden />
              <Column gap="2">
                <Heading variant="heading-strong-s">Magret (AI)</Heading>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Answers from my public CV — not live advice.
                </Text>
              </Column>
            </Flex>
            <IconButton
              variant="secondary"
              size="m"
              icon="x"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            />
          </Flex>

          <Column
            flex={1}
            fillWidth
            padding="12"
            gap="12"
            style={{
              overflowY: "auto",
              minHeight: "12rem",
              maxHeight: "calc(min(70vh, 32rem) - 8.5rem)",
            }}
          >
            {messages.length === 0 && (
              <Text variant="body-default-s" onBackground="neutral-weak">
                Ask about my background, stack, or projects — I’ll answer in first person based on
                my site’s CV.
              </Text>
            )}
            {messages.map((m, i) => (
              <Column
                key={`${i}-${m.role}`}
                fillWidth
                horizontal={m.role === "user" ? "end" : "start"}
              >
                <Column
                  maxWidth={28}
                  padding="12"
                  radius="m"
                  background={m.role === "user" ? "brand-alpha-medium" : "neutral-alpha-weak"}
                >
                  <Text variant="body-default-s">{m.content}</Text>
                </Column>
              </Column>
            ))}
            {loading && (
              <Flex vertical="center" gap="8" paddingY="8">
                <Spinner size="s" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Thinking…
                </Text>
              </Flex>
            )}
            {error && (
              <Text variant="body-default-s" style={{ color: "var(--scheme-red-600)" }}>
                {error}
              </Text>
            )}
            <div ref={endRef} />
          </Column>

          <Flex fillWidth padding="12" gap="8" border="neutral-alpha-weak" style={{ borderWidth: "1px 0 0 0" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Message…"
              rows={2}
              disabled={loading}
              style={{
                flex: 1,
                resize: "none",
                borderRadius: "var(--radius-m)",
                border: "1px solid var(--neutral-alpha-medium)",
                padding: "0.5rem 0.65rem",
                font: "inherit",
                background: "var(--page-background)",
                color: "inherit",
              }}
            />
            <IconButton
              variant="primary"
              size="l"
              icon="send"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            />
          </Flex>
        </Column>
      )}
    </>
  );
}
