import { useEffect, useState, useCallback } from "react";
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
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { router } from "expo-router";

// =========================
// CONSTANTES
// =========================

type EstadoTrabajo = "asignado" | "progreso" | "completado";

const ESTADO_COLORS: Record<EstadoTrabajo, { bg: string; text: string }> = {
    asignado: { bg: "#EFF6FF", text: "#2563EB" },
    progreso: { bg: "#FFF7ED", text: "#EA580C" },
    completado: { bg: "#F0FDF4", text: "#16A34A" },
};

const SIGUIENTE_ESTADO: Record<string, EstadoTrabajo | null> = {
    asignado: "progreso",
    progreso: "completado",
    completado: null,
};

const LABEL_BOTON: Record<string, string> = {
    asignado: "Iniciar trabajo",
    progreso: "Marcar completado",
};

const TABS: EstadoTrabajo[] = ["asignado", "progreso", "completado"];

const TAB_LABELS: Record<EstadoTrabajo, string> = {
    asignado: "Pendientes",
    progreso: "En progreso",
    completado: "Completados",
};

// =========================
// PANTALLA
// =========================

export default function MisTrabajos() {

    const [trabajos, setTrabajos] = useState<any[]>([]);
    const [profesional, setProfesional] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tabActiva, setTabActiva] = useState<EstadoTrabajo>("asignado");

    const trabajosFiltrados = trabajos.filter(t => t.estado === tabActiva);

    const contadores: Record<EstadoTrabajo, number> = {
        asignado: trabajos.filter(t => t.estado === "asignado").length,
        progreso: trabajos.filter(t => t.estado === "progreso").length,
        completado: trabajos.filter(t => t.estado === "completado").length,
    };

    // =========================
    // CARGAR TRABAJOS DEL PROFESIONAL
    // =========================

    const cargarTrabajos = useCallback(async () => {
        setLoading(true);
        try {
            const profesionalGuardado = await AsyncStorage.getItem("profesional");

            if (!profesionalGuardado) {
                Alert.alert("Error", "No se encontró el profesional");
                return;
            }

            const profesionalData = JSON.parse(profesionalGuardado);
            setProfesional(profesionalData);

            // Trae todos los trabajos que el profesional aceptó
            const q = query(
                collection(db, "solicitudes"),
                where("profesionalId", "==", profesionalData.id),
            );

            const snapshot = await getDocs(q);
            const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setTrabajos(lista);

        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudieron cargar los trabajos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarTrabajos();
    }, [cargarTrabajos]);

    // =========================
    // CAMBIAR ESTADO
    // =========================

    const cambiarEstado = async (trabajoId: string, estadoActual: string) => {
        const nuevoEstado = SIGUIENTE_ESTADO[estadoActual];
        if (!nuevoEstado) return;

        try {
            await updateDoc(doc(db, "solicitudes", trabajoId), {
                estado: nuevoEstado,
            });

            // Actualizar localmente sin recargar todo
            setTrabajos(prev =>
                prev.map(t => t.id === trabajoId ? { ...t, estado: nuevoEstado } : t)
            );

            Alert.alert(
                "Estado actualizado",
                `El trabajo pasó a: ${TAB_LABELS[nuevoEstado]}`
            );

        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudo actualizar el estado");
        }
    };

    // =========================
    // CANCELAR TRABAJO
    // =========================

    const cancelarTrabajo = (trabajoId: string) => {
        Alert.alert(
            "Cancelar trabajo",
            "¿Estás seguro? La solicitud volverá a estar disponible para otros profesionales.",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, "solicitudes", trabajoId), {
                                estado: "pendiente",
                                profesionalId: null,
                                profesionalNombre: null,
                            });
                            setTrabajos(prev => prev.filter(t => t.id !== trabajoId));
                            Alert.alert("Trabajo cancelado", "El trabajo fue liberado correctamente.");
                        } catch (error) {
                            console.log(error);
                            Alert.alert("Error", "No se pudo cancelar el trabajo.");
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
        const estado: EstadoTrabajo = item.estado;
        const colors = ESTADO_COLORS[estado] ?? ESTADO_COLORS.asignado;
        const labelBoton = LABEL_BOTON[estado];

        return (
            <View style={styles.card}>

                <View style={[styles.cardAccent, { backgroundColor: colors.text }]} />

                <View style={styles.cardContent}>

                    <View style={styles.cardHeader}>
                        <Text style={styles.servicio} numberOfLines={1}>
                            {item.servicio}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                            <Text style={[styles.badgeText, { color: colors.text }]}>
                                {TAB_LABELS[estado]}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.descripcion} numberOfLines={2}>
                        {item.descripcion}
                    </Text>

                    <Text style={styles.info}>👤 {item.clienteNombre}</Text>
                    <Text style={styles.info}>📞 {item.telefono}</Text>
                    <Text style={styles.info}>
                        📅 {new Date(item.fechaServicio).toLocaleDateString("es-CO", {
                            day: "2-digit", month: "short", year: "numeric"
                        })}
                    </Text>

                    <View style={styles.botonesRow}>

                        <Pressable
                            style={styles.buttonSecondary}
                            onPress={() => router.push({
                                pathname: "/detallesSolicitud",
                                params: { id: item.id },
                            })}
                        >
                            <Text style={styles.buttonSecondaryText}>Ver detalles</Text>
                        </Pressable>

                        {labelBoton && (
                            <Pressable
                                style={[styles.buttonPrimary, { backgroundColor: colors.text }]}
                                onPress={() => cambiarEstado(item.id, estado)}
                            >
                                <Text style={styles.buttonPrimaryText}>{labelBoton}</Text>
                            </Pressable>
                        )}

                        {/* CANCELAR — solo en asignado */}
                        {estado === "asignado" && (
                            <Pressable
                                style={styles.buttonCancelar}
                                onPress={() => cancelarTrabajo(item.id)}
                            >
                                <Text style={styles.buttonCancelarText}>Cancelar</Text>
                            </Pressable>
                        )}

                    </View>
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
                <ActivityIndicator size="large" color="#4183DE" />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Mis trabajos</Text>
            <Text style={styles.subtitle}>{profesional?.especialidad}</Text>

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
                                    { backgroundColor: activa ? "#fff" : "#DDD" }
                                ]}>
                                    <Text style={[
                                        styles.tabBadgeText,
                                        { color: activa ? "#4183DE" : "#888" }
                                    ]}>
                                        {contadores[tab]}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {/* LISTA */}
            <FlatList
                data={trabajosFiltrados}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No tienes trabajos {TAB_LABELS[tabActiva].toLowerCase()}.
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
        backgroundColor: "#F5F7FB",
        paddingTop: 60,
        paddingHorizontal: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#1B2431",
        marginBottom: 4,
    },
    subtitle: {
        color: "#888",
        fontSize: 14,
        marginBottom: 20,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#EBEBEB",
        borderRadius: 30,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 9,
        borderRadius: 26,
        gap: 5,
    },
    tabActiva: {
        backgroundColor: "#4183DE",
    },
    tabText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#888",
    },
    tabTextActiva: {
        color: "#fff",
        fontWeight: "700",
    },
    tabBadge: {
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 1,
        minWidth: 18,
        alignItems: "center",
    },
    tabBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 14,
        marginBottom: 14,
        flexDirection: "row",
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    cardAccent: {
        width: 5,
    },
    cardContent: {
        flex: 1,
        padding: 15,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    servicio: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#1B2431",
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "capitalize",
    },
    descripcion: {
        color: "#666",
        fontSize: 13,
        marginBottom: 10,
        lineHeight: 18,
    },
    info: {
        color: "#888",
        fontSize: 13,
        marginBottom: 3,
    },
    botonesRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    buttonSecondary: {
        flex: 1,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#4183DE",
    },
    buttonSecondaryText: {
        color: "#4183DE",
        fontWeight: "600",
        fontSize: 13,
    },
    buttonPrimary: {
        flex: 1,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    buttonPrimaryText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 13,
    },
    buttonCancelar: {
        flex: 1,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        backgroundColor: "#FEE2E2",
    },
    buttonCancelarText: {
        color: "#C0392B",
        fontWeight: "600",
        fontSize: 13,
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