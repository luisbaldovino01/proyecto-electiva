import React, { useState } from 'react';
import { StyleSheet, View, Alert, Text } from 'react-native';
import { ProgressStep, ProgressSteps } from 'react-native-progress-steps';

import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

import DatosPersonales from "../components/registroProfesional/datosPersonales";
import Especialidades from "../components/registroProfesional/especialidades";
import Identificacion from "../components/registroProfesional/identificacion";
import Validacion from "../components/registroProfesional/validacion";

export default function RegistroProfesional() {

    // =========================
    // DATOS PERSONALES
    // =========================

    const [nombre, setNombre] = useState("");
    const [numero, setNumero] = useState("")
    const [tipoDocumento, setTipoDocumento] = useState("");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [direccion, setDireccion] = useState("");

    // =========================
    // ESPECIALIDADES
    // =========================

    const [especialidad, setEspecialidad] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [descripcion, setDescripcion] = useState("");

    // =========================
    // IDENTIFICACION
    // =========================

    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [cedulaFrontal, setCedulaFrontal] = useState(null);
    const [cedulaTrasera, setCedulaTrasera] = useState(null);
    const [certificado, setCertificado] = useState(null);

    // =========================
    // ERRORES
    // =========================

    const [erroresDatos, setErroresDatos] = useState(false);
    const [erroresEspecialidades, setErroresEspecialidades] = useState(false);
    const [erroresIdentificacion, setErroresIdentificacion] = useState(false);

    // =========================
    // VALIDAR DATOS PERSONALES
    // =========================

    const validarDatosPersonales = () => {

        const hayErrores =
            !nombre ||
            !numero ||
            !tipoDocumento ||
            !numeroDocumento ||
            !fechaNacimiento ||
            !direccion;

        setErroresDatos(hayErrores);

        if (hayErrores) {
            Alert.alert(
                "Error",
                "Complete los datos personales"
            );
        }

        return hayErrores;
    };

    // =========================
    // VALIDAR ESPECIALIDADES
    // =========================

    const validarEspecialidades = () => {

        const hayErrores =
            !especialidad ||
            !experiencia ||
            !descripcion;

        setErroresEspecialidades(hayErrores);

        if (hayErrores) {
            Alert.alert(
                "Error",
                "Complete las especialidades"
            );
        }

        return hayErrores;
    };

    // =========================
    // VALIDAR IDENTIFICACION
    // =========================

    const validarIdentificacion = () => {

        const hayErrores =
            !fotoPerfil ||
            !cedulaFrontal ||
            !cedulaTrasera ||
            !certificado;

        setErroresIdentificacion(hayErrores);

        if (hayErrores) {
            Alert.alert(
                "Error",
                "Complete los documentos"
            );
        }

        return hayErrores;
    };

    // =========================
    // GUARDAR PROFESIONAL
    // =========================

    const guardarProfesional = async () => {

        try {

            await addDoc(
                collection(db, "perfil_profesional"),
                {

                    // DATOS PERSONALES
                    nombre,
                    numero,
                    tipoDocumento,
                    numeroDocumento,
                    fechaNacimiento,
                    direccion,

                    // ESPECIALIDADES
                    especialidad,
                    experiencia,
                    descripcion,

                    // DOCUMENTOS
                    fotoPerfil,
                    cedulaFrontal,
                    cedulaTrasera,
                    certificado,

                    // ESTADO
                    estadoValidacion: "pendiente",

                    // FECHA
                    createdAt: new Date(),
                }
            );

            Alert.alert(
                "Éxito",
                "Solicitud enviada correctamente"
            );

        } catch (error) {

            console.log(error);

            Alert.alert(
                "Error",
                "No se pudo guardar la información"
            );
        }
    };

    return (
        <View style={styles.container}>

            <ProgressSteps>

                {/* ========================= */}
                {/* DATOS PERSONALES */}
                {/* ========================= */}

                <ProgressStep
                    label='Paso 1'
                    onNext={validarDatosPersonales}
                    errors={erroresDatos}
                >

                    <Text style={{ fontWeight: "bold", fontSize: 30, marginBottom: 12 }}>Datos personales</Text>
                    <DatosPersonales

                        nombre={nombre}
                        setNombre={setNombre}

                        numero={numero}
                        setNumero={setNumero}

                        tipoDocumento={tipoDocumento}
                        setTipoDocumento={setTipoDocumento}

                        numeroDocumento={numeroDocumento}
                        setNumeroDocumento={setNumeroDocumento}

                        fechaNacimiento={fechaNacimiento}
                        setFechaNacimiento={setFechaNacimiento}

                        direccion={direccion}
                        setDireccion={setDireccion}
                    />

                </ProgressStep>

                {/* ========================= */}
                {/* ESPECIALIDADES */}
                {/* ========================= */}

                <ProgressStep
                    label='Paso 2'
                    onNext={validarEspecialidades}
                    errors={erroresEspecialidades}
                >
                    <Text style={{ fontWeight: "bold", fontSize: 30, marginBottom: 12 }}>Especialidades</Text>
                    <Especialidades

                        especialidad={especialidad}
                        setEspecialidad={setEspecialidad}

                        experiencia={experiencia}
                        setExperiencia={setExperiencia}

                        descripcion={descripcion}
                        setDescripcion={setDescripcion}
                    />

                </ProgressStep>

                {/* ========================= */}
                {/* IDENTIFICACION */}
                {/* ========================= */}

                <ProgressStep
                    label='Paso 3'
                    onNext={validarIdentificacion}
                    errors={erroresIdentificacion}
                >

                    <Identificacion

                        fotoPerfil={fotoPerfil}
                        setFotoPerfil={setFotoPerfil}

                        cedulaFrontal={cedulaFrontal}
                        setCedulaFrontal={setCedulaFrontal}

                        cedulaTrasera={cedulaTrasera}
                        setCedulaTrasera={setCedulaTrasera}

                        certificado={certificado}
                        setCertificado={setCertificado}
                    />

                </ProgressStep>

                {/* ========================= */}
                {/* VALIDACION */}
                {/* ========================= */}

                <ProgressStep
                    label='Paso 4'
                    onSubmit={guardarProfesional}
                >

                    <Validacion />

                </ProgressStep>

            </ProgressSteps>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});