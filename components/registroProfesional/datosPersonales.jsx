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
    if (!date) return "Fecha de nacimiento";

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
        <Text style={{ color: fechaNacimiento ? "#333" : "#C5C5C6", fontSize: 18, fontWeight: "bold", }}>{formatDate(fechaNacimiento)}</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#C5C5C6"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        keyboardType="numeric"
        style={styles.input}
        placeholder="Número de telefono"
        placeholderTextColor="#C5C5C6"
        value={numero}
        onChangeText={setNumero}
      />

      <TextInput
        placeholder="Número de documento"
        placeholderTextColor="#C5C5C6"
        keyboardType="numeric"
        style={styles.input}
        value={numeroDocumento}
        onChangeText={setNumeroDocumento}
      />

      <FechaNacimientoPicker
        fechaNacimiento={fechaNacimiento}
        setFechaNacimiento={setFechaNacimiento}
      />

      <TextInput
        placeholder="Dirección"
        placeholderTextColor="#C5C5C6"
        style={styles.input}
        value={direccion}
        onChangeText={setDireccion}
      />

      <RNPickerSelect 
        useNativeAndroidPickerStyle={false}
        placeholder={{ label: "Tipo de documento", value: null }}
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
        style={{ inputAndroid: styles.input, placeholder: { color: "#C5C5C6", fontSize: 18 } }}
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
    paddingHorizontal: 15,
    fontSize: 18,
    width: "100%",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#E0E0E0",
    color: "#333",
    fontWeight: "bold"
  },
});