import { View, Text, Alert, Image, StyleSheet, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export default function Identificacion({
  fotoPerfil,
  setFotoPerfil,
  cedulaFrontal,
  setCedulaFrontal,
  cedulaTrasera,
  setCedulaTrasera,
  certificado,
  setCertificado,
}) {
  const pickImage = async (setter) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permisos requeridos",
        "Se requiere acceder a la galería"
      );
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
        setCertificado({
          name: file.name,
          uri: file.uri,
        });
      }
    } catch (error) {
      console.log("Error al escoger el archivo", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* FOTO PERFIL */}
      <Text style={styles.label}>Foto de perfil</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => pickImage(setFotoPerfil)}
      >
        <Text
          style={[
            styles.inputText,
            !fotoPerfil && styles.placeholder,
          ]}
        >
          {fotoPerfil ? "Imagen seleccionada" : "Seleccionar foto"}
        </Text>
      </TouchableOpacity>

      {fotoPerfil && (
        <Image
          source={{ uri: fotoPerfil }}
          style={styles.image}
        />
      )}

      {/* CÉDULA FRONTAL */}
      <Text style={styles.label}>Cédula frontal</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => pickImage(setCedulaFrontal)}
      >
        <Text
          style={[
            styles.inputText,
            !cedulaFrontal && styles.placeholder,
          ]}
        >
          {cedulaFrontal
            ? "Imagen seleccionada"
            : "Seleccionar imagen"}
        </Text>
      </TouchableOpacity>

      {cedulaFrontal && (
        <Image
          source={{ uri: cedulaFrontal }}
          style={styles.image}
        />
      )}

      {/* CÉDULA TRASERA */}
      <Text style={styles.label}>Cédula trasera</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => pickImage(setCedulaTrasera)}
      >
        <Text
          style={[
            styles.inputText,
            !cedulaTrasera && styles.placeholder,
          ]}
        >
          {cedulaTrasera
            ? "Imagen seleccionada"
            : "Seleccionar imagen"}
        </Text>
      </TouchableOpacity>

      {cedulaTrasera && (
        <Image
          source={{ uri: cedulaTrasera }}
          style={styles.image}
        />
      )}

      {/* CERTIFICADO */}
      <Text style={styles.label}>Certificado</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={pickDocument}
      >
        <Text
          style={[
            styles.inputText,
            !certificado && styles.placeholder,
          ]}
          numberOfLines={1}
        >
          {certificado
            ? certificado.name
            : "Seleccionar archivo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    gap: 12,
  },

  label: {
    fontSize: 14,
    color: "#777",
  },

  input: {
    height: 50,
    paddingHorizontal: 15,
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#E0E0E0",
    width: "100%",
  },

  inputText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  placeholder: {
    color: "#C5C5C6",
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 4,
  },
});