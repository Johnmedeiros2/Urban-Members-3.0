import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../../components/Logo";
import NovoPostModal from "../../components/NovoPostModal";
import BoasVindas from "../../components/BoasVindas";
import { supabase } from "../../lib/supabase";
import { tempoRelativo } from "../../lib/tempo";
import { listarSetores, registrarInteracao, type Setor } from "../../lib/setores";

type Post = {
  id: string;
  conteudo: string;
  total_curtidas: number;
  total_comentarios: number;
  criado_em: string;
  autor_nome: string;
  autor_foto: string | null;
  setorId: string;
  setorNome: string;
};

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [setorAtivo, setSetorAtivo] = useState<string | null>(null); // null = Tudo
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [curtidos, setCurtidos] = useState<Set<string>>(new Set());
  const [meuId, setMeuId] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [boasVindas, setBoasVindas] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("boas_vindas_visto").then((v) => {
      if (!v) setBoasVindas(true);
    });
    listarSetores().then(setSetores);
  }, []);

  async function concluirBoasVindas() {
    await AsyncStorage.setItem("boas_vindas_visto", "sim");
    setBoasVindas(false);
  }

  const carregar = useCallback(async (setorId: string | null) => {
    setErro(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setMeuId(user?.id ?? null);

      // 1) Posts reais — filtrados por setor quando houver um selecionado
      let query = supabase
        .from("posts")
        .select("id, conteudo, total_curtidas, total_comentarios, criado_em, autor_id, bairro_id")
        .is("apagado_em", null)
        .order("criado_em", { ascending: false })
        .limit(30);
      if (setorId) query = query.eq("bairro_id", setorId);
      const { data: postsData, error } = await query;
      if (error) throw error;

      const lista = postsData ?? [];

      // 2) Autores (tabela perfis)
      const autorIds = [...new Set(lista.map((p) => p.autor_id).filter(Boolean))];
      const perfisMap = new Map<string, { nome: string; foto_url: string | null }>();
      if (autorIds.length) {
        const { data: perfis } = await supabase
          .from("perfis")
          .select("id, nome, foto_url")
          .in("id", autorIds);
        perfis?.forEach((p) => perfisMap.set(p.id, { nome: p.nome, foto_url: p.foto_url }));
      }

      // 3) Nome dos setores (tabela bairros)
      const setorIds = [...new Set(lista.map((p) => p.bairro_id).filter(Boolean))];
      const setoresMap = new Map<string, string>();
      if (setorIds.length) {
        const { data: bairros } = await supabase
          .from("bairros")
          .select("id, nome")
          .in("id", setorIds);
        bairros?.forEach((b) => setoresMap.set(b.id, b.nome));
      }

      // 4) Quais desses posts eu já curti
      if (user && lista.length) {
        const { data: minhas } = await supabase
          .from("curtidas")
          .select("post_id")
          .eq("morador_id", user.id)
          .in("post_id", lista.map((p) => p.id));
        setCurtidos(new Set((minhas ?? []).map((c) => c.post_id)));
      }

      setPosts(
        lista.map((p) => ({
          id: p.id,
          conteudo: p.conteudo,
          total_curtidas: p.total_curtidas ?? 0,
          total_comentarios: p.total_comentarios ?? 0,
          criado_em: p.criado_em,
          autor_nome: perfisMap.get(p.autor_id)?.nome ?? "Morador",
          autor_foto: perfisMap.get(p.autor_id)?.foto_url ?? null,
          setorId: p.bairro_id,
          setorNome: setoresMap.get(p.bairro_id) ?? "Cidade",
        }))
      );
    } catch (e: any) {
      setErro("Não foi possível carregar o feed. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(null); }, [carregar]);

  function trocarSetor(setorId: string | null) {
    setSetorAtivo(setorId);
    setCarregando(true);
    carregar(setorId);
    if (setorId) registrarInteracao(setorId, "visita"); // sinal de comportamento
  }

  async function curtir(id: string) {
    if (!meuId) return;
    const post = posts.find((p) => p.id === id);
    const jaCurtiu = curtidos.has(id);

    // Atualização otimista (muda na tela na hora)
    setCurtidos((prev) => {
      const novo = new Set(prev);
      jaCurtiu ? novo.delete(id) : novo.add(id);
      return novo;
    });
    setPosts((p) =>
      p.map((post) =>
        post.id === id
          ? { ...post, total_curtidas: post.total_curtidas + (jaCurtiu ? -1 : 1) }
          : post
      )
    );

    try {
      if (jaCurtiu) {
        await supabase.from("curtidas").delete().eq("post_id", id).eq("morador_id", meuId);
      } else {
        await supabase.from("curtidas").insert({ post_id: id, morador_id: meuId });
        if (post) registrarInteracao(post.setorId, "curtida"); // sinal de comportamento
      }
    } catch {
      carregar(setorAtivo);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Logo size={36} variant="dark" />
          <Text style={styles.headerTitle}>Urban Members</Text>
        </View>
        <TouchableOpacity style={styles.newPostBtn} onPress={() => setModalAberto(true)}>
          <Text style={styles.newPostText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros por setor */}
      <View style={styles.filtroBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtroRow}>
          <TouchableOpacity
            style={[styles.filtroChip, setorAtivo === null && styles.filtroChipAtivo]}
            onPress={() => trocarSetor(null)}
          >
            <Text style={[styles.filtroTexto, setorAtivo === null && styles.filtroTextoAtivo]}>Tudo</Text>
          </TouchableOpacity>
          {setores.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.filtroChip, setorAtivo === s.id && { backgroundColor: s.cor, borderColor: s.cor }]}
              onPress={() => trocarSetor(s.id)}
            >
              <Text style={[styles.filtroTexto, setorAtivo === s.id && styles.filtroTextoAtivo]}>{s.nome}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <NovoPostModal
        visible={modalAberto}
        onClose={() => setModalAberto(false)}
        onPublicado={() => carregar(setorAtivo)}
      />

      <BoasVindas visible={boasVindas} onConcluir={concluirBoasVindas} />

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#FF5C2E" />
          <Text style={styles.centroTexto}>Carregando a cidade...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.centroTexto}>{erro}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setCarregando(true); carregar(setorAtivo); }}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.vazioEmoji}>🏙</Text>
          <Text style={styles.centroTexto}>
            {setorAtivo ? "Ainda não há posts neste setor.\nSeja o primeiro!" : "Ainda não há posts na cidade.\nSeja o primeiro a publicar!"}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => carregar(setorAtivo)} tintColor="#FF5C2E" />
          }
        >
          {posts.map((post) => {
            const curtiu = curtidos.has(post.id);
            return (
              <View key={post.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {post.autor_foto ? (
                    <Image source={{ uri: post.autor_foto }} style={styles.avatarImg} />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{post.autor_nome[0]?.toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.cardMeta}>
                    <Text style={styles.autorName}>{post.autor_nome}</Text>
                    <Text style={styles.bairroTag}>📍 {post.setorNome} · {tempoRelativo(post.criado_em)}</Text>
                  </View>
                </View>

                <Text style={styles.postText}>{post.conteudo}</Text>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => curtir(post.id)}>
                    <Text style={[styles.actionText, curtiu && styles.curtido]}>
                      {curtiu ? "❤️" : "🤍"} {post.total_curtidas}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>💬 {post.total_comentarios}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>↗️ Compartilhar</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111", letterSpacing: -0.5 },
  newPostBtn: { backgroundColor: "#FF5C2E", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  newPostText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  filtroBar: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 12,
  },
  filtroRow: { paddingHorizontal: 16, gap: 8 },
  filtroChip: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filtroChipAtivo: { backgroundColor: "#111", borderColor: "#111" },
  filtroTexto: { color: "#666", fontSize: 13, fontWeight: "600" },
  filtroTextoAtivo: { color: "#fff" },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  centroTexto: { color: "#888", fontSize: 15, textAlign: "center", lineHeight: 22 },
  vazioEmoji: { fontSize: 48 },
  retryBtn: { backgroundColor: "#FF5C2E", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FF5C2E", alignItems: "center", justifyContent: "center", marginRight: 10 },
  avatarImg: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: "#eee" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cardMeta: { flex: 1 },
  autorName: { fontSize: 14, fontWeight: "700", color: "#111" },
  bairroTag: { fontSize: 12, color: "#999", marginTop: 2 },
  postText: { fontSize: 15, color: "#333", lineHeight: 22, marginBottom: 14 },
  actions: { flexDirection: "row", gap: 16, borderTopWidth: 1, borderTopColor: "#F5F5F5", paddingTop: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  actionText: { fontSize: 13, color: "#888", fontWeight: "500" },
  curtido: { color: "#FF5C2E" },
});
