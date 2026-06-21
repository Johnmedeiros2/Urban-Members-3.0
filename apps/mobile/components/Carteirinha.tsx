import { View, Text, StyleSheet, Image } from "react-native";
import Logo from "./Logo";

export default function Carteirinha({
  nome,
  localizacao,
  numero,
  fundador,
  score,
  foto,
}: {
  nome: string;
  localizacao: string;
  numero: number | null;
  fundador: boolean;
  score: number;
  foto: string | null;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topo}>
        <View style={styles.marcaRow}>
          <Logo size={32} variant="accent" />
          <Text style={styles.marca}>Urban Members</Text>
        </View>
        {fundador && (
          <View style={styles.selo}>
            <Text style={styles.seloTexto}>★ FUNDADOR</Text>
          </View>
        )}
      </View>

      <View style={styles.corpo}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{nome[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.rotulo}>MORADOR</Text>
          <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
          <Text style={styles.endereco} numberOfLines={1}>📍 {localizacao || "Urban Members"}</Text>
        </View>
      </View>

      <View style={styles.rodape}>
        <View>
          <Text style={styles.rodapeRotulo}>ENDEREÇO Nº</Text>
          <Text style={styles.rodapeValor}>
            {numero ? String(numero).padStart(4, "0") : "----"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.rodapeRotulo}>URBAN SCORE</Text>
          <Text style={styles.rodapeValor}>{score}</Text>
        </View>
      </View>

      <Text style={styles.site}>urbanicsa.com</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0A0A0A",
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
  },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  marcaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  marca: { color: "#fff", fontSize: 15, fontWeight: "700" },
  selo: { backgroundColor: "#FF5C2E", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  seloTexto: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  corpo: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FF5C2E", alignItems: "center", justifyContent: "center", marginRight: 16 },
  avatarImg: { width: 64, height: 64, borderRadius: 32, marginRight: 16, backgroundColor: "#222" },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  info: { flex: 1 },
  rotulo: { color: "#FF5C2E", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 4 },
  nome: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  endereco: { color: "#999", fontSize: 13, marginTop: 4 },
  rodape: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#222", paddingTop: 16 },
  rodapeRotulo: { color: "#666", fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  rodapeValor: { color: "#fff", fontSize: 20, fontWeight: "800" },
  site: { color: "#444", fontSize: 11, textAlign: "center", marginTop: 16, letterSpacing: 1 },
});
