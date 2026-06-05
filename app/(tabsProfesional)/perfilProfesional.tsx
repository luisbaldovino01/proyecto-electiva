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
// PANTALLA
// =========================

export default function PerfilProfesional() {

    const [profesional, setProfesional] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Campos editables
    const [nombre, setNombre] = useState("");
    const [numero, setNumero] = useState("");
    const [tipoDocumento, setTipoDocumento] = useState("");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [direccion, setDireccion] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [descripcion, setDescripcion] = useState("");

    // =========================
    // CARGAR DATOS
    // =========================

    const cargarProfesional = useCallback(async () => {
        try {
            const profesionalGuardado = await AsyncStorage.getItem("profesional");
            if (!profesionalGuardado) return;

            const data = JSON.parse(profesionalGuardado);
            setProfesional(data);

            setNombre(data.nombre ?? "");
            setNumero(data.numero ?? "");
            setTipoDocumento(data.tipoDocumento ?? "");
            setNumeroDocumento(data.numeroDocumento ?? "");
            setFechaNacimiento(data.fechaNacimiento ?? "");
            setDireccion(data.direccion ?? "");
            setExperiencia(String(data.experiencia ?? ""));
            setDescripcion(data.descripcion ?? "");

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarProfesional();
    }, [cargarProfesional]);

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
            await updateDoc(doc(db, "perfil_profesional", profesional.id), {
                nombre: nombre.trim(),
                numero: numero.trim(),
                tipoDocumento: tipoDocumento.trim(),
                numeroDocumento: numeroDocumento.trim(),
                fechaNacimiento: fechaNacimiento.trim(),
                direccion: direccion.trim(),
                experiencia: Number(experiencia),
                descripcion: descripcion.trim(),
            });

            // Actualizar AsyncStorage
            const actualizado = {
                ...profesional,
                nombre: nombre.trim(),
                numero: numero.trim(),
                tipoDocumento: tipoDocumento.trim(),
                numeroDocumento: numeroDocumento.trim(),
                fechaNacimiento: fechaNacimiento.trim(),
                direccion: direccion.trim(),
                experiencia: Number(experiencia),
                descripcion: descripcion.trim(),
            };
            await AsyncStorage.setItem("profesional", JSON.stringify(actualizado));
            setProfesional(actualizado);

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
            {/* HEADER */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={48} color="#4183DE" />
                </View>
                <Text style={styles.nombreHeader}>{profesional?.nombre}</Text>
                <View style={styles.especialidadBadge}>
                    <Text style={styles.especialidadText}>{profesional?.especialidad}</Text>
                </View>
            </View>

            {/* SECCIÓN: DATOS PERSONALES */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Datos personales</Text>

                <CampoTexto label="Nombre completo" icono="person-outline"
                    value={nombre} onChange={setNombre} />

                <CampoTexto label="Teléfono" icono="call-outline"
                    value={numero} onChange={setNumero} keyboardType="numeric" />

                <CampoTexto label="Tipo de documento" icono="card-outline"
                    value={tipoDocumento} onChange={setTipoDocumento} />

                <CampoTexto label="Número de documento" icono="document-outline"
                    value={numeroDocumento} onChange={setNumeroDocumento} keyboardType="numeric" />

                <CampoTexto label="Fecha de nacimiento" icono="calendar-outline"
                    value={fechaNacimiento} onChange={setFechaNacimiento}
                    placeholder="DD/MM/AAAA" />

                <CampoTexto label="Dirección" icono="location-outline"
                    value={direccion} onChange={setDireccion} />
            </View>

            {/* SECCIÓN: ESPECIALIDAD */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Especialidad</Text>

                {/* Especialidad — no editable */}
                <Text style={styles.fieldLabel}>Especialidad</Text>
                <View style={styles.inputContainerDisabled}>
                    <Ionicons name="construct-outline" size={18} color="#CCC" style={styles.inputIcon} />
                    <Text style={styles.inputDisabled}>{profesional?.especialidad}</Text>
                    <Ionicons name="lock-closed-outline" size={14} color="#CCC" />
                </View>
                <Text style={styles.lockNote}>La especialidad no puede modificarse.</Text>

                <CampoTexto label="Años de experiencia" icono="briefcase-outline"
                    value={experiencia} onChange={setExperiencia} keyboardType="numeric" />

                <Text style={styles.fieldLabel}>Descripción</Text>
                <View style={[styles.inputContainer, { alignItems: "flex-start", paddingTop: 10 }]}>
                    <Ionicons name="reader-outline" size={18} color="#888"
                        style={[styles.inputIcon, { marginTop: 2 }]} />
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                        value={descripcion}
                        onChangeText={setDescripcion}
                        multiline
                        maxLength={300}
                        placeholder="Describe tu experiencia..."
                        placeholderTextColor="#CCC"
                    />
                </View>
                <Text style={styles.counter}>{descripcion.length}/300</Text>
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
// COMPONENTE CAMPO
// =========================

function CampoTexto({
    label, icono, value, onChange, keyboardType = "default", placeholder
}: {
    label: string;
    icono: any;
    value: string;
    onChange: (v: string) => void;
    keyboardType?: any;
    placeholder?: string;
}) {
    return (
        <>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                <Ionicons name={icono} size={18} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder ?? label}
                    placeholderTextColor="#CCC"
                    keyboardType={keyboardType}
                />
            </View>
        </>
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
    especialidadBadge: {
        marginTop: 8,
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
    },
    especialidadText: {
        color: "#4183DE",
        fontWeight: "600",
        fontSize: 13,
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
        color: "#4183DE",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 16,
    },
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
    inputContainerDisabled: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        height: 46,
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
    inputDisabled: {
        flex: 1,
        fontSize: 14,
        color: "#AAA",
    },
    lockNote: {
        fontSize: 11,
        color: "#BBB",
        marginTop: 4,
        marginLeft: 4,
        fontStyle: "italic",
    },
    counter: {
        textAlign: "right",
        color: "#AAA",
        fontSize: 12,
        marginTop: 4,
    },
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