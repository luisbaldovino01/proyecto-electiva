import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

// =========================
// HELPER TIMESTAMP
// =========================

const toStringSafe = (valor: any): string => {
    if (!valor) return "—";
    if (valor?.seconds) {
        return new Date(valor.seconds * 1000).toLocaleDateString("es-CO", {
            day: "2-digit", month: "long", year: "numeric",
        });
    }
    return String(valor);
};

const AVATAR_FALLBACK = "https://i.pravatar.cc/300";

// =========================
// PANTALLA
// =========================

export default function PerfilProfesionalPublico() {

    const { profesionalNombre } = useLocalSearchParams<{ profesionalNombre: string }>();

    const [profesional, setProfesional] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const q = query(
                collection(db, "perfil_profesional"),
                where("nombre", "==", profesionalNombre)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setProfesional({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setError("No se encontró el perfil del profesional.");
            }
        } catch (err) {
            console.log(err);
            setError("Error al cargar el perfil.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7C4DFF" />
            </View>
        );
    }

    if (error || !profesional) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.backLink}>← Volver</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* VOLVER */}
            <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Volver</Text>
            </Pressable>

            {/* HEADER — foto, nombre, especialidad */}
            <View style={styles.headerSection}>
                <Image
                    source={{ uri: profesional.fotoPerfil || AVATAR_FALLBACK }}
                    style={styles.avatar}
                />
                <Text style={styles.nombre}>{profesional.nombre}</Text>
                <Text style={styles.especialidad}>{profesional.especialidad}</Text>

                {/* Badge experiencia */}
                <View style={styles.expBadge}>
                    <Ionicons name="briefcase-outline" size={14} color="#7C4DFF" />
                    <Text style={styles.expBadgeText}>
                        {profesional.experiencia} {profesional.experiencia === 1 ? "año" : "años"} de experiencia
                    </Text>
                </View>
            </View>

            {/* SOBRE MÍ */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Sobre mí</Text>
                <Text style={styles.descripcion}>{profesional.descripcion ?? "—"}</Text>
            </View>

            {/* INFORMACIÓN */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Información</Text>

                <FilaInfo
                    icono="construct-outline"
                    label="Especialidad"
                    value={profesional.especialidad}
                />
                <FilaInfo
                    icono="location-outline"
                    label="Dirección"
                    value={profesional.direccion}
                />
                <FilaInfo
                    icono="calendar-outline"
                    label="Fecha de nacimiento"
                    value={toStringSafe(profesional.fechaNacimiento)}
                />
                <FilaInfo
                    icono="call-outline"
                    label="Teléfono"
                    value={profesional.numero}
                />
            </View>

        </ScrollView>
    );
}

// =========================
// COMPONENTE FILA
// =========================

function FilaInfo({ icono, label, value }: { icono: any; label: string; value?: string }) {
    return (
        <View style={styles.fila}>
            <View style={styles.filaIconBox}>
                <Ionicons name={icono} size={16} color="#7C4DFF" />
            </View>
            <View style={styles.filaTexto}>
                <Text style={styles.filaLabel}>{label}</Text>
                <Text style={styles.filaValue}>{value ?? "—"}</Text>
            </View>
        </View>
    );
}

// =========================
// ESTILOS
// =========================

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: "#F3F0FA",
    },
    container: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 60,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    errorText: {
        color: "#C0392B",
        fontSize: 15,
        textAlign: "center",
    },
    backLink: {
        color: "#7C4DFF",
        fontSize: 14,
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        color: "#555",
        fontSize: 15,
        fontWeight: "500",
    },

    // --- Header ---
    headerSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#ddd",
        marginBottom: 14,
        borderWidth: 3,
        borderColor: "#E0D7FF",
    },
    nombre: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1B2431",
    },
    especialidad: {
        marginTop: 4,
        fontSize: 15,
        color: "#888",
    },
    expBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 12,
        backgroundColor: "#F0EBFF",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    expBadgeText: {
        color: "#7C4DFF",
        fontWeight: "600",
        fontSize: 13,
    },

    // --- Secciones ---
    seccion: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    seccionTitulo: {
        fontSize: 13,
        fontWeight: "700",
        color: "#7C4DFF",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 14,
    },
    descripcion: {
        fontSize: 14,
        color: "#555",
        lineHeight: 22,
    },

    // --- Filas ---
    fila: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    filaIconBox: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: "#F0EBFF",
        justifyContent: "center",
        alignItems: "center",
    },
    filaTexto: {
        flex: 1,
    },
    filaLabel: {
        fontSize: 12,
        color: "#AAA",
        marginBottom: 2,
    },
    filaValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
});
