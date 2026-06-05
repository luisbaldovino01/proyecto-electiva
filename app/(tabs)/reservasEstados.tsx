import { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Pressable,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// =========================
// CONSTANTES
// =========================

type EstadoSolicitud = "pendiente" | "asignado" | "progreso" | "completado";

const TABS: EstadoSolicitud[] = ["pendiente", "asignado", "progreso", "completado"];

const TAB_LABELS: Record<EstadoSolicitud, string> = {
    pendiente: "Pendiente",
    asignado: "Asignado",
    progreso: "Progreso",
    completado: "Completado",
};

const BADGE_COLORS: Record<EstadoSolicitud, { bg: string; text: string }> = {
    pendiente: { bg: "#F3F4F6", text: "#6B7280" },
    asignado: { bg: "#EFF6FF", text: "#2563EB" },
    progreso: { bg: "#FFF7ED", text: "#EA580C" },
    completado: { bg: "#F0FDF4", text: "#16A34A" },
};

// =========================
// PANTALLA
// =========================

export default function ReservasEstados() {

    const [solicitudes, setSolicitudes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabActiva, setTabActiva] = useState<EstadoSolicitud>("pendiente");

    const solicitudesFiltradas = solicitudes.filter(s => s.estado === tabActiva);

    const contadores: Record<EstadoSolicitud, number> = {
        pendiente: solicitudes.filter(s => s.estado === "pendiente").length,
        asignado: solicitudes.filter(s => s.estado === "asignado").length,
        progreso: solicitudes.filter(s => s.estado === "progreso").length,
        completado: solicitudes.filter(s => s.estado === "completado").length,
    };

    // =========================
    // CARGAR SOLICITUDES
    // =========================

    const cargarSolicitudes = useCallback(async () => {
        setLoading(true);
        try {
            const usuarioGuardado = await AsyncStorage.getItem("usuario");
            if (!usuarioGuardado) return;

            const usuario = JSON.parse(usuarioGuardado);

            const q = query(
                collection(db, "solicitudes"),
                where("clienteId", "==", usuario.id)
            );

            const snapshot = await getDocs(q);
            const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setSolicitudes(lista);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarSolicitudes();
    }, [cargarSolicitudes]);

    // =========================
    // CANCELAR SOLICITUD
    // =========================

    const cancelarSolicitud = (solicitudId: string) => {
        Alert.alert(
            "Cancelar solicitud",
            "¿Estás seguro de que deseas cancelar esta solicitud?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, "solicitudes", solicitudId), {
                                estado: "cancelado",
                            });
                            // Actualizar localmente
                            setSolicitudes(prev =>
                                prev.map(s => s.id === solicitudId
                                    ? { ...s, estado: "cancelado" }
                                    : s
                                )
                            );
                            Alert.alert("Solicitud cancelada", "Tu solicitud fue cancelada.");
                        } catch (error) {
                            console.log(error);
                            Alert.alert("Error", "No se pudo cancelar la solicitud.");
                        }
                    }
                }
            ]
        );
    };

    // =========================
    // RENDER CARD
    // =========================

    const renderItem = ({ item }: any) => {
        const estado: EstadoSolicitud = item.estado;
        const colors = BADGE_COLORS[estado] ?? BADGE_COLORS.pendiente;
        const puedeCanselar = estado === "pendiente" || estado === "asignado";

        return (
            <View style={styles.card}>

                {/* HEADER */}
                <View style={styles.cardHeader}>
                    <View style={styles.iconServicio}>
                        <Ionicons name="construct-outline" size={22} color="#7C4DFF" />
                    </View>

                    <View style={styles.cardHeaderInfo}>
                        <Text style={styles.servicio} numberOfLines={1}>
                            {item.servicio}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                            <Ionicons name="time-outline" size={12} color={colors.text} />
                            <Text style={[styles.badgeText, { color: colors.text }]}>
                                {TAB_LABELS[estado]}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* FECHA Y HORA */}
                <View style={styles.filaDoble}>
                    <View style={styles.filaItem}>
                        <View style={styles.filaIconBox}>
                            <Ionicons name="calendar-outline" size={16} color="#7C4DFF" />
                        </View>
                        <View>
                            <Text style={styles.filaLabel}>Fecha</Text>
                            <Text style={styles.filaValue}>
                                {new Date(item.fechaServicio).toLocaleDateString("es-CO", {
                                    weekday: "long", day: "numeric", month: "long"
                                })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.filaItem}>
                        <View style={styles.filaIconBox}>
                            <Ionicons name="time-outline" size={16} color="#7C4DFF" />
                        </View>
                        <View>
                            <Text style={styles.filaLabel}>Hora</Text>
                            <Text style={styles.filaValue}>
                                {new Date(item.horaServicio).toLocaleTimeString([], {
                                    hour: "2-digit", minute: "2-digit"
                                })}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* PROFESIONAL */}
                <Pressable
                    style={styles.filaSimple}
                    onPress={() => {
                        if (item.profesionalNombre) {
                            router.push({
                                pathname: "/perfilProfesionalPublico",
                                params: { profesionalNombre: item.profesionalNombre },
                            });
                        }
                    }}
                >
                    <View style={styles.filaIconBox}>
                        <Ionicons name="person-outline" size={16} color="#7C4DFF" />
                    </View>
                    <View style={styles.filaSimpleInfo}>
                        <Text style={styles.filaLabel}>Profesional asignado</Text>
                        <Text style={[
                            styles.filaValue,
                            item.profesionalNombre && { color: "#7C4DFF" }
                        ]}>
                            {item.profesionalNombre ?? "Buscando profesional..."}
                        </Text>
                    </View>
                    {item.profesionalNombre && (
                        <Ionicons name="chevron-forward" size={16} color="#7C4DFF" />
                    )}
                </Pressable>

                <View style={styles.divider} />

                {/* MÉTODO DE PAGO */}
                <View style={styles.filaSimple}>
                    <View style={styles.filaIconBox}>
                        <Ionicons name="card-outline" size={16} color="#7C4DFF" />
                    </View>
                    <View>
                        <Text style={styles.filaLabel}>Método de pago</Text>
                        <Text style={styles.filaValue}>
                            {item.metodoPago ?? "Efectivo"}
                        </Text>
                    </View>
                </View>

                {/* BOTONES */}
                <View style={styles.botonesRow}>

                    <Pressable
                        style={styles.verDetallesButton}
                        onPress={() => router.push({
                            pathname: "/detallesSolicitud",
                            params: { id: item.id },
                        })}
                    >
                        <Text style={styles.verDetallesText}>Ver detalles</Text>
                    </Pressable>

                    {/* CANCELAR — solo en pendiente y asignado */}
                    {puedeCanselar && (
                        <Pressable
                            style={styles.cancelarButton}
                            onPress={() => cancelarSolicitud(item.id)}
                        >
                            <Text style={styles.cancelarText}>Cancelar</Text>
                        </Pressable>
                    )}

                </View>

            </View>
        );
    };

    // =========================
    // VISTA
    // =========================

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7C4DFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* TABS */}
            <View style={styles.tabsContainer}>
                {TABS.map(tab => {
                    const activa = tabActiva === tab;
                    return (
                        <Pressable
                            key={tab}
                            style={[styles.tab, activa && styles.tabActiva]}
                            onPress={() => setTabActiva(tab)}
                        >
                            <Text style={[styles.tabText, activa && styles.tabTextActiva]}>
                                {TAB_LABELS[tab]}
                            </Text>
                            {contadores[tab] > 0 && (
                                <View style={[
                                    styles.tabBadge,
                                    { backgroundColor: activa ? "#7C4DFF" : "#DDD" }
                                ]}>
                                    <Text style={[
                                        styles.tabBadgeText,
                                        { color: activa ? "#fff" : "#888" }
                                    ]}>
                                        {contadores[tab]}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>

            <FlatList
                data={solicitudesFiltradas}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No tienes solicitudes {TAB_LABELS[tabActiva].toLowerCase()}.
                        </Text>
                    </View>
                }
            />

        </View>
    );
}

// =========================
// ESTILOS
// =========================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F0FA",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
        gap: 3,
    },
    tabActiva: {
        borderBottomColor: "#7C4DFF",
    },
    tabText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#AAA",
    },
    tabTextActiva: {
        color: "#7C4DFF",
        fontWeight: "700",
    },
    tabBadge: {
        borderRadius: 20,
        paddingHorizontal: 5,
        paddingVertical: 1,
        minWidth: 16,
        alignItems: "center",
    },
    tabBadgeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 12,
    },
    iconServicio: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#F0EBFF",
        justifyContent: "center",
        alignItems: "center",
    },
    cardHeaderInfo: {
        flex: 1,
        gap: 6,
    },
    servicio: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1B2431",
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginHorizontal: 16,
    },
    filaDoble: {
        flexDirection: "row",
        padding: 16,
        gap: 16,
    },
    filaItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    filaSimple: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 10,
    },
    filaSimpleInfo: {
        flex: 1,
    },
    filaIconBox: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: "#F0EBFF",
        justifyContent: "center",
        alignItems: "center",
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
    botonesRow: {
        flexDirection: "row",
        gap: 10,
        margin: 16,
        marginTop: 12,
    },
    verDetallesButton: {
        flex: 1,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: "#F0EBFF",
    },
    verDetallesText: {
        color: "#7C4DFF",
        fontWeight: "700",
        fontSize: 14,
    },
    cancelarButton: {
        flex: 1,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: "#FEE2E2",
    },
    cancelarText: {
        color: "#C0392B",
        fontWeight: "700",
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyText: {
        color: "#AAA",
        fontSize: 15,
    },
});