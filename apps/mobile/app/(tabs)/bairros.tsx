import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { registrarInteracao } from "../../lib/setores";

type Bairro = {
  id: string;
  nome: string;
  descricao: string | null;
  moradores: number;
  cor: string;
};

export default function BairrosScreen() {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      // Bairros reais (mesma tabela do site) — já trazem nome, cor e contagem
      const { data: lista, error } = await supabase
        .from("bairros")
        .select("id, nome, descricao, cor, total_membros");
      if (error) throw error;

      setBairros(
        (lista ?? [])
          .map((b) => ({
            id: b.id,
            nome: b.nome,
            descricao: b.descricao,
            moradores: b.total_membros ?? 0,
            cor: b.cor || "#FF5C2E",
          }))
          // Ranking: bairro com mais moradores primeiro
          .sort((a, b) => b.moradores - a.moradores)
      );
    } catch {
      setErro("Não foi possível carregar os bairros.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Setores</Text>
        <Text style={styles.headerSub}>Explore os temas da cidade</Text>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#FF5C2E" />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.centroTexto}>{erro}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setCarregando(true); carregar(); }}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      ) : bairros.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.centroTexto}>Nenhum bairro cadastrado ainda.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} tintColor="#FF5C2E" />}
        >
          {bairros.map((b, i) => {
            const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
            return (
            <TouchableOpacity
              key={b.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => {
                registrarInteracao(b.id, "visita");
                router.push({ pathname: "/(tabs)/feed", params: { setor: b.id } });
              }}
            >
              <View style={[styles.colorBar, { backgroundColor: b.cor }]} />
              <View style={styles.posicao}>
                <Text style={styles.posicaoTexto}>{medalha ?? `${i + 1}º`}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.bairroNome}>{b.nome}</Text>
                {!!b.descricao && <Text style={styles.bairroDesc}>{b.descricao}</Text>}
                <Text style={styles.moradores}>
                  👥 {b.moradores} {b.moradores === 1 ? "morador" : "moradores"}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
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
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  centroTexto: { color: "#888", fontSize: 15, textAlign: "center" },
  retryBtn: { backgroundColor: "#FF5C2E", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "700" },
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
  posicao: { width: 44, alignItems: "center", justifyContent: "center" },
  posicaoTexto: { fontSize: 18, fontWeight: "800", color: "#bbb" },
  cardContent: { flex: 1, paddingVertical: 16, paddingRight: 16 },
  bairroNome: { fontSize: 16, fontWeight: "700", color: "#111" },
  bairroDesc: { fontSize: 13, color: "#888", marginTop: 2 },
  moradores: { fontSize: 12, color: "#aaa", marginTop: 6 },
  arrow: { fontSize: 24, color: "#ccc", paddingRight: 16 },
});
