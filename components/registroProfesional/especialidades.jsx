import { View, StyleSheet, TextInput } from 'react-native'
import RNPickerSelect from "react-native-picker-select";

export default function Especialidades({
  especialidad, setEspecialidad,
  experiencia, setExperiencia,
  descripcion, setDescripcion
}) {
  return (
    <View style={styles.container}>
      
      <RNPickerSelect
        useNativeAndroidPickerStyle={false}
        placeholder={{ label: "Especialidad", value: null }}
        value={especialidad}
        onValueChange={(value) => setEspecialidad(value)}
        items={[
          { label: "Electricidad", value: "electricidad" },
          { label: "Plomería", value: "plomeria" },
          { label: "Pintura", value: "pintura" },
          { label: "Carpintería", value: "carpinteria" },
          { label: "Cerrajería", value: "cerrajeria" },
          { label: "Albañilería", value: "albañilería" },
          { label: "Remodelación", value: "remodelación" },
          { label: "Limpieza", value: "limpieza" },
        ]}
        style={{ inputAndroid: styles.input, placeholder: { color: "#C5C5C6", fontSize: 18 } }}
      />

      <RNPickerSelect
        useNativeAndroidPickerStyle={false}
        placeholder={{ label: "Experiencia", value: null }}
        value={experiencia}
        onValueChange={(value) => setExperiencia(value)}
        items={[
          { label: "Menos de 1 año", value: 0 },
          { label: "1 año", value: 1 },
          { label: "2 años", value: 2 },
          { label: "3 años", value: 3 },
          { label: "4 años", value: 4 },
          { label: "5 o más años", value: 5 },
        ]}
        style={{ inputAndroid: styles.input, placeholder: { color: "#C5C5C6", fontSize: 18 } }}
      />

      <TextInput value={descripcion} onChangeText={setDescripcion} placeholder="Descripción sobre usted" style={styles.input} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    backgroundColor: "#ffff",
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
})
