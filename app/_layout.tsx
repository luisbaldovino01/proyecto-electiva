import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/>
      <Stack.Screen name="login" options={{headerShown: false}}/>
      <Stack.Screen name="registro" options={{headerShown: false}}/>
      <Stack.Screen name="registroProfesional" options={{headerShown: false}}/>
      <Stack.Screen name="administracion" options={{headerShown: false}}/>
      <Stack.Screen name="detalleProfesional" options={{headerShown: false}}/>
      <Stack.Screen name="detallesSolicitud" options={{headerShown: false}}/>
      <Stack.Screen name="perfilProfesionalPublico" options={{headerShown: false}}/>
      <Stack.Screen name="solicitud" options={{headerShown: false}}/>
      <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
      <Stack.Screen name="(tabsProfesional)" options={{headerShown: false}}/>
    </Stack>
  );
}
