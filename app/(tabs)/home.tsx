import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import type { ComponentProps } from "react";

export default function Home() {

  type IoniconsName = ComponentProps<typeof Ionicons>["name"];

  const servicios: { id: number; nombre: string; icono: IoniconsName; color: string; bg: string }[] = [
    {
      id: 1,
      nombre: "Limpieza",
      icono: "brush",
      color: "#8B5CF6",
      bg: "#F4EDFF",
    },
    {
      id: 2,
      nombre: "Montaje",
      icono: "construct",
      color: "#FF9800",
      bg: "#FFF4E5",
    },
    {
      id: 3,
      nombre: "Pintura",
      icono: "color-fill",
      color: "#2196F3",
      bg: "#EFF6FF",
    },
    {
      id: 4,
      nombre: "Electros",
      icono: "hardware-chip",
      color: "#F4B400",
      bg: "#FFF8E1",
    },
    {
      id: 5,
      nombre: "Plomería",
      icono: "water",
      color: "#4CAF50",
      bg: "#EFFAF0",
    },
    {
      id: 6,
      nombre: "Electricidad",
      icono: "flash",
      color: "#FFC107",
      bg: "#FFF8E1",
    },
    {
      id: 7,
      nombre: "Cerrajería",
      icono: "lock-closed",
      color: "#3F51B5",
      bg: "#EFF3FF",
    },
    {
      id: 8,
      nombre: "Carpinteria",
      icono: "hammer",
      color: "#8B5CF6",
      bg: "#F4EDFF",
    },
  ];

  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    const usuarioGuardado = await AsyncStorage.getItem("usuario");

    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);

      setNombreUsuario(usuario.usuario_nombre);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.userInfo}>
            <View>
              <Text style={styles.title}>
                ¡Hola, {nombreUsuario}!
              </Text>

              <Text style={styles.location}>
                Sincelejo, Sucre
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
        <Text style={styles.titleCategoria}>¿Qué necesitas?</Text>
        <View style={styles.categoriasContainer}>
          {servicios.map((item) => (
            <Pressable
              key={item.id}
              style={styles.categoriaItem}
              onTouchEnd={() => router.push({ pathname: "/solicitud", params: { servicio: item.nombre, }, })}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.bg }
                ]}
              >
                <Ionicons
                  name={item.icono}
                  size={28}
                  color={item.color}
                />
              </View>

              <Text style={styles.categoriaNombre}>
                {item.nombre}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },

  titleCategoria: {
    color: "#1B2431",
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 10
  },

  header: {
    backgroundColor: "#4183DE",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  topRow: {
    marginBottom: 25,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  location: {
    color: "#E8E8E8",
    fontSize: 16,
  },

  input: {
    flex: 1,
    marginLeft: 10,
  },

  categoriasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  categoriaItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 25,
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  categoriaNombre: {
    marginTop: 8,
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
});
