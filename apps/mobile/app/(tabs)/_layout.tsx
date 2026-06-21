import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#111", borderTopColor: "#222" },
        tabBarActiveTintColor: "#FF5C2E",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
      <Tabs.Screen name="bairros" options={{ title: "Setores" }} />
      <Tabs.Screen name="mercado" options={{ title: "Mercado" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
