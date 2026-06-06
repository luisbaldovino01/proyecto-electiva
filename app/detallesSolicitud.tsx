import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Pressable,
    Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function DetallesSolicitud() {

    const { id } = useLocalSearchParams<{ id: string }>();
    const [solicitud, setSolicitud] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDetalle();
    }, []);

    const cargarDetalle = async () => {
        try {
            const docRef = doc(db, "solicitudes", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSolicitud({ id: docSnap.id, ...docSnap.data() });
            } else {
                Alert.alert("Error", "Solicitud no encontrada");
                router.back();
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudo cargar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4183DE" />
            </View>
        );
    }

    if (!solicitud) return null;

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* VOLVER */}
            <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>Volver</Text>
            </Pressable>

            {/* HEADER */}
            <Text style={styles.servicio}>{solicitud.servicio}</Text>

            <View style={styles.badgeEstado}>
                <Text style={styles.badgeText}>{solicitud.estado}</Text>
            </View>

            {/* SECCIÓN: CLIENTE */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Datos del cliente</Text>

                <FilaInfo label="Nombre"   value={solicitud.clienteNombre} />
                <FilaInfo label="Teléfono" value={solicitud.telefono} />
            </View>

            {/* SECCIÓN: SERVICIO */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Detalle del servicio</Text>

                <FilaInfo label="Categoría" value={solicitud.categoria} />
                <FilaInfo
                    label="Fecha"
                    value={new Date(solicitud.fechaServicio).toLocaleDateString("es-CO", {
                        day: "2-digit", month: "long", year: "numeric",
                    })}
                />
                <FilaInfo
                    label="Hora"
                    value={new Date(solicitud.horaServicio).toLocaleTimeString([], {
                        hour: "2-digit", minute: "2-digit",
                    })}
                />

                {/* Descripción completa */}
                <View style={styles.fila}>
                    <Text style={styles.filaLabel}>Descripción</Text>
                </View>
                <Text style={styles.descripcion}>{solicitud.descripcion}</Text>
            </View>

            {/* SECCIÓN: FOTOS */}
            {solicitud.fotos?.length > 0 && (
                <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>Fotos adjuntas</Text>
                    <View style={styles.fotosContainer}>
                        {solicitud.fotos.map((foto: string, index: number) => (
                            <Image
                                key={index}
                                source={{ uri: foto }}
                                style={styles.foto}
                            />
                        ))}
                    </View>
                </View>
            )}

            {/* FECHA DE CREACIÓN */}
            <Text style={styles.fechaCreacion}>
                Publicado el{" "}
                {solicitud.fechaCreacion?.seconds
                    ? new Date(solicitud.fechaCreacion.seconds * 1000).toLocaleDateString("es-CO")
                    : "—"}
            </Text>

        </ScrollView>
    );
}

// =========================
// COMPONENTE FILA
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
// ESTILOS
// =========================

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: "#F5F7FB",
    },
    container: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 60,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        marginBottom: 16,
    },
    backText: {
        color: "#555",
        fontSize: 15,
        fontWeight: "500",
    },
    servicio: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#1B2431",
        marginBottom: 10,
    },
    badgeEstado: {
        alignSelf: "flex-start",
        backgroundColor: "#FFF3DC",
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 24,
    },
    badgeText: {
        color: "#E09800",
        fontWeight: "700",
        fontSize: 13,
        textTransform: "capitalize",
    },
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
        color: "#999",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 14,
    },
    fila: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    filaLabel: {
        fontSize: 14,
        color: "#888",
    },
    filaValue: {
        fontSize: 14,
        color: "#111",
        fontWeight: "500",
        textAlign: "right",
        flex: 1,
        marginLeft: 10,
    },
    descripcion: {
        fontSize: 14,
        color: "#444",
        lineHeight: 22,
        marginTop: 8,
    },
    fotosContainer: {
        flexDirection: "row",
        gap: 12,
        flexWrap: "wrap",
        marginTop: 8,
    },
    foto: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: "#eee",
    },
    fechaCreacion: {
        textAlign: "center",
        color: "#BBB",
        fontSize: 13,
        marginTop: 8,
    },
});