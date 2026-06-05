import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

const FechaNacimientoPicker = ({ fechaNacimiento, setFechaNacimiento }) => {

  const [mostrar, setMostrar] = useState(false);

  const onChange = (event, selectedDate) => {
    setMostrar(false);

    if (selectedDate) {
      setFechaNacimiento(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Seleccione una fecha";

    return new Date(date).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setMostrar(true)}
      >
        <Text>{formatDate(fechaNacimiento)}</Text>
      </TouchableOpacity>

      {mostrar && (
        <DateTimePicker
          value={fechaNacimiento || new Date(2000, 0, 1)}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
          locale="es-CO"
        />
      )}

    </View>
  );
};

export default function DatosPersonales({
  nombre,
  setNombre,

  numero,
  setNumero,

  tipoDocumento,
  setTipoDocumento,

  numeroDocumento,
  setNumeroDocumento,

  fechaNacimiento,
  setFechaNacimiento,

  direccion,
  setDireccion,
}) {

  return (
    <View style={styles.container}>

      <Text>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text>Número de telefono</Text>
      <TextInput
      keyboardType="numeric"
        style={styles.input}
        placeholder="Número de telefono"
        value={numero}
        onChangeText={setNumero}
      />

      <Text>Tipo de documento</Text>

      <RNPickerSelect
        onValueChange={(value) => setTipoDocumento(value)}
        value={tipoDocumento}
        items={[
          {
            label: "Cédula de ciudadanía",
            value: "cedula_ciudadania"
          },
          {
            label: "Cédula de extranjería",
            value: "cedula_extranjeria"
          },
        ]}
      />

      <Text>Número de documento</Text>

      <TextInput
        placeholder="Número de documento"
        keyboardType="numeric"
        style={styles.input}
        value={numeroDocumento}
        onChangeText={setNumeroDocumento}
      />

      <Text>Fecha de nacimiento</Text>

      <FechaNacimientoPicker
        fechaNacimiento={fechaNacimiento}
        setFechaNacimiento={setFechaNacimiento}
      />

      <Text>Dirección</Text>

      <TextInput
        placeholder="Dirección"
        style={styles.input}
        value={direccion}
        onChangeText={setDireccion}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    backgroundColor: "#fff",
  },

  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    backgroundColor: "#F3F3F3",
    width: "100%",
    justifyContent: "center",
  },
});