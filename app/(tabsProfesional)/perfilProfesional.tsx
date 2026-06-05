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
import { doc, collection, getDocs, query, where, writeBatch } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function PerfilProfesional() {

    const [profesional, setProfesional] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [nombre, setNombre] = useState("");
    const [numero, setNumero] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [mostrarFecha, setMostrarFecha] = useState(false);
    const [direccion, setDireccion] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const cargarProfesional = useCallback(async () => {
        try {
            const profesionalGuardado = await AsyncStorage.getItem("profesional");
            if (!profesionalGuardado) return;

            const data = JSON.parse(profesionalGuardado);
            setProfesional(data);
            setNombre(data.nombre ?? "");
            setNumero(data.numero ?? "");
            setDireccion(data.direccion ?? "");
            setExperiencia(String(data.experiencia ?? ""));
            setDescripcion(data.descripcion ?? "");

            if (data.fechaNacimiento?.seconds) {
                setFechaNacimiento(new Date(data.fechaNacimiento.seconds * 1000));
            } else if (data.fechaNacimiento) {
                const parsed = new Date(data.fechaNacimiento);
                if (!isNaN(parsed.getTime())) setFechaNacimiento(parsed);
            }
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
            const batch = writeBatch(db);

            batch.update(doc(db, "perfil_profesional", profesional.id), {
                nombre: nombre.trim(),
                numero: numero.trim(),
                fechaNacimiento: fechaNacimiento.toISOString(),
                direccion: direccion.trim(),
                experiencia: Number(experiencia),
                descripcion: descripcion.trim(),
            });

            const solicitudesSnap = await getDocs(
                query(collection(db, "solicitudes"), where("profesionalId", "==", profesional.id))
            );
            solicitudesSnap.forEach(solicitudDoc => {
                batch.update(doc(db, "solicitudes", solicitudDoc.id), {
                    profesionalNombre: nombre.trim(),
                });
            });

            await batch.commit();

            const actualizado = {
                ...profesional,
                nombre: nombre.trim(),
                numero: numero.trim(),
                fechaNacimiento: fechaNacimiento.toISOString(),
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
    // CERRAR SESIÓN
    // =========================

    const cerrarSesion = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro de que deseas cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await auth.signOut();
                            await AsyncStorage.removeItem("profesional");
                            router.replace("/login");
                        } catch (error) {
                            console.log(error);
                            Alert.alert("Error", "No se pudo cerrar sesión.");
                        }
                    }
                }
            ]
        );
    };

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

            {/* DATOS PERSONALES */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Datos personales</Text>

                <CampoTexto label="Nombre completo" icono="person-outline"
                    value={nombre} onChange={setNombre} />

                <CampoTexto label="Teléfono" icono="call-outline"
                    value={numero} onChange={setNumero} keyboardType="numeric" />

                <Text style={styles.fieldLabel}>Fecha de nacimiento</Text>
                <Pressable style={styles.inputContainer} onPress={() => setMostrarFecha(true)}>
                    <Ionicons name="calendar-outline" size={18} color="#888" style={styles.inputIcon} />
                    <Text style={styles.inputFecha}>
                        {fechaNacimiento.toLocaleDateString("es-CO", {
                            day: "2-digit", month: "long", year: "numeric"
                        })}
                    </Text>
                </Pressable>

                {mostrarFecha && (
                    <DateTimePicker
                        value={fechaNacimiento}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setMostrarFecha(false);
                            if (selectedDate) setFechaNacimiento(selectedDate);
                        }}
                    />
                )}

                <CampoTexto label="Dirección" icono="location-outline"
                    value={direccion} onChange={setDireccion} />

                <Text style={styles.fieldLabel}>Tipo de documento</Text>
                <CampoNoEditable icono="card-outline" value={profesional?.tipoDocumento} />

                <Text style={styles.fieldLabel}>Número de documento</Text>
                <CampoNoEditable icono="document-outline" value={profesional?.numeroDocumento} />
            </View>

            {/* ESPECIALIDAD */}
            <View style={styles.seccion}>
                <Text style={styles.seccionTitulo}>Especialidad</Text>

                <Text style={styles.fieldLabel}>Especialidad</Text>
                <CampoNoEditable icono="construct-outline" value={profesional?.especialidad} />
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

            {/* BOTÓN CERRAR SESIÓN */}
            <Pressable style={styles.buttonCerrarSesion} onPress={cerrarSesion}>
                <Ionicons name="log-out-outline" size={18} color="#C0392B" />
                <Text style={styles.buttonCerrarSesionText}>Cerrar sesión</Text>
            </Pressable>

        </ScrollView>
    );
}

function CampoTexto({ label, icono, value, onChange, keyboardType = "default", placeholder }: {
    label: string; icono: any; value: string;
    onChange: (v: string) => void; keyboardType?: any; placeholder?: string;
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

function CampoNoEditable({ icono, value }: { icono: any; value?: string }) {
    return (
        <View style={styles.inputContainerDisabled}>
            <Ionicons name={icono} size={18} color="#CCC" style={styles.inputIcon} />
            <Text style={styles.inputDisabled}>{value ?? "—"}</Text>
            <Ionicons name="lock-closed-outline" size={14} color="#CCC" />
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: "#F5F7FB" },
    container: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 60 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    avatarSection: { alignItems: "center", marginBottom: 28 },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: "#E8F0FE", justifyContent: "center",
        alignItems: "center", marginBottom: 12,
    },
    nombreHeader: { fontSize: 22, fontWeight: "bold", color: "#1B2431" },
    especialidadBadge: {
        marginTop: 8, backgroundColor: "#EFF6FF",
        paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
    },
    especialidadText: { color: "#4183DE", fontWeight: "600", fontSize: 13 },
    seccion: {
        backgroundColor: "#FFF", borderRadius: 16, padding: 18,
        marginBottom: 16, elevation: 1, shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
    },
    seccionTitulo: {
        fontSize: 13, fontWeight: "700", color: "#4183DE",
        textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16,
    },
    fieldLabel: { fontSize: 13, color: "#888", marginBottom: 6, marginTop: 12 },
    inputContainer: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FB",
        borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E5E7EB",
    },
    inputContainerDisabled: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#F0F0F0",
        borderRadius: 10, paddingHorizontal: 12, borderWidth: 1,
        borderColor: "#E5E7EB", height: 46,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, height: 46, fontSize: 14, color: "#1B2431" },
    inputFecha: { flex: 1, height: 46, fontSize: 14, color: "#1B2431", lineHeight: 46 },
    inputDisabled: { flex: 1, fontSize: 14, color: "#AAA" },
    lockNote: { fontSize: 11, color: "#BBB", marginTop: 4, marginLeft: 4, fontStyle: "italic" },
    counter: { textAlign: "right", color: "#AAA", fontSize: 12, marginTop: 4 },
    button: {
        backgroundColor: "#4183DE", height: 52, borderRadius: 14,
        justifyContent: "center", alignItems: "center", marginTop: 8,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
    buttonCerrarSesion: {
        height: 52, borderRadius: 14, justifyContent: "center",
        alignItems: "center", marginTop: 12, borderWidth: 1.5,
        borderColor: "#C0392B", flexDirection: "row", gap: 8,
    },
    buttonCerrarSesionText: { color: "#C0392B", fontWeight: "700", fontSize: 16 },
});