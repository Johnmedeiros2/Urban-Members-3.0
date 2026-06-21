import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function PerfilScreen() {
  async function sair() {
    Alert.alert("Sair da cidade", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>J</Text>
        </View>
        <Text style={styles.nome}>João Medeiros</Text>
        <Text style={styles.endereco}>📍 Zona Sul, Urban Members</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>42</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>218</Text>
            <Text style={styles.statLabel}>Conexões</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>1.2k</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha cidade</Text>
          {[
            { emoji: "🏙", label: "Meu bairro", valor: "Zona Sul" },
            { emoji: "🏪", label: "Minha loja", valor: "Nenhuma ainda" },
            { emoji: "📚", label: "Cursos", valor: "2 em andamento" },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7}>
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuValor}>{item.valor}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>⚙️</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Configurações</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={sair}>
            <Text style={styles.menuEmoji}>🚪</Text>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, { color: "#FF3B30" }]}>Sair da cidade</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
  hero: { backgroundColor: "#0A0A0A", paddingTop: 70, paddingBottom: 28, alignItems: "center" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FF5C2E", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  nome: { color: "#fff", fontSize: 20, fontWeight: "700" },
  endereco: { color: "#888", fontSize: 13, marginTop: 4, marginBottom: 20 },
  stats: { flexDirection: "row", backgroundColor: "#1A1A1A", borderRadius: 16, marginHorizontal: 24, paddingVertical: 16, paddingHorizontal: 24 },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { color: "#fff", fontSize: 20, fontWeight: "800" },
  statLabel: { color: "#666", fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#333", marginVertical: 4 },
  scroll: { flex: 1 },
  section: { marginTop: 20, marginHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#aaa", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginLeft: 4 },
  menuItem: { backgroundColor: "#fff", borderRadius: 14, flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  menuEmoji: { fontSize: 20, marginRight: 12 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: "#111" },
  menuValor: { fontSize: 12, color: "#aaa", marginTop: 1 },
  menuArrow: { fontSize: 20, color: "#ccc" },
});
