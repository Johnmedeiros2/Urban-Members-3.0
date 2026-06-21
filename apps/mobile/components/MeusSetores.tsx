import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { listarSetores } from "../lib/setores";

type Linha = { id: string; nome: string; cor: string; total: number };

export default function MeusSetores() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setCarregando(false); return; }

        const [{ data: interacoes }, setores] = await Promise.all([
          supabase.from("setor_interacoes").select("setor_id").eq("morador_id", user.id),
          listarSetores(),
        ]);

        // Conta interações por setor
        const contagem = new Map<string, number>();
        (interacoes ?? []).forEach((i) => {
          contagem.set(i.setor_id, (contagem.get(i.setor_id) ?? 0) + 1);
        });

        const lista: Linha[] = setores
          .map((s) => ({ id: s.id, nome: s.nome, cor: s.cor, total: contagem.get(s.id) ?? 0 }))
          .filter((l) => l.total > 0)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        setLinhas(lista);
      } catch {
        // silencioso
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  if (carregando) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color="#FF5C2E" />
      </View>
    );
  }

  if (linhas.length === 0) {
    return (
      <View style={styles.box}>
        <Text style={styles.vazio}>
          Navegue pela cidade — seus interesses vão aparecer aqui conforme você usa o app. 🏙
        </Text>
      </View>
    );
  }

  const maior = linhas[0].total || 1;

  return (
    <View style={styles.box}>
      {linhas.map((l) => (
        <View key={l.id} style={styles.linha}>
          <Text style={styles.nome}>{l.nome}</Text>
          <View style={styles.barraFundo}>
            <View style={[styles.barra, { width: `${(l.total / maior) * 100}%`, backgroundColor: l.cor }]} />
          </View>
          <Text style={styles.total}>{l.total}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#fff", borderRadius: 14, padding: 16, gap: 12 },
  vazio: { fontSize: 13, color: "#999", textAlign: "center", lineHeight: 20 },
  linha: { flexDirection: "row", alignItems: "center", gap: 10 },
  nome: { width: 88, fontSize: 13, color: "#333", fontWeight: "600" },
  barraFundo: { flex: 1, height: 10, borderRadius: 5, backgroundColor: "#F0F0F0", overflow: "hidden" },
  barra: { height: 10, borderRadius: 5 },
  total: { width: 28, textAlign: "right", fontSize: 13, color: "#888", fontWeight: "700" },
});
