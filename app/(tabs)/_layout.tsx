import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,          // esconde o header padrão
        tabBarActiveTintColor: '#6200ee',
      }}
    >
      {/* --- 1. Tela principal do sensor (App.tsx) --- */}
      <Tabs.Screen
        name="App"
        options={{
          title: 'Sensor',          // rótulo na aba
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          ),
        }}
      />

      {/* --- 2. Tela de Chat com a IA (chat.tsx) --- */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />

      {/* --- 3. Demais abas já existentes (ex.: explore.tsx) --- */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Você pode adicionar outras telas se tiver (index.tsx, etc.) */}
    </Tabs>
  );
}