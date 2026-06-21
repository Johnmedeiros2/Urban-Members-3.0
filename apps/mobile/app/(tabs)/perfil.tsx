import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
  Image, ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

type Perfil = {
  nome: string;
  cidade: string | null;
  estado: string | null;
  ocupacao: string | null;
  urban_score: number;
  foto_url: string | null;
};

export default function PerfilScreen() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [posts, setPosts] = useState(0);
  const [conexoes, setConexoes] = useState(0);
  const [minhaLoja, setMinhaLoja] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCarregando(false); return; }

      // Perfil real do morador logado (mesma tabela do site)
      const { data: p } = await supabase
        .from("perfis")
        .select("nome, cidade, estado, ocupacao, urban_score, foto_url")
        .eq("id", user.id)
        .single();
      if (p) setPerfil(p as Perfil);

      // Contagens reais
      const [{ count: totalPosts }, { count: totalConexoes }, { data: loja }] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true })
          .eq("autor_id", user.id).is("apagado_em", null),
        supabase.from("conexoes").select("seguidor_id", { count: "exact", head: true })
          .eq("seguido_id", user.id),
        supabase.from("lojas").select("nome").eq("dono_id", user.id).maybeSingle(),
      ]);
      setPosts(totalPosts ?? 0);
      setConexoes(totalConexoes ?? 0);
      setMinhaLoja(loja?.nome ?? null);
    } catch {
      // mantém a tela utilizável mesmo se algo falhar
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

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

  function formatarScore(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
    return String(n);
  }

  const nome = perfil?.nome ?? "Morador";
  const localizacao = [perfil?.cidade, perfil?.estado].filter(Boolean).join(", ");

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#FF5C2E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.hero}>
        {perfil?.foto_url ? (
          <Image source={{ uri: perfil.foto_url }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{nome[0]?.toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.nome}>{nome}</Text>
        <Text style={styles.endereco}>
          📍 {localizacao ? `${localizacao} · ` : ""}Urban Members
        </Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{conexoes}</Text>
            <Text style={styles.statLabel}>Conexões</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{formatarScore(perfil?.urban_score ?? 0)}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha cidade</Text>
          {[
            { emoji: "🏪", label: "Minha loja", valor: minhaLoja ?? "Nenhuma ainda" },
            { emoji: "💼", label: "Ocupação", valor: perfil?.ocupacao || "Não informada" },
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
  avatarImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, backgroundColor: "#222" },
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
