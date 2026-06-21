import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import Logo from "./Logo";

const PASSOS = [
  {
    emoji: "🏙",
    titulo: "Bem-vindo à sua cidade",
    texto: "Urban Members não é uma rede social. É uma cidade virtual — e você acaba de reservar seu endereço aqui.",
  },
  {
    emoji: "🏘",
    titulo: "Explore os bairros",
    texto: "Cada bairro reúne pessoas, negócios e ideias. Visite, participe e encontre o seu lugar na cidade.",
  },
  {
    emoji: "🚀",
    titulo: "Cresça na cidade",
    texto: "Poste no feed, conecte-se com moradores e abra sua loja no Mercado. Tudo que você faz aumenta seu Urban Score.",
  },
];

export default function BoasVindas({
  visible,
  onConcluir,
}: {
  visible: boolean;
  onConcluir: () => void;
}) {
  const [passo, setPasso] = useState(0);
  const ultimo = passo === PASSOS.length - 1;
  const atual = PASSOS[passo];

  function avancar() {
    if (ultimo) onConcluir();
    else setPasso((p) => p + 1);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <View style={styles.topo}>
          <Logo size={48} variant="accent" />
          <Text style={styles.marca}>Urban Members</Text>
        </View>

        <View style={styles.meio}>
          <Text style={styles.emoji}>{atual.emoji}</Text>
          <Text style={styles.titulo}>{atual.titulo}</Text>
          <Text style={styles.texto}>{atual.texto}</Text>
        </View>

        <View style={styles.baixo}>
          <View style={styles.bolinhas}>
            {PASSOS.map((_, i) => (
              <View key={i} style={[styles.bolinha, i === passo && styles.bolinhaAtiva]} />
            ))}
          </View>

          <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={avancar}>
            <Text style={styles.btnTexto}>{ultimo ? "Entrar na cidade →" : "Próximo"}</Text>
          </TouchableOpacity>

          {!ultimo && (
            <TouchableOpacity onPress={onConcluir}>
              <Text style={styles.pular}>Pular</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A", paddingHorizontal: 32, paddingTop: 80, paddingBottom: 48 },
  topo: { flexDirection: "row", alignItems: "center", gap: 12 },
  marca: { color: "#fff", fontSize: 18, fontWeight: "700" },
  meio: { flex: 1, justifyContent: "center" },
  emoji: { fontSize: 64, marginBottom: 24 },
  titulo: { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginBottom: 16, lineHeight: 38 },
  texto: { color: "#aaa", fontSize: 17, lineHeight: 26 },
  baixo: { gap: 20 },
  bolinhas: { flexDirection: "row", gap: 8, justifyContent: "center" },
  bolinha: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#333" },
  bolinhaAtiva: { backgroundColor: "#FF5C2E", width: 24 },
  btn: { backgroundColor: "#FF5C2E", paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  btnTexto: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pular: { color: "#666", fontSize: 14, textAlign: "center" },
});
