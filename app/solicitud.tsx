import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    Alert,
    Image,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Solicitud() {
    const { servicio } = useLocalSearchParams();

    const [descripcion, setDescripcion] = useState("");

    const [fecha, setFecha] = useState(new Date());
    const [mostrarFecha, setMostrarFecha] = useState(false);

    const [hora, setHora] = useState(new Date());
    const [mostrarHora, setMostrarHora] = useState(false);

    const [fotos, setFotos] = useState<string[]>([]);

    const seleccionarFoto = async () => {
        if (fotos.length >= 2) {
            Alert.alert("Máximo 2 fotos");
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            allowsEditing: true,
        });

        if (!resultado.canceled) {
            setFotos([...fotos, resultado.assets[0].uri]);
        }
    };

    const publicarSolicitud = async () => {
        try {

            if (!descripcion.trim()) {
                Alert.alert("Error", "Describe el problema");
                return;
            }

            const usuarioGuardado = await AsyncStorage.getItem("usuario");

            if (!usuarioGuardado) {
                Alert.alert("Error", "No se encontró el usuario");
                return;
            }

            const usuario = JSON.parse(usuarioGuardado);

            await addDoc(collection(db, "solicitudes"), {
                clienteId: usuario.id,
                clienteNombre: usuario.usuario_nombre,
                telefono: usuario.numero_tel,

                servicio,
                categoria: servicio,
                descripcion,

                fechaServicio: fecha.toISOString(),
                horaServicio: hora.toISOString(),

                fotos,

                estado: "pendiente",

                profesionalId: null,
                profesionalNombre: null,

                fechaCreacion: new Date(),
            });

            Alert.alert(
                "Solicitud creada",
                "Tu solicitud fue publicada correctamente"
            );

        } catch (error) {
            console.log(error);
            Alert.alert(
                "Error",
                "No se pudo publicar la solicitud"
            );
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            <Text style={styles.servicioTitulo}>
                {servicio}
            </Text>

            {/* FECHA Y HORA */}

            <Text style={styles.sectionTitle}>
                Fecha y hora
            </Text>

            <View style={styles.row}>
                <Pressable
                    style={styles.card}
                    onPress={() => setMostrarFecha(true)}
                >
                    <View style={styles.iconBox}>
                        <Ionicons
                            name="calendar-outline"
                            size={20}
                            color="#7C4DFF"
                        />
                    </View>

                    <View>
                        <Text style={styles.label}>
                            Fecha
                        </Text>

                        <Text style={styles.value}>
                            {fecha.toLocaleDateString()}
                        </Text>
                    </View>
                </Pressable>

                <Pressable
                    style={styles.card}
                    onPress={() => setMostrarHora(true)}
                >
                    <View style={styles.iconBox}>
                        <Ionicons
                            name="time-outline"
                            size={20}
                            color="#7C4DFF"
                        />
                    </View>

                    <View>
                        <Text style={styles.label}>
                            Hora
                        </Text>

                        <Text style={styles.value}>
                            {hora.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                    </View>
                </Pressable>
            </View>

            {/* DESCRIPCIÓN */}

            <Text style={styles.sectionTitle}>
                Descripción del problema
            </Text>

            <TextInput
                style={styles.input}
                multiline
                maxLength={500}
                placeholder="Describe el servicio que necesitas..."
                value={descripcion}
                onChangeText={setDescripcion}
            />

            <Text style={styles.counter}>
                {descripcion.length}/500
            </Text>

            {/* FOTO */}

            <Text style={styles.sectionTitle}>
                Foto
            </Text>

            <Pressable
                style={styles.photoBox}
                onPress={seleccionarFoto}
            >
                <View style={styles.photoIcon}>
                    <Ionicons
                        name="image-outline"
                        size={30}
                        color="#7C4DFF"
                    />
                </View>

                <Text style={styles.photoTitle}>
                    Agregar foto
                </Text>

                <Text style={styles.photoSubtitle}>
                    Máx. 2 fotos
                </Text>
            </Pressable>

            {fotos.length > 0 && (
                <View style={styles.previewContainer}>
                    {fotos.map((foto, index) => (
                        <Image
                            key={index}
                            source={{ uri: foto }}
                            style={styles.preview}
                        />
                    ))}
                </View>
            )}

            {/* INFO */}

            <View style={styles.infoBox}>
                <View style={styles.infoHeader}>
                    <Ionicons
                        name="information-circle"
                        size={20}
                        color="#7C4DFF"
                    />

                    <Text style={styles.infoTitle}>
                        Respuesta en 24 horas
                    </Text>
                </View>

                <Text style={styles.infoText}>
                    Te asignaremos un profesional verificado con el precio final.
                    Recibirás notificación mediante la app.
                </Text>
            </View>

            {/* BOTÓN */}

            <Pressable
                style={styles.button}
                onPress={publicarSolicitud}
            >
                <Text style={styles.buttonText}>
                    Publicar solicitud
                </Text>
            </Pressable>

            {/* PICKERS */}

            {mostrarFecha && (
                <DateTimePicker
                    value={fecha}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setMostrarFecha(false);

                        if (selectedDate) {
                            setFecha(selectedDate);
                        }
                    }}
                />
            )}

            {mostrarHora && (
                <DateTimePicker
                    value={hora}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                        setMostrarHora(false);

                        if (selectedTime) {
                            setHora(selectedTime);
                        }
                    }}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F6FC",
        padding: 20,
    },

    servicioTitulo: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1B2431",
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1B2431",
        marginBottom: 12,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },

    card: {
        width: "48%",
        backgroundColor: "#FFF",
        borderRadius: 15,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
    },

    iconBox: {
        width: 40,
        height: 40,
        backgroundColor: "#EFE7FF",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },

    label: {
        color: "#999",
        fontSize: 12,
    },

    value: {
        color: "#555",
        fontSize: 15,
    },

    input: {
        minHeight: 130,
        backgroundColor: "#FFF",
        borderWidth: 2,
        borderColor: "#4183DE",
        borderRadius: 12,
        padding: 15,
        textAlignVertical: "top",
    },

    counter: {
        textAlign: "right",
        color: "#888",
        marginTop: 5,
        marginBottom: 25,
    },

    photoBox: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#B794F6",
        borderRadius: 15,
        height: 180,
        justifyContent: "center",
        alignItems: "center",
    },

    photoIcon: {
        width: 65,
        height: 65,
        borderRadius: 12,
        backgroundColor: "#EFE7FF",
        justifyContent: "center",
        alignItems: "center",
    },

    photoTitle: {
        marginTop: 10,
        color: "#7C4DFF",
        fontSize: 22,
        fontWeight: "600",
    },

    photoSubtitle: {
        color: "#777",
    },

    previewContainer: {
        flexDirection: "row",
        marginTop: 15,
        gap: 10,
        marginBottom: 20,
    },

    preview: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },

    infoBox: {
        backgroundColor: "#EFE7FF",
        borderRadius: 15,
        padding: 18,
        marginTop: 25,
    },

    infoHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    infoTitle: {
        fontWeight: "bold",
        marginLeft: 8,
        color: "#333",
    },

    infoText: {
        color: "#555",
        lineHeight: 22,
    },

    button: {
        backgroundColor: "#4183DE",
        height: 55,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
    },

    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});