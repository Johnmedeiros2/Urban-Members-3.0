import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

const POSTS_INICIAIS = [
  { id: "1", autor: "Carlos Silva", bairro: "Centro", tempo: "2min atrás", texto: "Acabei de abrir minha loja no mercado da cidade. Passa lá! 🏪", curtidas: 12, comentarios: 3 },
  { id: "2", autor: "Ana Ferreira", bairro: "Vila Nova", tempo: "15min atrás", texto: "Novo curso de design disponível no bairro criativo. Vagas limitadas 🎨", curtidas: 34, comentarios: 8 },
  { id: "3", autor: "João Medeiros", bairro: "Zona Sul", tempo: "1h atrás", texto: "A cidade está crescendo rápido! Já somos mais de 500 moradores. Bem-vindos! 🏙️", curtidas: 89, comentarios: 21 },
];

export default function FeedScreen() {
  const [posts, setPosts] = useState(POSTS_INICIAIS);
  const [curtidos, setCurtidos] = useState<Set<string>>(new Set());

  function curtir(id: string) {
    setCurtidos((prev) => {
      const novo = new Set(prev);
      const jaCurtiu = novo.has(id);
      jaCurtiu ? novo.delete(id) : novo.add(id);
      setPosts((p) =>
        p.map((post) =>
          post.id === id
            ? { ...post, curtidas: post.curtidas + (jaCurtiu ? -1 : 1) }
            : post
        )
      );
      return novo;
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Urban Members</Text>
        <TouchableOpacity style={styles.newPostBtn}>
          <Text style={styles.newPostText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {posts.map((post) => {
          const curtiu = curtidos.has(post.id);
          return (
            <View key={post.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post.autor[0]}</Text>
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.autorName}>{post.autor}</Text>
                  <Text style={styles.bairroTag}>📍 {post.bairro} · {post.tempo}</Text>
                </View>
              </View>

              <Text style={styles.postText}>{post.texto}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => curtir(post.id)}>
                  <Text style={[styles.actionText, curtiu && styles.curtido]}>
                    {curtiu ? "❤️" : "🤍"} {post.curtidas}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionText}>💬 {post.comentarios}</Text>
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
  newPostBtn: { backgroundColor: "#FF5C2E", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  newPostText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
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
