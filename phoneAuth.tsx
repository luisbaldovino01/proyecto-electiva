import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { router } from "expo-router";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useRef, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { app, auth, db } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// TIPOS
// =========================

interface Usuario {
    id: string;
    usuario_nombre: string;
    numero_tel: string;
    rol: "cliente" | "admin";
    ciudad: string;
}

type Props = {
    mode: "login" | "registro";
}

export default function PhoneAuth({ mode }: Props) {

    const [telefono, setTelefono] = useState("");
    const [confirmar, setConfirmar] = useState<any>(null);
    const [codigo, setCodigo] = useState("");
    const recaptchaVerifier = useRef<any>(null);

    async function handleSignInWithPhoneNumber(telefono: string) {
        const confirmacion = await auth.signInWithPhoneNumber(
            `+57${telefono}`,
            recaptchaVerifier.current
        );
        console.log("OTP enviado");
        setConfirmar(confirmacion);
    }

    async function confirmarCodigo() {
        try {
            const resultado = await confirmar.confirm(codigo);
            console.log("Autenticado:", resultado.user.uid);

            if (mode === "registro") {
                await registrarCliente();
                router.push("/(tabs)/home");
                return;
            }

            // ── 1. Buscar en Usuarios (cliente / admin) ──
            const usuarioQuery = query(
                collection(db, "Usuarios"),
                where("numero_tel", "==", telefono)
            );
            const usuarioSnapshot = await getDocs(usuarioQuery);

            if (!usuarioSnapshot.empty) {
                const userDoc = usuarioSnapshot.docs[0];
                const userData = { id: userDoc.id, ...userDoc.data() } as Usuario; // ✅ cast correcto

                await AsyncStorage.setItem("usuario", JSON.stringify(userData));

                if (userData.rol === "admin") {
                    router.push("/administracion");
                    return;
                }

                router.push("/(tabs)/home");
                return;
            }

            // ── 2. Buscar en perfil_profesional ──
            const profesionalQuery = query(
                collection(db, "perfil_profesional"),
                where("numero", "==", telefono)
            );
            const profesionalSnapshot = await getDocs(profesionalQuery);

            if (!profesionalSnapshot.empty) {
                const profesionalData = profesionalSnapshot.docs[0].data();
                console.log("Profesional encontrado:", profesionalData);

                if (profesionalData.estadoValidacion === "aprobado") {
                    const profesionalParaGuardar = {
                        id: profesionalSnapshot.docs[0].id,
                        ...profesionalData,
                    };
                    await AsyncStorage.setItem("profesional", JSON.stringify(profesionalParaGuardar));
                    router.push("/(tabsProfesional)/homeProfesional");
                    return;
                }

                Alert.alert(
                    "Cuenta en revisión",
                    `Tu solicitud está ${profesionalData.estadoValidacion}. Te notificaremos cuando sea aprobada.`
                );
                return;
            }

            // ── 3. No existe en ninguna colección ──
            Alert.alert("Error", "Usuario no encontrado");

        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Código inválido. Intenta de nuevo.");
        }
    }

    const registrarCliente = async () => {
        try {
            const docRef = await addDoc(collection(db, "Usuarios"), {
                usuario_nombre: "Usuario Nuevo",
                numero_tel: telefono,
                rol: "cliente",
                ciudad: "Sincelejo",
            });

            const nuevoUsuario: Usuario = {
                id: docRef.id,
                usuario_nombre: "Usuario Nuevo",
                numero_tel: telefono,
                rol: "cliente",
                ciudad: "Sincelejo",
            };

            await AsyncStorage.setItem("usuario", JSON.stringify(nuevoUsuario));

            Alert.alert("¡Registrado!", "Usuario registrado con ID: " + docRef.id);

        } catch {
            Alert.alert("Error", "No se pudo registrar el número");
        }
    };

    const verificarNumero = async () => {
        if (!telefono || telefono.length < 7) {
            Alert.alert("Error", "Ingresa un número válido.");
            return;
        }

        try {
            const usuarioSnapshot = await getDocs(
                query(collection(db, "Usuarios"), where("numero_tel", "==", telefono))
            );

            const profesionalSnapshot = await getDocs(
                query(collection(db, "perfil_profesional"), where("numero", "==", telefono))
            );

            if (mode === "login" && usuarioSnapshot.empty && profesionalSnapshot.empty) {
                Alert.alert("Número no encontrado", "Este número no está registrado.");
                return;
            }

            await handleSignInWithPhoneNumber(telefono);

        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Ocurrió un problema. Intenta de nuevo.");
        }
    };

    return (
        <View style={styles.container}>

            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={app.options}
            />

            <Image source={require("./assets/vectors/vectorLogin.png")} style={{ position: "absolute", top: 0, width: "100%", height: 418 }} />

            {!confirmar ? (
                <>
                    <View style={{ paddingHorizontal: 20, top: "40%" }}>
                        <Text style={styles.welcomeText}>
                            {mode === "login" ? "Iniciar sesión" : "Regístrate"}
                        </Text>

                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Número telefónico"
                            placeholderTextColor="#C5C5C6"
                            value={telefono}
                            onChangeText={setTelefono}
                            maxLength={10}
                        />

                        <Pressable style={styles.button} onPress={verificarNumero}>
                            <Text style={styles.textButton}>Continuar</Text>
                        </Pressable>

                    </View>

                </>
            ) : (
                <>
                    <View style={{ paddingHorizontal: 20, top: "40%" }}>
                        <Text style={styles.titleSMS}>
                            Ingrese el código
                        </Text>

                        <Text style={styles.subtitleText}>
                            Enviado al +57 {telefono}
                        </Text>

                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Código de verificación"
                            value={codigo}
                            onChangeText={setCodigo}
                            maxLength={6}
                        />

                        <Pressable style={styles.button} onPress={confirmarCodigo}>
                            <Text style={styles.textButton}>Verificar código</Text>
                        </Pressable>

                        <Pressable onPress={() => setConfirmar(null)}>
                            <Text style={styles.linkText}>Cambiar número</Text>
                        </Pressable>
                    </View>

                </>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffff",
    },
    welcomeText: {
        color: "#424242",
        fontWeight: "bold",
        fontSize: 28,
    },
    subtitleText: {
        color: "#777777",
        marginTop: 12
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 18,
        width: "100%",
        marginVertical: 20,
        borderBottomWidth: 2,
        borderBottomColor: "#E0E0E0",
        color: "#333",
        fontWeight: "bold"
    },
    button: {
        backgroundColor: "#4184DE",
        height: 50,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginTop: 230,
        marginBottom: 10

    },
    textButton: {
        color: "#fff",
        fontWeight: "bold",
    },
    titleSMS: {
        fontSize: 20,
        fontWeight: "bold",
    },
    linkText: {
        color: "#4184DE",
        fontSize: 14,
        marginTop: 4,
        textAlign: "center"
    },
});