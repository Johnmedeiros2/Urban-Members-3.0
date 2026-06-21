import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import NovoProdutoModal from "../../components/NovoProdutoModal";

type Produto = {
  id: string;
  nome: string;
  preco: number;
  categoria: string | null;
  vendedor: string;
};

const EMOJI_CATEGORIA: Record<string, string> = {
  Digital: "🎨",
  Serviço: "🎯",
  Servico: "🎯",
  Produto: "🛍",
  Curso: "📚",
  Comida: "🍔",
  Moda: "👕",
};

function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function MercadoScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      // Produtos reais à venda (mesma consulta do site)
      const { data: lista, error } = await supabase
        .from("produtos")
        .select("id, nome, preco, categoria, loja:lojas(nome, dono_id)")
        .eq("disponivel", true)
        .order("criado_em", { ascending: false })
        .limit(40);
      if (error) throw error;

      const produtosLista = (lista ?? []) as any[];

      // Nome do dono da loja (tabela perfis), como no site
      const donoIds = [...new Set(produtosLista.map((p) => p.loja?.dono_id).filter(Boolean))];
      const donoMap = new Map<string, string>();
      if (donoIds.length) {
        const { data: perfis } = await supabase
          .from("perfis")
          .select("id, nome")
          .in("id", donoIds);
        perfis?.forEach((p) => donoMap.set(p.id, p.nome));
      }

      setProdutos(
        produtosLista.map((p) => ({
          id: p.id,
          nome: p.nome,
          preco: Number(p.preco) || 0,
          categoria: p.categoria,
          vendedor: p.loja?.nome ?? donoMap.get(p.loja?.dono_id) ?? "Morador",
        }))
      );
    } catch {
      setErro("Não foi possível carregar o mercado.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mercado</Text>
        <TouchableOpacity style={styles.vendaBtn} onPress={() => setModalAberto(true)}>
          <Text style={styles.vendaBtnText}>+ Vender</Text>
        </TouchableOpacity>
      </View>

      <NovoProdutoModal
        visible={modalAberto}
        onClose={() => setModalAberto(false)}
        onPublicado={() => { setCarregando(true); carregar(); }}
      />

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
      ) : produtos.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.vazioEmoji}>🛒</Text>
          <Text style={styles.centroTexto}>Nenhum produto à venda ainda.{"\n"}Abra sua loja na cidade!</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} tintColor="#FF5C2E" />}
        >
          <View style={styles.grid}>
            {produtos.map((p) => (
              <TouchableOpacity key={p.id} style={styles.card} activeOpacity={0.8}>
                <View style={styles.emojiBox}>
                  <Text style={styles.emoji}>{(p.categoria && EMOJI_CATEGORIA[p.categoria]) || "🛍"}</Text>
                </View>
                {!!p.categoria && <Text style={styles.categoria}>{p.categoria}</Text>}
                <Text style={styles.nome} numberOfLines={2}>{p.nome}</Text>
                <Text style={styles.vendedor} numberOfLines={1}>{p.vendedor}</Text>
                <Text style={styles.preco}>{formatarPreco(p.preco)}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111", letterSpacing: -0.5 },
  vendaBtn: { backgroundColor: "#FF5C2E", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  vendaBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  scroll: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  centroTexto: { color: "#888", fontSize: 15, textAlign: "center", lineHeight: 22 },
  vazioEmoji: { fontSize: 48 },
  retryBtn: { backgroundColor: "#FF5C2E", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 12 },
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
