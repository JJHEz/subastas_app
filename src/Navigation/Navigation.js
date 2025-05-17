import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import subirProducto from "../screens/subirProducto";
import ProductoEnSubasta from "../screens/productoEnSubasta";

const Stack = createNativeStackNavigator();

function MyStack() {
    return (
        <Stack.Navigator initialRouteName="subirProducto">
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