import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LayoutProfesional() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#4183DE",
        }}>
            <Tabs.Screen
                name="homeProfesional"
                options={{
                    title: "Solicitudes",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="misTrabajos"
                options={{
                    title: "Mis trabajos",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="briefcase-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}