import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";


interface Profesional {
  nombre: string;
  fotoPerfil?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  direccion: string;
  especialidad: string;
  experiencia: string;
  descripcion: string;
  cedulaFrontal?: string;
  cedulaTrasera?: string;
  certificado?: { name: string; uri: string; };
  estadoValidacion: "pendiente" | "aprobado" | "rechazado";
}

const ESTADO_COLORS = {
  pendiente: { bg: "#FFF3DC", text: "#E09800" },
  aprobado: { bg: "#DCF5E8", text: "#1A7A3C" },
  rechazado: { bg: "#FFE0E0", text: "#C0392B" },
};

const AVATAR_FALLBACK = "https://i.pravatar.cc/300";

const toStringSafe = (valor: any): string => {
  if (valor === null || valor === undefined) return "—";
  // Timestamp de Firestore (instancia)
  if (valor instanceof Timestamp) {
    return valor.toDate().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  // Objeto plano con seconds/nanoseconds (Timestamp sin instancia)
  if (typeof valor === "object" && "seconds" in valor) {
    return new Date(valor.seconds * 1000).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  // Date nativo
  if (valor instanceof Date) {
    return valor.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return String(valor);
};

// =========================
// NORMALIZA los datos de Firestore antes de guardar en estado
// =========================

const normalizarProfesional = (data: any): Profesional => ({
  nombre: toStringSafe(data.nombre),
  fotoPerfil: data.fotoPerfil ?? undefined,
  tipoDocumento: toStringSafe(data.tipoDocumento),
  numeroDocumento: toStringSafe(data.numeroDocumento),
  fechaNacimiento: toStringSafe(data.fechaNacimiento),
  direccion: toStringSafe(data.direccion),
  especialidad: toStringSafe(data.especialidad),
  experiencia: toStringSafe(data.experiencia),
  descripcion: toStringSafe(data.descripcion),
  cedulaFrontal: data.cedulaFrontal ?? "",
  cedulaTrasera: data.cedulaTrasera ?? "",
  certificado: data.certificado ?? null,
  estadoValidacion: data.estadoValidacion ?? "pendiente",
});

// =========================
// COMPONENTE FILA DE INFO
// =========================

function FilaInfo({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={styles.filaValue}>{value ?? "—"}</Text>
    </View>
  );
}

// =========================
// PANTALLA PRINCIPAL
// =========================

export default function DetalleProfesional() {

  const { id } = useLocalSearchParams<{ id: string }>();

  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerProfesional = useCallback(async () => {
    if (!id) {
      setError("ID no válido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, "perfil_profesional", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfesional(normalizarProfesional(docSnap.data()));
      } else {
        setError("Profesional no encontrado.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar la información.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const actualizarEstado = async (
    estado: "aprobado" | "rechazado"
  ) => {
    try {

      if (!id) return;

      await updateDoc(
        doc(db, "perfil_profesional", id),
        {
          estadoValidacion: estado,
        }
      );

      setProfesional(prev =>
        prev
          ? {
            ...prev,
            estadoValidacion: estado,
          }
          : null
      );

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerProfesional();
  }, [obtenerProfesional]);

  // =========================
  // ESTADOS DE CARGA / ERROR
  // =========================

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E09800" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error || !profesional) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Error desconocido."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={obtenerProfesional}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const estadoColors = ESTADO_COLORS[profesional.estadoValidacion] ?? ESTADO_COLORS.pendiente;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* VOLVER */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      {/* AVATAR + NOMBRE */}
      <View style={styles.headerSection}>
        <Image
          source={{ uri: profesional.fotoPerfil || AVATAR_FALLBACK }}
          style={styles.imagen}
        />
        <Text style={styles.nombre}>{profesional.nombre}</Text>
        <Text style={styles.especialidad}>{profesional.especialidad}</Text>

        <View style={[styles.badge, { backgroundColor: estadoColors.bg }]}>
          <Text style={[styles.badgeText, { color: estadoColors.text }]}>
            {profesional.estadoValidacion}
          </Text>
        </View>
      </View>

      {/* DATOS PERSONALES */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Datos personales</Text>
        <FilaInfo label="Tipo de documento" value={profesional.tipoDocumento} />
        <FilaInfo label="Número de documento" value={profesional.numeroDocumento} />
        <FilaInfo label="Fecha de nacimiento" value={profesional.fechaNacimiento} />
        <FilaInfo label="Dirección" value={profesional.direccion} />
      </View>

      {/* ESPECIALIDAD */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Especialidad</Text>
        <FilaInfo label="Especialidad" value={profesional.especialidad} />
        <FilaInfo label="Experiencia" value={profesional.experiencia} />
        <View style={styles.fila}>
          <Text style={styles.filaLabel}>Descripción</Text>
          <Text style={[styles.filaValue, styles.descripcion]}>
            {profesional.descripcion ?? "—"}
          </Text>
        </View>
      </View>

      {/*CERTIFICADOS*/}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>
          Documentos
        </Text>

        <Text style={styles.documentTitle}>
          Cédula frontal
        </Text>

        {profesional.cedulaFrontal ? (
          <Image
            source={{ uri: profesional.cedulaFrontal }}
            style={styles.documentImage}
          />
        ) : (
          <Text>No disponible</Text>
        )}

        <Text style={styles.documentTitle}>
          Cédula trasera
        </Text>

        {profesional.cedulaTrasera ? (
          <Image
            source={{ uri: profesional.cedulaTrasera }}
            style={styles.documentImage}
          />
        ) : (
          <Text>No disponible</Text>
        )}

        <Text style={styles.documentTitle}>
          Certificado
        </Text>

        <Text style={styles.certificadoText}>
          {profesional.certificado?.name ??
            "No se cargó certificado"}
        </Text>
      </View>

      {profesional.estadoValidacion === "pendiente" && (

        <View style={styles.actionsContainer}>

          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => actualizarEstado("aprobado")}
          >
            <Text style={styles.actionText}>
              Aprobar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => actualizarEstado("rechazado")}
          >
            <Text style={styles.actionText}>
              Rechazar
            </Text>
          </TouchableOpacity>

        </View>

      )}
    </ScrollView>
  );
}

// =========================
// ESTILOS
// =========================

const styles = StyleSheet.create({

  scroll: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  backButton: {
    marginBottom: 16,
  },

  backButtonText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 28,
  },

  imagen: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#ddd",
    marginBottom: 14,
  },

  nombre: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },

  especialidad: {
    marginTop: 4,
    fontSize: 15,
    color: "#777",
  },

  badge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 30,
  },

  badgeText: {
    fontWeight: "700",
    fontSize: 13,
    textTransform: "capitalize",
  },

  seccion: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  seccionTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  filaLabel: {
    fontSize: 14,
    color: "#888",
    flex: 1,
  },

  filaValue: {
    fontSize: 14,
    color: "#111",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },

  descripcion: {
    textAlign: "right",
    lineHeight: 20,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 14,
  },

  loadingText: {
    marginTop: 10,
    color: "#999",
    fontSize: 14,
  },

  errorText: {
    color: "#C0392B",
    fontSize: 15,
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  backText: {
    color: "#888",
    fontSize: 14,
  },

  documentTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "bold",
    color: "#111",
  },

  documentImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },

  certificadoText: {
    color: "#555",
    marginTop: 8,
  },

  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  approveButton: {
    flex: 1,
    backgroundColor: "#1A7A3C",
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#C0392B",
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

});