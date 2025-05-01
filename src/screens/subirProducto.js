import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';


import database from "../config/firebase"
import { collection, getDocs, doc, setDoc, query, limit, where, orderBy, updateDoc, docSnap } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AddProductForm() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [estado, setEstado] = useState('');
  
  const [precioBase, setPrecioBase] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  const [errors, setErrors] = useState({});


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const validarCampos = () => {
      const nuevosErrores = {};
      if (!title) nuevosErrores.title = true;
      if (!category) nuevosErrores.category = true;
      if (!estado) nuevosErrores.estado = true;
      if (!precioBase) nuevosErrores.precioBase = true;
      if (!ubicacion) nuevosErrores.ubicacion = true;
      if (!imageUri) nuevosErrores.imageUri = true;
    
      setErrors(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    };

  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const snapshot = await getDocs(collection(database, 'categoria'));
        const lista = snapshot.docs.map(doc => ({
          label: doc.data().nombre_categoria,
          value: parseInt(doc.id), // o usa otro campo como `doc.data().id`
        }));
        console.log(lista)
        setItems(lista);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      }
    };
  
    obtenerCategorias();
  }, []);


  const subirImagenAFirebase = async (uri, nombreArchivo) => {
    const response = await fetch(uri);
    const blob = await response.blob();
  
    const storage = getStorage();
    const storageRef = ref(storage, `productos/${nombreArchivo}`);
  
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };  


  const addProducto = async () => {
    if (!validarCampos()) {
      alert('Por favor completa todos los campos');
      return;
    }
  
    try {
      let productoSnapshot = await getDocs(collection(database, 'producto')); //obtenemos la coleccion oferta
      let idsNumericos = productoSnapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id)); // obtener los ids existentes
      let nuevoId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1; // Calcular el nuevo ID (el más alto + 1)

      let downloadURL = null;

      if (imageUri) {
        const nombreOriginal = imageUri.split('/').pop(); // ejemplo: imagen.jpg
        downloadURL = await subirImagenAFirebase(imageUri, nombreOriginal);
      }


      await setDoc(doc(database, "producto",nuevoId.toString()), {
        estado_del_produto:estado,
        fecha_de_subasta: "01-05-2025",
        hora_de_subasta: "13:00",
        hora_fin_subasta: "13:20",
        id_categoria_fk:category,
        id_martillero_fk: 1, //modificar esto
        id_usuario_fk: 2, //Necesitamos el id del usuario
        imagen: downloadURL,
        nombre_producto: title,
        precio_base: parseFloat(precioBase),
        ubicacion: ubicacion, // por determinarse si añadimos esto a la collección de firebase
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

        <View style={styles.inputRow}>
          {errors.imageUri && <Text style={styles.asterisk}> *</Text>}
          <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, { flex: 1 }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <>
                <IconButton icon="plus-box" size={30} />
                <Text>Añadir fotos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          {errors.title && <Text style={styles.asterisk}> *</Text>}
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Nombre" value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.inputRow}>
          {errors.category && <Text style={styles.asterisk}> *</Text>}
          <DropDownPicker style={styles.input}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={(val) => {
              setValue(val);
              setCategory(val); // Guardas el ID en category
            }}
            setItems={setItems}
            placeholder="Selecciona una categoría"
          />
        </View>



        <View style={styles.inputRow}>
          {errors.estado && <Text style={styles.asterisk}> *</Text>}
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Estado" value={estado} onChangeText={setEstado} />
        </View>
        
        <View style={styles.inputRow}>
          {errors.precioBase && <Text style={styles.asterisk}> *</Text>}
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Precio Base"
            keyboardType="numeric"
            value={precioBase}
            onChangeText={setPrecioBase}
          />
        </View>

        <View style={styles.inputRow}>
          {errors.ubicacion && <Text style={styles.asterisk}> *</Text>}
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ubicación" value={ubicacion} onChangeText={setUbicacion} />
        </View>

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
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative', // importante
    },
    asterisk: {
      position: 'absolute',
      left: -15, // cámbialo a -20, -30, etc. para moverlo más a la derecha
      top: '50%',
      transform: [{ translateY: -10 }],
      color: 'red',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
  