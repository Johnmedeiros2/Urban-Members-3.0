import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

type Bairro = {
  id: string;
  label: string;
  descricao: string | null;
  moradores: number;
  cor: string;
};

// Paleta de cores para dar identidade visual a cada bairro
const CORES = ["#FF5C2E", "#6C63FF", "#00C896", "#0084FF", "#FFB800", "#E84393", "#00B8D4"];

export default function BairrosScreen() {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      // 1) Bairros reais (mesma tabela do site)
      const { data: lista, error } = await supabase
        .from("bairros")
        .select("id, label, descricao");
      if (error) throw error;

      const bairrosLista = lista ?? [];

      // 2) Contagem real de moradores por bairro (tabela bairro_membros)
      const contagem = new Map<string, number>();
      if (bairrosLista.length) {
        const { data: membros } = await supabase
          .from("bairro_membros")
          .select("bairro_id")
          .in("bairro_id", bairrosLista.map((b) => b.id));
        membros?.forEach((m) => {
          contagem.set(m.bairro_id, (contagem.get(m.bairro_id) ?? 0) + 1);
        });
      }

      setBairros(
        bairrosLista.map((b, i) => ({
          id: b.id,
          label: b.label,
          descricao: b.descricao,
          moradores: contagem.get(b.id) ?? 0,
          cor: CORES[i % CORES.length],
        }))
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
        <Text style={styles.headerTitle}>Bairros</Text>
        <Text style={styles.headerSub}>Escolha onde morar na cidade</Text>
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
          {bairros.map((b) => (
            <TouchableOpacity key={b.id} style={styles.card} activeOpacity={0.8}>
              <View style={[styles.colorBar, { backgroundColor: b.cor }]} />
              <View style={styles.cardContent}>
                <Text style={styles.bairroNome}>{b.label}</Text>
                {!!b.descricao && <Text style={styles.bairroDesc}>{b.descricao}</Text>}
                <Text style={styles.moradores}>
                  👥 {b.moradores} {b.moradores === 1 ? "morador" : "moradores"}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
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
  cardContent: { flex: 1, padding: 16 },
  bairroNome: { fontSize: 16, fontWeight: "700", color: "#111" },
  bairroDesc: { fontSize: 13, color: "#888", marginTop: 2 },
  moradores: { fontSize: 12, color: "#aaa", marginTop: 6 },
  arrow: { fontSize: 24, color: "#ccc", paddingRight: 16 },
});
