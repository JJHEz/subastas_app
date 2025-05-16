import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import subirProducto from "../screens/subirProducto";

const Stack = createNativeStackNavigator();

function MyStack() {
    return (
        <Stack.Navigator initialRouteName="subirProducto">
            <Stack.Screen name="subirProducto" component={subirProducto} options={{ headerShown: false }}/>   
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