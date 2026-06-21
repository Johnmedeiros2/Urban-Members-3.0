import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CATEGORIAS = ["Produto", "Serviço", "Digital", "Curso", "Moda"];

export default function NovoProdutoModal({
  visible,
  onClose,
  onPublicado,
}: {
  visible: boolean;
  onClose: () => void;
  onPublicado: () => void;
}) {
  const [nomeProduto, setNomeProduto] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [nomeLoja, setNomeLoja] = useState("");
  const [lojaExistente, setLojaExistente] = useState<{ id: string; nome: string } | null>(null);
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: loja } = await supabase
        .from("lojas")
        .select("id, nome")
        .eq("dono_id", user.id)
        .maybeSingle();
      setLojaExistente(loja ?? null);
    })();
  }, [visible]);

  async function publicar() {
    if (!nomeProduto.trim()) {
      Alert.alert("Falta o nome", "Dê um nome ao seu produto.");
      return;
    }
    const precoNum = Number(preco.replace(",", "."));
    if (!precoNum || precoNum <= 0) {
      Alert.alert("Preço inválido", "Informe um preço válido (ex: 49,90).");
      return;
    }
    if (!lojaExistente && !nomeLoja.trim()) {
      Alert.alert("Falta o nome da loja", "Como sua loja vai se chamar?");
      return;
    }

    setPublicando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPublicando(false);
      Alert.alert("Sessão expirada", "Entre novamente para vender.");
      return;
    }

    // 1) Garante uma loja (cria se ainda não tiver)
    let lojaId = lojaExistente?.id;
    if (!lojaId) {
      const { error: erroLoja } = await supabase.from("lojas").insert({
        dono_id: user.id,
        nome: nomeLoja.trim(),
        bairro_id: "mercado",
      });
      if (erroLoja) {
        setPublicando(false);
        Alert.alert("Não deu pra criar a loja", erroLoja.message);
        return;
      }
      const { data: novaLoja } = await supabase
        .from("lojas")
        .select("id")
        .eq("dono_id", user.id)
        .maybeSingle();
      lojaId = novaLoja?.id;
    }

    if (!lojaId) {
      setPublicando(false);
      Alert.alert("Ops", "Não foi possível identificar sua loja.");
      return;
    }

    // 2) Cria o produto
    const { error } = await supabase.from("produtos").insert({
      loja_id: lojaId,
      nome: nomeProduto.trim(),
      preco: precoNum,
      categoria,
      descricao: descricao.trim() || null,
      disponivel: true,
    });
    setPublicando(false);
    if (error) {
      Alert.alert("Não deu pra publicar", error.message);
      return;
    }

    setNomeProduto(""); setPreco(""); setDescricao("");
    onPublicado();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.sheet}>
          <View style={styles.topo}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.titulo}>Vender na cidade</Text>
            <TouchableOpacity onPress={publicar} disabled={publicando}>
              {publicando ? <ActivityIndicator color="#FF5C2E" /> : <Text style={styles.publicar}>Publicar</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {lojaExistente ? (
              <Text style={styles.lojaInfo}>🏪 Vendendo pela loja: <Text style={{ fontWeight: "700" }}>{lojaExistente.nome}</Text></Text>
            ) : (
              <>
                <Text style={styles.label}>Nome da sua loja</Text>
                <TextInput style={styles.input} placeholder="Ex: Studio Vila" placeholderTextColor="#999" value={nomeLoja} onChangeText={setNomeLoja} />
              </>
            )}

            <Text style={styles.label}>Nome do produto</Text>
            <TextInput style={styles.input} placeholder="Ex: Pack de Design" placeholderTextColor="#999" value={nomeProduto} onChangeText={setNomeProduto} />

            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput style={styles.input} placeholder="Ex: 49,90" placeholderTextColor="#999" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" />

            <Text style={styles.label}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              {CATEGORIAS.map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, categoria === c && styles.chipAtivo]} onPress={() => setCategoria(c)}>
                  <Text style={[styles.chipTexto, categoria === c && styles.chipTextoAtivo]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput style={[styles.input, styles.inputMulti]} placeholder="Conte sobre o que está vendendo" placeholderTextColor="#999" value={descricao} onChangeText={setDescricao} multiline />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: "88%" },
  topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cancelar: { color: "#888", fontSize: 15 },
  titulo: { fontSize: 16, fontWeight: "700", color: "#111" },
  publicar: { color: "#FF5C2E", fontSize: 15, fontWeight: "700" },
  lojaInfo: { fontSize: 14, color: "#555", backgroundColor: "#FFF0EC", padding: 12, borderRadius: 12, marginBottom: 8 },
  label: { fontSize: 13, color: "#888", fontWeight: "600", marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: "#F4F4F5", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: "#111" },
  inputMulti: { minHeight: 80, textAlignVertical: "top" },
  chip: { backgroundColor: "#F0F0F0", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  chipAtivo: { backgroundColor: "#FF5C2E" },
  chipTexto: { color: "#555", fontSize: 13, fontWeight: "600" },
  chipTextoAtivo: { color: "#fff" },
});
