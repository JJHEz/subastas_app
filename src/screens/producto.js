import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import database from '../config/firebase';

const Producto = ({ route, navigation }) => {
  const { producto, userId } = route.params;
  const [isParticipante, setIsParticipante] = useState(false); // Estado para verificar si ya está inscrito

  // Verificar si el usuario ya está inscrito en la sala
  const verificarInscripcion = async () => {
    try {
      const salaRef = doc(database, 'martillero', String(producto.id_martillero_fk));
      const salaDoc = await getDoc(salaRef);
      
      if (salaDoc.exists()) {
        const salaData = salaDoc.data();
        const participantes = salaData.participantes || [];

        const usuarioIdNumerico = parseInt(userId, 10);
        
        // Comprobar si el usuario ya está inscrito
        if (participantes.includes(usuarioIdNumerico)) {
          setIsParticipante(true); // El usuario ya está inscrito
        } else {
          setIsParticipante(false); // El usuario no está inscrito
        }
      }
    } catch (error) {
      console.error('Error al verificar la inscripción:', error);
    }
  };

  // Ejecutar la verificación cuando el componente se monta
  useEffect(() => {
    verificarInscripcion();
  }, []); // Se ejecuta solo una vez cuando se monta el componente

  const handleInscripcion = () => {
    if (isParticipante) {
      // Si ya está inscrito, mostrar la alerta
      Alert.alert('Ya estás inscrito', 'Ya estás inscrito en la sala de este producto.');
      setTimeout(() => {
        navigation.goBack(); // Redirigir hacia atrás
      }, 1500);
    } else {
      // Si no está inscrito, continuar con el proceso de inscripción
      navigation.navigate('Garantia', { userId, productoId: producto.id, producto });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.burbuja}>
        <Image source={{ uri: producto.imagen }} style={styles.imagen} />
        
        <View style={styles.detalles}>
          <Text style={styles.nombre}>{producto.nombre_producto}</Text>
          <Text>Categoría: {producto.nombre_categoria || 'Sin categoría'}</Text>
          <Text>Estado: {producto.estado_del_producto}</Text>
          <Text>Base: ${producto.precio_base}</Text>
          <Text>Ubicación: {producto.ubicacion}</Text>
          <Text>Inicio: {producto.fecha_de_subasta} a las {producto.hora_de_subasta}</Text>
          <Text>Fin: {producto.hora_fin_subasta}</Text>
          <Text>Vendido: {producto.vendido ? "Sí" : "No"}</Text>
          <Text>Descripción: {producto.descripcion_producto || 'Sin descripción'}</Text>
        </View>
      </View>  

      <View style={styles.botones}>
        <TouchableOpacity style={styles.botonInscribirse} onPress={handleInscripcion}>
          <Text style={styles.textoBoton}>
            {isParticipante ? 'Ya estás inscrito' : 'Inscribirse a subasta'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007BFF",
    padding: 15,
  },
  burbuja: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  imagen: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#ccc", // en caso de que no cargue la imagen
  },
  detalles: {
    width: "100%",
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  botones: {
    alignItems: "center",
    marginTop: 10,
  },
  botonInscribirse: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  textoBoton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Producto;
