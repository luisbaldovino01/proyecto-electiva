import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <View style={{ gap: 12, paddingHorizontal: 20}}>
        <Text style={{ color: "#ffff", fontSize: 28, maxWidth: "80%", fontWeight: "bold"}}>Regístrate o inicia sesión</Text>
        <Text style={{ color: "#ffff", fontSize: 17 }}>Entra en Fixia y encuentra todos los servicios para el hogar</Text>
      </View>

      <View style={{ gap: 12, paddingHorizontal: 20}}>
        <Pressable style={styles.pressableLogin} onPress={() => router.push("/login")}>
          <Text style={{ color: "#ffff", fontWeight: "bold" }}>Iniciar sesión</Text>
        </Pressable>

        <Pressable style={styles.pressableRegister} onPress={() => router.push("/registro")}>
          <Text>Registrarse</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/registroProfesional")}>
          <Text style={{ color: "#ffff", textDecorationLine: "underline", textAlign: "center" }}>Soy profesional</Text>
        </Pressable>
      </View>

      <Image source={require("../assets/vectors/vector1.png")} style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 320, zIndex: -1
      }} />
      <Image source={require("../assets/vectors/vector2.png")} style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 220, zIndex: -1
      }} />
      <Image source={require("../assets/vectors/vector3.png")} style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 190, zIndex: -1
      }} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5B9AE8",
    paddingVertical: 80,
    justifyContent: "space-between",
    overflow: "hidden"
  },
  pressableLogin: {
    borderWidth: 1,
    borderColor: "#ffff",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 45,
    borderRadius: 50,
  },
  pressableRegister: {
    borderWidth: 1,
    backgroundColor: "#ffff",
    borderColor: "#ffff",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 45,
    borderRadius: 50,
  },
});
