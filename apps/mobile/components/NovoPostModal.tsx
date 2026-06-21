import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { registrarInteracao } from "../lib/setores";

type Setor = { id: string; nome: string };

export default function NovoPostModal({
  visible,
  onClose,
  onPublicado,
}: {
  visible: boolean;
  onClose: () => void;
  onPublicado: () => void;
}) {
  const [conteudo, setConteudo] = useState("");
  const [setores, setSetores] = useState<Setor[]>([]);
  const [setorId, setSetorId] = useState<string | null>(null);
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const { data } = await supabase.from("bairros").select("id, nome");
      const lista = data ?? [];
      setSetores(lista);
      if (lista.length && !setorId) setSetorId(lista[0].id);
    })();
  }, [visible]);

  async function publicar() {
    if (!conteudo.trim()) {
      Alert.alert("Escreva algo", "Seu post está vazio.");
      return;
    }
    if (!setorId) {
      Alert.alert("Escolha um setor", "Diga em qual setor você está postando.");
      return;
    }
    setPublicando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPublicando(false);
      Alert.alert("Sessão expirada", "Entre novamente para publicar.");
      return;
    }
    const { error } = await supabase.from("posts").insert({
      autor_id: user.id,
      conteudo: conteudo.trim(),
      bairro_id: setorId,
    });
    setPublicando(false);
    if (error) {
      Alert.alert("Não deu pra publicar", error.message);
      return;
    }
    registrarInteracao(setorId, "post"); // sinal de comportamento
    setConteudo("");
    onPublicado();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.topo}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.titulo}>Novo post</Text>
            <TouchableOpacity onPress={publicar} disabled={publicando}>
              {publicando ? (
                <ActivityIndicator color="#FF5C2E" />
              ) : (
                <Text style={styles.publicar}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="O que está acontecendo na cidade?"
            placeholderTextColor="#999"
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            autoFocus
            maxLength={500}
          />

          <Text style={styles.label}>🏷 Em qual setor?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bairrosRow}>
            {setores.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.chip, setorId === s.id && styles.chipAtivo]}
                onPress={() => setSetorId(s.id)}
              >
                <Text style={[styles.chipTexto, setorId === s.id && styles.chipTextoAtivo]}>
                  {s.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cancelar: { color: "#888", fontSize: 15 },
  titulo: { fontSize: 16, fontWeight: "700", color: "#111" },
  publicar: { color: "#FF5C2E", fontSize: 15, fontWeight: "700" },
  input: { fontSize: 17, color: "#111", minHeight: 110, textAlignVertical: "top", lineHeight: 24 },
  label: { fontSize: 13, color: "#888", fontWeight: "600", marginTop: 12, marginBottom: 8 },
  bairrosRow: { flexDirection: "row" },
  chip: { backgroundColor: "#F0F0F0", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  chipAtivo: { backgroundColor: "#FF5C2E" },
  chipTexto: { color: "#555", fontSize: 13, fontWeight: "600" },
  chipTextoAtivo: { color: "#fff" },
});
