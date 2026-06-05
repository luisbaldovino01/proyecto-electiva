import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator,} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { router } from 'expo-router';

type EstadoValidacion = "pendiente" | "aprobado" | "rechazado";

interface Profesional {
    id: string;
    nombre: string;
    especialidad: string;
    fotoPerfil?: string;
    estadoValidacion: EstadoValidacion;
    fechaSolicitud?: string;
}

const BADGE_COLORS: Record<EstadoValidacion, { bg: string; text: string }> = {
    pendiente: { bg: "#FFF3DC", text: "#E09800" },
    aprobado: { bg: "#DCF5E8", text: "#1A7A3C" },
    rechazado: { bg: "#FFE0E0", text: "#C0392B" },
};

const TABS: EstadoValidacion[] = ["pendiente", "aprobado", "rechazado"];

const TAB_LABELS: Record<EstadoValidacion, string> = {
    pendiente: "Pendientes",
    aprobado: "Aprobados",
    rechazado: "Rechazados",
};

const AVATAR_FALLBACK = "https://i.pravatar.cc/300";

function CardProfesional({ item }: { item: Profesional }) {
    const colors = BADGE_COLORS[item.estadoValidacion] ?? BADGE_COLORS.pendiente;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: "/detalleProfesional",
                params: { id: item.id }
            })}
            activeOpacity={0.7}
        >
            {/* Borde izquierdo de color */}
            <View style={[styles.cardAccent, { backgroundColor: colors.text }]} />

            {/* Avatar */}
            <Image
                source={{ uri: item.fotoPerfil || AVATAR_FALLBACK }}
                style={styles.avatar}
            />

            {/* Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.nombre} numberOfLines={1}>
                    {item.nombre ?? "Sin nombre"}
                </Text>
                <Text style={styles.especialidad} numberOfLines={1}>
                    {item.especialidad ?? "Sin especialidad"}
                </Text>
                {item.fechaSolicitud ? (
                    <Text style={styles.fecha}>
                        Solicitado: {item.fechaSolicitud}
                    </Text>
                ) : null}
            </View>

            {/* Badge + flecha */}
            <View style={styles.rightSection}>
                <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                        {TAB_LABELS[item.estadoValidacion]}
                    </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
            </View>
        </TouchableOpacity>
    );
}


export default function Administracion() {

    const [profesionales, setProfesionales] = useState<Profesional[]>([]);
    const [tabActiva, setTabActiva] = useState<EstadoValidacion>("pendiente");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const contadores: Record<EstadoValidacion, number> = {
        pendiente: profesionales.filter(p => p.estadoValidacion === "pendiente").length,
        aprobado: profesionales.filter(p => p.estadoValidacion === "aprobado").length,
        rechazado: profesionales.filter(p => p.estadoValidacion === "rechazado").length,
    };

    const listaFiltrada = profesionales.filter(p => p.estadoValidacion === tabActiva);

    const obtenerInformacion = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const querySnapshot = await getDocs(collection(db, "perfil_profesional"));
            const lista: Profesional[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Profesional, "id">),
            }));
            setProfesionales(lista);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la información.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        obtenerInformacion();
    }, [obtenerInformacion]);

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#E09800" />
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={obtenerInformacion}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (listaFiltrada.length === 0) {
            return (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>
                        No hay profesionales {TAB_LABELS[tabActiva].toLowerCase()}.
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={listaFiltrada}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => <CardProfesional item={item} />}
            />
        );
    };

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>Panel Admin</Text>
                <Text style={styles.subtitle}>Validación de profesionales</Text>
            </View>

            {/* TABS */}
            <View style={styles.tabsContainer}>
                {TABS.map(tab => {
                    const activa = tabActiva === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activa && styles.tabActiva]}
                            onPress={() => setTabActiva(tab)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabText, activa && styles.tabTextActiva]}>
                                {TAB_LABELS[tab]}
                            </Text>
                            {contadores[tab] > 0 && (
                                <View style={[
                                    styles.tabBadge,
                                    activa ? styles.tabBadgeActiva : styles.tabBadgeInactiva
                                ]}>
                                    <Text style={[
                                        styles.tabBadgeText,
                                        activa ? styles.tabBadgeTextActiva : styles.tabBadgeTextInactiva
                                    ]}>
                                        {contadores[tab]}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
            {renderContent()}

        </View>
    );
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        paddingTop: 60,
        paddingHorizontal: 20,
    },

    header: {
        marginBottom: 24,
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#111",
    },

    subtitle: {
        marginTop: 4,
        color: "#888",
        fontSize: 15,
    },

    // --- Tabs ---

    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#EFEFEF",
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
        gap: 6,
    },

    tabActiva: {
        backgroundColor: "#1E2A3A",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    tabText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#888",
    },

    tabTextActiva: {
        color: "#fff",
        fontWeight: "700",
    },

    tabBadge: {
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 1,
        minWidth: 20,
        alignItems: "center",
    },

    tabBadgeActiva: {
        backgroundColor: "#E09800",
    },

    tabBadgeInactiva: {
        backgroundColor: "#DDD",
    },

    tabBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },

    tabBadgeTextActiva: {
        color: "#fff",
    },

    tabBadgeTextInactiva: {
        color: "#888",
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 12,
        padding: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },

    cardAccent: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
        marginLeft: 8,
        backgroundColor: "#eee",
    },

    infoContainer: {
        flex: 1,
        marginLeft: 14,
    },

    nombre: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111",
    },

    especialidad: {
        marginTop: 2,
        color: "#666",
        fontSize: 14,
    },

    fecha: {
        marginTop: 4,
        color: "#AAA",
        fontSize: 12,
    },

    rightSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },

    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },

    arrow: {
        fontSize: 22,
        color: "#CCC",
        marginLeft: 2,
    },

    // --- Estados ---

    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 60,
    },

    loadingText: {
        marginTop: 12,
        color: "#999",
        fontSize: 14,
    },

    errorText: {
        color: "#C0392B",
        fontSize: 15,
        textAlign: "center",
        marginBottom: 16,
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

    emptyText: {
        color: "#AAA",
        fontSize: 15,
    },

});