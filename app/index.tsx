import { Text, View, StyleSheet, Pressable } from "react-native";
import {router} from "expo-router";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>Esta será la pantalla principal</Text>
      

      <Pressable onPress={() => router.push("/login")}>
        <Text>Iniciar sesión</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/registro")}>
        <Text>Registrarse</Text> 
      </Pressable>

      <Pressable onPress={() => router.push("/registroProfesional")}>
        <Text>Soy profesional</Text> 
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    color: "#fff"
  },
});
