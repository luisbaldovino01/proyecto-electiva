import { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    Alert,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

// =========================
// OPCIONES DE GÉNERO
// =========================

const GENEROS = ["Masculino", "Femenino", "Otro", "Prefiero no decir"];

// =========================
// PANTALLA
// =========================

export default function PerfilCliente() {

    const [usuario, setUsuario] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Campos editables
    const [nombre, setNombre] = useState("");
    const [genero, setGenero] = useState("");
    const [correo, setCorreo] = useState("");

    // =========================
    // CARGAR DATOS
    // =========================

    const cargarUsuario = useCallback(async () => {
        try {
            const usuarioGuardado = await AsyncStorage.getItem("usuario");
            if (!usuarioGuardado) return;

            const data = JSON.parse(usuarioGuardado);
            setUsuario(data);
            setNombre(data.usuario_nombre ?? "");
            setGenero(data.genero ?? "");
            setCorreo(data.correo ?? "");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarUsuario();
    }, [cargarUsuario]);

    // =========================
    // GUARDAR CAMBIOS
    // =========================

    const guardarCambios = async () => {
        if (!nombre.trim()) {
            Alert.alert("Error", "El nombre no puede estar vacío.");
            return;
        }

        setGuardando(true);
        try {
            await updateDoc(doc(db, "Usuarios", usuario.id), {
                usuario_nombre: nombre.trim(),
                genero,
                correo: correo.trim(),
            });

            // Actualizar AsyncStorage
            const actualizado = {
                ...usuario,
                usuario_nombre: nombre.trim(),
                genero,
                correo: correo.trim(),
            };
            await AsyncStorage.setItem("usuario", JSON.stringify(actualizado));
            setUsuario(actualizado);

            Alert.alert("¡Listo!", "Perfil actualizado correctamente.");
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudo actualizar el perfil.");
        } finally {
            setGuardando(false);
        }
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
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* AVATAR */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={48} color="#4183DE" />
                </View>
                <Text style={styles.nombreHeader}>{usuario?.usuario_nombre}</Text>
                <Text style={styles.rolHeader}>Cliente</Text>
            </View>

            {/* SECCIÓN: INFORMACIÓN PERSONAL */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Información personal</Text>

                {/* NOMBRE */}
                <Text style={styles.fieldLabel}>Nombre completo</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={18} color="#888" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Tu nombre completo"
                        placeholderTextColor="#CCC"
                    />
                </View>

                {/* CORREO */}
                <Text style={styles.fieldLabel}>Correo electrónico</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={18} color="#888" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        value={correo}
                        onChangeText={setCorreo}
                        placeholder="tucorreo@email.com"
                        placeholderTextColor="#CCC"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* GÉNERO */}
                <Text style={styles.fieldLabel}>Género</Text>
                <View style={styles.generosGrid}>
                    {GENEROS.map(g => (
                        <Pressable
                            key={g}
                            style={[
                                styles.generoOption,
                                genero === g && styles.generoOptionActivo,
                            ]}
                            onPress={() => setGenero(g)}
                        >
                            <Text style={[
                                styles.generoText,
                                genero === g && styles.generoTextActivo,
                            ]}>
                                {g}
                            </Text>
                        </Pressable>
                    ))}
                </View>

            </View>

            {/* SECCIÓN: INFO NO EDITABLE */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Cuenta</Text>

                <View style={styles.filaInfo}>
                    <Ionicons name="call-outline" size={16} color="#888" />
                    <View style={styles.filaInfoTexto}>
                        <Text style={styles.filaLabel}>Teléfono</Text>
                        <Text style={styles.filaValue}>{usuario?.numero_tel ?? "—"}</Text>
                    </View>
                </View>

                <View style={styles.filaInfo}>
                    <Ionicons name="location-outline" size={16} color="#888" />
                    <View style={styles.filaInfoTexto}>
                        <Text style={styles.filaLabel}>Ciudad</Text>
                        <Text style={styles.filaValue}>{usuario?.ciudad ?? "—"}</Text>
                    </View>
                </View>
            </View>

            {/* BOTÓN GUARDAR */}
            <Pressable
                style={[styles.button, guardando && styles.buttonDisabled]}
                onPress={guardarCambios}
                disabled={guardando}
            >
                {guardando
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Guardar cambios</Text>
                }
            </Pressable>

        </ScrollView>
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
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 60,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    // --- Avatar ---
    avatarSection: {
        alignItems: "center",
        marginBottom: 28,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#E8F0FE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    nombreHeader: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1B2431",
    },
    rolHeader: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
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
        color: "#4183DE",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 16,
    },

    // --- Campos ---
    fieldLabel: {
        fontSize: 13,
        color: "#888",
        marginBottom: 6,
        marginTop: 12,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F7FB",
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 46,
        fontSize: 14,
        color: "#1B2431",
    },

    // --- Género ---
    generosGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 4,
    },
    generoOption: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        backgroundColor: "#F5F7FB",
    },
    generoOptionActivo: {
        borderColor: "#4183DE",
        backgroundColor: "#EFF6FF",
    },
    generoText: {
        fontSize: 13,
        color: "#888",
        fontWeight: "500",
    },
    generoTextActivo: {
        color: "#4183DE",
        fontWeight: "700",
    },

    // --- Filas info no editable ---
    filaInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    filaInfoTexto: {
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

    // --- Botón ---
    button: {
        backgroundColor: "#4183DE",
        height: 52,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
    },
});