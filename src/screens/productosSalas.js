import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from "firebase/firestore";
import database from "../config/firebase";

const ProductosSalas = ({ route }) => {
  const { salaId } = route.params;  // Capturamos el ID de la sala desde los parámetros de la navegación
  const [productos, setProductos] = useState([]);
  const salaIdNumerico = parseInt(salaId, 10); // Convertir a número


  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // Consulta para obtener productos filtrados por id_martillero_fk (ID de la sala)
        const productosQuery = query(
            collection(database, "producto"), 
            where("id_martillero_fk", "==", salaIdNumerico)
        );
        const querySnapshot = await getDocs(productosQuery);

        const productosData = [];
        querySnapshot.forEach((doc) => {
          productosData.push({ id: doc.id, ...doc.data() });
        });

        setProductos(productosData);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProductos(); // Llamamos a la función que obtiene los productos de la sala seleccionada
  }, [salaId]);

  const renderProductoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.burbuja}  // Estilo similar al de los productos en Home.js
      onPress={() => console.log(`Producto: ${item.nombre_producto}`)}  // Aquí podrías navegar a la pantalla de detalle del producto
    >
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{item.nombre_producto}</Text>
        <Text>{item.descripcion_producto}</Text>
        <Text>Precio base: ${item.precio_base}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Productos de la Sala {salaId} </Text>
      {productos.length === 0 ? (
        <Text>No hay productos disponibles en esta sala.</Text>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id}
          renderItem={renderProductoItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007BFF', // Aquí se establece el color de fondo como el de Home.js
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // Para que el texto del encabezado sea visible sobre el fondo azul
  },
  burbuja: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    flexDirection: "row", // Alineamos los elementos en fila
    alignItems: "center", // Alineamos verticalmente la imagen y el texto
  },
  imagen: {
    width: 150,  // Tamaño fijo
    height: 150,
    borderRadius: 10,
    marginRight: 20, // Espacio entre imagen y detalles
    backgroundColor: '#ccc',
  },
  detalles: {
    flex: 1, // Los detalles ocupan el resto del espacio
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default ProductosSalas;
