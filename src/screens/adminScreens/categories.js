import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import database from '../../config/firebase';

export default function Categories() {
  const [categorias, setCategorias] = useState([]);

  // Cargar categorías y contar productos por categoría
  const cargarCategorias = async () => {
    try {
      // Obtener todas las categorías
      const categoriasRef = collection(database, 'categoria');
      const categoriasSnapshot = await getDocs(categoriasRef);
      
      // Crear un mapa de categorías para buscar más eficientemente
      const categoriasMap = categoriasSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        acc[data.id] = data.nombre_categoria;
        return acc;
      }, {});
      
      // Contar los productos por categoría
      const productosRef = collection(database, 'producto');
      const productosSnapshot = await getDocs(productosRef);

      let categoriasContadas = {};

      productosSnapshot.docs.forEach((doc) => {
        const producto = doc.data();
        const categoriaId = String(producto.id_categoria_fk); // Convertir el id_categoria_fk a String

        // Obtener el nombre de la categoría desde el mapa
        const nombreCategoria = categoriasMap[categoriaId] || 'Sin categoría';

        // Contar la cantidad de productos por categoría
        if (categoriasContadas[nombreCategoria]) {
          categoriasContadas[nombreCategoria]++;
        } else {
          categoriasContadas[nombreCategoria] = 1;
        }
      });

      // Convertir el mapa a un array para mostrarlo en la lista
      setCategorias(Object.entries(categoriasContadas).map(([categoria, count]) => ({ categoria, count })));
    } catch (error) {
      console.log('Error al cargar las categorías:', error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const renderCategoria = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.categoria}: {item.count} productos</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>

      <Text style={styles.sectionTitle}>Categorías</Text>
      <FlatList
        data={categorias}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCategoria}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  item: {
    marginBottom: 10,
  },
});
