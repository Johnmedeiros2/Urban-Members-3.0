"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import ScoreBadge from "./ScoreBadge";

interface Post {
  id: number;
  user: string;
  city: string;
  neighborhood: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  score: number;
}

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  function toggleLike() {
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
  }

  return (
    <article
      style={{
        background: "#FFFFFF",
        borderRadius: "20px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)";
      }}
    >
      {/* Header do post */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar name={post.user} size={44} />
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", lineHeight: 1.3 }}>
              {post.user}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
              <span style={{ fontSize: "12px", color: "#525252", fontWeight: 500 }}>
                {post.city}
              </span>
              <span style={{ fontSize: "10px", color: "#E5E5E5" }}>•</span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#FF5C2E",
                  fontWeight: 600,
                  background: "#FFF3EF",
                  padding: "1px 7px",
                  borderRadius: "999px",
                }}
              >
                {post.neighborhood}
              </span>
              <span style={{ fontSize: "10px", color: "#E5E5E5" }}>•</span>
              <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{post.time}</span>
            </div>
          </div>
        </div>
        <ScoreBadge score={post.score} compact />
      </div>

      {/* Conteúdo */}
      <p style={{ fontSize: "15px", color: "#111111", lineHeight: 1.65, fontWeight: 400 }}>
        {post.content}
      </p>

      {/* Ações */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          paddingTop: "12px",
          borderTop: "1px solid #F5F5F5",
        }}
      >
        <ActionBtn
          onClick={toggleLike}
          active={liked}
          activeColor="#FF5C2E"
          icon={liked ? "♥" : "♡"}
          label={String(likes)}
        />
        <ActionBtn icon="💬" label={String(post.comments)} />
        <ActionBtn icon="↗" label="Compartilhar" />
        <div style={{ flex: 1 }} />
        <button
          style={{
            fontSize: "12px",
            color: "#A3A3A3",
            fontWeight: 600,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: "8px",
          }}
        >
          ···
        </button>
      </div>
    </article>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  active = false,
  activeColor = "#111111",
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "7px 12px",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
        background: hovered ? "#F5F5F5" : "transparent",
        color: active ? activeColor : hovered ? "#111111" : "#A3A3A3",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: "15px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
