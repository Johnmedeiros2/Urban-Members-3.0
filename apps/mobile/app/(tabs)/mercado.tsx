import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

const PRODUTOS = [
  { id: "1", nome: "Pack de Design", vendedor: "Ana Ferreira", preco: "R$ 49,90", categoria: "Digital", emoji: "🎨" },
  { id: "2", nome: "Mentoria 1h", vendedor: "Carlos Silva", preco: "R$ 120,00", categoria: "Serviço", emoji: "🎯" },
  { id: "3", nome: "Camiseta Urban", vendedor: "Loja Central", preco: "R$ 89,90", categoria: "Produto", emoji: "👕" },
  { id: "4", nome: "Curso de Negócios", vendedor: "João Medeiros", preco: "R$ 197,00", categoria: "Curso", emoji: "📚" },
  { id: "5", nome: "Logo Profissional", vendedor: "Studio Vila", preco: "R$ 350,00", categoria: "Serviço", emoji: "✏️" },
];

export default function MercadoScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mercado</Text>
        <TouchableOpacity style={styles.vendaBtn}>
          <Text style={styles.vendaBtnText}>+ Vender</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {PRODUTOS.map((p) => (
            <TouchableOpacity key={p.id} style={styles.card} activeOpacity={0.8}>
              <View style={styles.emojiBox}>
                <Text style={styles.emoji}>{p.emoji}</Text>
              </View>
              <Text style={styles.categoria}>{p.categoria}</Text>
              <Text style={styles.nome}>{p.nome}</Text>
              <Text style={styles.vendedor}>{p.vendedor}</Text>
              <Text style={styles.preco}>{p.preco}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111", letterSpacing: -0.5 },
  vendaBtn: {
    backgroundColor: "#FF5C2E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  vendaBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  scroll: { flex: 1 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "47%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF0EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emoji: { fontSize: 22 },
  categoria: { fontSize: 11, color: "#FF5C2E", fontWeight: "600", marginBottom: 4 },
  nome: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 },
  vendedor: { fontSize: 11, color: "#aaa", marginBottom: 8 },
  preco: { fontSize: 15, fontWeight: "800", color: "#111" },
});
