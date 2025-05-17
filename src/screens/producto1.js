import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

const Producto1 = ({ route, navigation }) => {
  const { id } = route.params;  // Recibe el ID del producto
  //const { user } = route.params;  // Recibe el ID del producto
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const docRef = doc(db, "producto", id);  // Obtiene el producto por ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProducto(docSnap.data());
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
      }
    };

    fetchProducto();
  }, [id]);

  if (!producto) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando producto...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.burbuja}>
        <Image source={{ uri: producto.imagen }} style={styles.imagen} />
        
        <View style={styles.detalles}>
          <Text style={styles.nombre}>{producto.nombre_producto}</Text>
          <Text>Estado: {producto.estado_del_producto}</Text>
          <Text>Base: ${producto.precio_base}</Text>
          <Text>Ubicación: {producto.ubicacion}</Text>
          <Text>Inicio: {producto.fecha_de_subasta} a las {producto.hora_de_subasta}</Text>
          <Text>Fin: {producto.hora_fin_subasta}</Text>
          <Text>Vendido: {producto.vendido ? "Sí" : "No"}</Text>
          <Text>Descripción: {producto.descripcion || 'Sin descripción'}</Text>
        </View>
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
    backgroundColor: "#ccc",
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
});

export default Producto1;
