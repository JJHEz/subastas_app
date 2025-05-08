import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "../screens/home";
import Producto from "../screens/producto";
import Garantia from "../screens/garantia";
import Producto1 from "../screens/producto1";
import ProductosInscritos from "../screens/productos_inscritos";


const Stack = createNativeStackNavigator();

// Configuración de deep linking
const linking = {
    prefixes: ['http://localhost:8081'],
    config: {
      screens: {
        Home: '',
        Producto1: 'producto1/:id', // Definir los parámetros de la URL
        Garantia: 'garantia', // Definir los parámetros de la URL
        ProductosInscritos: 'productos_inscritos/:usuarioId', // Aquí se pasa el usuarioId
      },
    },
  };


function MyStack() {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen 
                name="Home" 
                component={Home} 
                options={{ title: "Productos" }}
            />
            <Stack.Screen
                name="Producto" 
                component={Producto} 
                options={{ title: "Detalle del Producto" }}
            />
            <Stack.Screen
                name="Garantia" 
                component={Garantia} 
                options={{ title: "" }}
            />
            <Stack.Screen
                name="Producto1" 
                component={Producto1} 
                options={{ title: "Detalle del Producto" }}
            />
            <Stack.Screen
                name="ProductosInscritos" 
                component={ProductosInscritos} 
                options={{ title: "Productos Inscritos de Usuario" }}
            />
        </Stack.Navigator>
    );
}

export default function Navigation() {
    return (
        <NavigationContainer linking={linking}> 
            <MyStack />
        </NavigationContainer>
    );
}