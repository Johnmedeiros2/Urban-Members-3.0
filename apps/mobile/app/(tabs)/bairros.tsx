import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

const BAIRROS = [
  { id: "1", nome: "Centro", moradores: 142, descricao: "O coração da cidade", cor: "#FF5C2E" },
  { id: "2", nome: "Vila Nova", moradores: 87, descricao: "Bairro criativo e cultural", cor: "#6C63FF" },
  { id: "3", nome: "Zona Sul", moradores: 65, descricao: "Natureza e tranquilidade", cor: "#00C896" },
  { id: "4", nome: "Tech Park", moradores: 53, descricao: "Inovação e tecnologia", cor: "#0084FF" },
  { id: "5", nome: "Mercadão", moradores: 38, descricao: "Comércio e negócios", cor: "#FFB800" },
];

export default function BairrosScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bairros</Text>
        <Text style={styles.headerSub}>Escolha onde morar na cidade</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {BAIRROS.map((b) => (
          <TouchableOpacity key={b.id} style={styles.card} activeOpacity={0.8}>
            <View style={[styles.colorBar, { backgroundColor: b.cor }]} />
            <View style={styles.cardContent}>
              <Text style={styles.bairroNome}>{b.nome}</Text>
              <Text style={styles.bairroDesc}>{b.descricao}</Text>
              <Text style={styles.moradores}>👥 {b.moradores} moradores</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: "#999", marginTop: 2 },
  scroll: { flex: 1, padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  colorBar: { width: 6, alignSelf: "stretch" },
  cardContent: { flex: 1, padding: 16 },
  bairroNome: { fontSize: 16, fontWeight: "700", color: "#111" },
  bairroDesc: { fontSize: 13, color: "#888", marginTop: 2 },
  moradores: { fontSize: 12, color: "#aaa", marginTop: 6 },
  arrow: { fontSize: 24, color: "#ccc", paddingRight: 16 },
});
