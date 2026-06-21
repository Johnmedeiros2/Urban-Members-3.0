import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha email e senha.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      Alert.alert("Erro ao entrar", error.message);
    } else {
      router.replace("/(tabs)/feed");
    }
  }

  async function cadastrar() {
    if (!email || !senha || !nome) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { full_name: nome } },
    });
    setCarregando(false);
    if (error) {
      Alert.alert("Erro ao cadastrar", error.message);
    } else {
      Alert.alert("Quase lá!", "Confirme seu email e volte para entrar.", [
        { text: "OK", onPress: () => setModo("login") },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        <View style={styles.top}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🏙</Text>
          </View>
          <Text style={styles.logoText}>Urban Members</Text>
        </View>

        <View style={styles.middle}>
          <Text style={styles.headline}>
            {modo === "login" ? "Bem-vindo\nde volta." : "Reserve seu\nendereço."}
          </Text>

          <View style={styles.form}>
            {modo === "cadastro" && (
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor="#555"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#555"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.btnPrimary}
              activeOpacity={0.85}
              onPress={modo === "login" ? entrar : cadastrar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>
                  {modo === "login" ? "Entrar na cidade →" : "Criar meu endereço →"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => setModo(modo === "login" ? "cadastro" : "login")}
            >
              <Text style={styles.btnSecondaryText}>
                {modo === "login"
                  ? "Não tem conta? Criar agora"
                  : "Já tenho conta — Entrar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 48,
  },
  top: { marginBottom: 40 },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FF5C2E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: { fontSize: 26 },
  logoText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  middle: { flex: 1 },
  headline: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 32,
  },
  form: { gap: 12 },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  btnPrimary: {
    backgroundColor: "#FF5C2E",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  btnSecondary: {
    paddingVertical: 14,
    alignItems: "center",
  },
  btnSecondaryText: { color: "#666", fontSize: 14 },
});
