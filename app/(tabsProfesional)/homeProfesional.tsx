import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { router } from "expo-router";

export default function HomeProfesional() {

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [profesional, setProfesional] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const profesionalGuardado = await AsyncStorage.getItem("profesional");

      if (!profesionalGuardado) {
        Alert.alert("Error", "No se encontró el profesional");
        return;
      }

      const profesionalData = JSON.parse(profesionalGuardado);
      setProfesional(profesionalData);

      const q = query(
        collection(db, "solicitudes"),
        where("categoria", "==", profesionalData.especialidad),
        where("estado", "==", "pendiente")
      );

      const snapshot = await getDocs(q);

      const lista = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setSolicitudes(lista);

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const aceptarSolicitud = async (solicitudId: string) => {
    try {
      await updateDoc(doc(db, "solicitudes", solicitudId), {
        estado: "asignado",
        profesionalId: profesional.id,
        profesionalNombre: profesional.nombre,
      });

      Alert.alert("Solicitud aceptada", "El trabajo fue asignado correctamente");
      cargarSolicitudes();

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo aceptar la solicitud");
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>

      <Text style={styles.servicio}>{item.servicio}</Text>
      <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>

      <Text style={styles.info}>Cliente: {item.clienteNombre}</Text>
      <Text style={styles.info}>Teléfono: {item.telefono}</Text>
      <Text style={styles.info}>
        Fecha: {new Date(item.fechaServicio).toLocaleDateString()}
      </Text>

      {/* BOTONES */}
      <View style={styles.botonesRow}>

        {/* Ver detalles */}
        <Pressable
          style={styles.buttonSecondary}
          onPress={() =>
            router.push({
              pathname: "/detallesSolicitud",
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.buttonSecondaryText}>Ver detalles</Text>
        </Pressable>

        {/* Aceptar trabajo */}
        <Pressable
          style={styles.buttonPrimary}
          onPress={() => aceptarSolicitud(item.id)}
        >
          <Text style={styles.buttonPrimaryText}>Aceptar</Text>
        </Pressable>

      </View>

    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Solicitudes disponibles</Text>
      <Text style={styles.subtitle}>Categoría: {profesional?.especialidad}</Text>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay solicitudes disponibles.</Text>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B2431",
    marginBottom: 5,
  },
  subtitle: {
    color: "#777",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  servicio: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4183DE",
    marginBottom: 8,
  },
  descripcion: {
    color: "#555",
    marginBottom: 10,
  },
  info: {
    color: "#777",
    marginBottom: 4,
  },
  botonesRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  buttonSecondary: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4183DE",
  },
  buttonSecondaryText: {
    color: "#4183DE",
    fontWeight: "bold",
  },
  buttonPrimary: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#4183DE",
  },
  buttonPrimaryText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },
});