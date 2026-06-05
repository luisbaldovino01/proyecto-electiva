import { View, Text, StyleSheet, TextInput } from 'react-native'
import RNPickerSelect from "react-native-picker-select";

export default function Especialidades({
  especialidad, setEspecialidad,
  experiencia, setExperiencia,
  descripcion, setDescripcion
}) {
  return (
    <View style={styles.container}>
      <Text>Especialidad</Text>
      <RNPickerSelect
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
      />

      <Text>Experiencia</Text>
      <RNPickerSelect
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
      />

      <Text>Descripción</Text>
      <TextInput value={descripcion} onChangeText={setDescripcion} placeholder="Hable un poco sobre usted" style={styles.input} />
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
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    backgroundColor: "#F3F3F3",
    width: "100%",
    justifyContent: "center",
  },
})
