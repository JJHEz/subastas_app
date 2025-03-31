import React, { useState } from 'react';
import { Text, View, Button, TextInput } from 'react-native';
import database from "../config/firebase"
import { collection, addDoc } from 'firebase/firestore';

export default function Home() {
    const [state, setState] = useState({
        nombre: '',
        email: '',
        celular: ''
    });

    const addNewUser = async () => {
        if (state.nombre === "") {
            alert("Ingrese el nombre por favor!!");
        } else {
            console.log(state);
            try {
                await addDoc(collection(database, 'users'), {
                    nombre: state.nombre,
                    email: state.email,
                    celular: state.celular
                });
                alert("Usuario guardado exitosamente!");
                setState({
                    nombre:"",
                    email:"",
                    celular:""
                });
            } catch (e) {
                console.error("Error adding document: ", e);
                alert("Hubo un error al guardar los datos.");
            }
        }
    };

    const handleChangeText = (nombre, value) => {
        setState({ ...state, [nombre]: value });
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Página principal CRUD
            </Text>
            <Text style={{ fontSize: 18 }}>Productos...</Text>

            <TextInput
                placeholder="nombre"
                onChangeText={(value) => handleChangeText("nombre", value)}
                value={state.nombre}
            />
            <TextInput
                placeholder="email"
                onChangeText={(value) => handleChangeText("email", value)}
                value={state.email}
            />
            <TextInput
                placeholder="celular"
                onChangeText={(value) => handleChangeText("celular", value)}
                value={state.celular}
            />

            <Button title="Guardar" onPress={addNewUser} />
        </View>
    );
}
