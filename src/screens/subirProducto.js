import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import database from "../config/firebase"
import { collection, addDoc, getDocs, getDoc, doc, setDoc, query, limit, where, orderBy, updateDoc, docSnap } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default function AddProductForm() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [estado, setEstado] = useState('');
  const [fechaSubasta, setFechaSubasta] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [precioBase, setPrecioBase] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };


  const addProducto = async () => {
    try {

      let productoSnapshot = await getDocs(collection(database, 'producto')); //obtenemos la coleccion oferta
      let idsNumericos = productoSnapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id)); // obtener los ids existentes
      let nuevoId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1; // Calcular el nuevo ID (el más alto + 1)
      console.log("id :::::" + nuevoId);


      await setDoc(doc(database, "producto",nuevoId.toString()), {
        estado_del_produto:estado,
        fecha_de_subasta: fechaSubasta.toISOString(),
        hora_de_subasta: "13:00",
        hora_fin_subasta: "13:20",
        id_categoria_fk:category,
        id_martillero_fk: 1, //modificar esto
        id_usuario_fk: 2, //Necesitamos el id del usuario
        imagen: imageUri || null,
        nombre_producto: title,
        precio_base: parseFloat(precioBase),
        ubicacion: "Cochabamba", // por determinarse si añadimos esto a la collección de firebase
        vendido:false,
      });
      alert("Producto guardado con éxito");
      // Aquí puedes limpiar el formulario si quieres
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el producto");
    }
  }


  return (
    <View style={styles.container}>
      <IconButton icon="arrow-left" style={styles.botonRegresar} onPress={() => {}} />
      
      <View style={styles.card}>
        <View style={styles.userRow}>
          <IconButton icon="account" size={20} />
          <Text style={{ fontWeight: 'bold' }}>Alan (4.9)</Text>
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <>
              <IconButton icon="plus-box" size={30} />
              <Text>Añadir fotos</Text>
            </>
          )}
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="Categoría" value={category} onChangeText={setCategory} />
        <TextInput style={styles.input} placeholder="Estado" value={estado} onChangeText={setEstado} />

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: '#555' }}>{fechaSubasta.toLocaleDateString()}</Text>
          <IconButton icon="calendar" size={20} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={fechaSubasta}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setFechaSubasta(selectedDate);
            }}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Precio Base"
          keyboardType="numeric"
          value={precioBase}
          onChangeText={setPrecioBase}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={addProducto}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Añadir producto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#008CFF',
      paddingTop: 1,
      paddingHorizontal: 20,
    },
    logo: {
      width: 60,
      height: 60,
      alignSelf: 'center',
      marginBottom: 10,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    imagePicker: {
      alignItems: 'center',
      marginVertical: 10,
    },
    preview: {
      width: 100,
      height: 100,
      borderRadius: 10,
    },
    input: {
      backgroundColor: '#e5e7eb',
      borderRadius: 10,
      padding: 12,
      marginVertical: 6,
    },
    dateInput: {
      backgroundColor: '#e5e7eb',
      borderRadius: 10,
      padding: 12,
      marginVertical: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    submitBtn: {
      backgroundColor: '#d4a373',
      borderRadius: 20,
      padding: 15,
      marginTop: 20,
      alignItems: 'center',
    },
    botonRegresar: {
        marginTop: 30,
    },
  });
  