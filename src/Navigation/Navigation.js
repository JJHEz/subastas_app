import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import subirProducto from "../screens/subirProducto";
import ProductoEnSubasta from "../screens/productoEnSubasta";
import { FAB } from 'react-native-paper'; 
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from "../screens/home";
import Producto from "../screens/producto";
import Garantia from "../screens/garantia";
import Producto1 from "../screens/producto1";
import Salas from "../screens/salas";
import ProductosSalas from "../screens/productosSalas";
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
// Crear el stack y el tab navigator
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configuración de Deep Linking (si es necesario)
const linking = {
  prefixes: ['http://localhost:8081', 'exp://192.168.100.90:8081'],
  config: {
    screens: {
      Home: 'home/:id',
      Producto1: 'producto1/:id',
      Garantia: 'garantia/',
      Salas: 'salas/',
      ProductosSalas: 'productos_salas/:salaId',
    },
  },
};

// Pantalla para el Tab Navigator
function TabNavigator( { route } ) {
  const { idUsuario } = route.params || {};
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: "Productos" }} initialParams={{ idUsuario }} />
      <Tab.Screen name="Salas" component={Salas} options={{ title: "Salas" }} initialParams={{ idUsuario }} />
    </Tab.Navigator>
  );
}

// Función que maneja las rutas de Stack
function MyStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      {/* Aquí agregas el Tab Navigator como una de las pantallas dentro del Stack */}
      <Stack.Screen 
        name="TabNavigator" 
        component={TabNavigator} 
        options={{ headerShown: false }}  // Ocultamos el header porque la barra de navegación inferior ya lo maneja
      />

      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }}/>
      
      {/* Definir las pantallas adicionales dentro del Stack */}
      <Stack.Screen name="Producto" component={Producto} options={{ title: "Detalle del Producto" }} />
      <Stack.Screen name="Garantia" component={Garantia} options={{ title: "" }} />
      <Stack.Screen name="ProductosSalas" component={ProductosSalas} options={{ title: "Productos de la Sala" }} />
      <Stack.Screen name="Producto1" component={Producto1} options={{ title: "Detalle del Producto" }} />

      <Stack.Screen name="subirProducto" component={subirProducto} options={{ headerShown: false }}/>   
      <Stack.Screen name="ProductoEnSubasta" component={ProductoEnSubasta} options={{ title: "Subasta en linea" }}/>
    </Stack.Navigator>
  );
}



export default function Navigation() {
  return (
    <NavigationContainer>
      <MyStack />

    </NavigationContainer>
  );
}