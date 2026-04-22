const gradients = [
  "linear-gradient(135deg, #111111 0%, #444444 100%)",
  "linear-gradient(135deg, #FF5C2E 0%, #FF8C5A 100%)",
  "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)",
  "linear-gradient(135deg, #065F46 0%, #10B981 100%)",
  "linear-gradient(135deg, #6D28D9 0%, #A78BFA 100%)",
];

function pickGradient(name: string) {
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

interface AvatarProps {
  name: string;
  size?: number;
  foto?: string | null;
}

export default function Avatar({ name, size = 40, foto }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  if (foto) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        overflow: "hidden", flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <img src={foto} alt={name} width={size} height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: pickGradient(name),
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <span style={{ color: "#FFFFFF", fontSize: size * 0.35, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {initials}
      </span>
    </div>
  );
}
