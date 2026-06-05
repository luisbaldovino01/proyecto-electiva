import { View, Text, Alert, Button, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export default function Identificacion({ 
  fotoPerfil, setFotoPerfil,
  cedulaFrontal, setCedulaFrontal,
  cedulaTrasera, setCedulaTrasera,
  certificado, setCertificado }
) {

  const pickImage = async (setter) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permisos requeridos", "Se requiere acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setCertificado({ name: file.name, uri: file.uri });
      }
    } catch (error) {
      console.log("Error al escoger el archivo", error);
    }
  };

  return (
    <View style={styles.container}>

      <Text>Foto de perfil</Text>
      <Button title="Seleccionar foto" onPress={() => pickImage(setFotoPerfil)} />
      {fotoPerfil && <Image source={{ uri: fotoPerfil }} style={styles.image} />}

      <Text>Cédula frontal</Text>
      <Button title="Seleccionar imagen" onPress={() => pickImage(setCedulaFrontal)} />
      {cedulaFrontal && <Image source={{ uri: cedulaFrontal }} style={styles.image} />}

      <Text>Cédula trasera</Text>
      <Button title="Seleccionar imagen" onPress={() => pickImage(setCedulaTrasera)} />
      {cedulaTrasera && <Image source={{ uri: cedulaTrasera }} style={styles.image} />}

      <Text>Certificado</Text>
      <Button title="Cargar certificado" onPress={pickDocument} />
      {certificado && <Text>Archivo seleccionado: {certificado.name}</Text>}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
    gap: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
});