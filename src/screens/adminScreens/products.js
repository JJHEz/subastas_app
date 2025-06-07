import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import database from '../../config/firebase';

export default function Products() {
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  // Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      const usuariosRef = collection(database, 'usuario');
      const snapshot = await getDocs(usuariosRef);
      const listaUsuarios = snapshot.docs.map(doc => doc.data());
      setUsuarios(listaUsuarios);
    } catch (error) {
      console.log('Error al cargar los usuarios:', error);
    }
  };

  // Cargar categorías y contar productos
  const cargarCategorias = async () => {
    try {
      const productosRef = collection(database, 'producto');
      const snapshot = await getDocs(productosRef);
      let categoriasMap = {};

      snapshot.docs.forEach(doc => {
        const producto = doc.data();
        const categoria = producto.nombre_categoria || 'Sin categoría';

        if (categoriasMap[categoria]) {
          categoriasMap[categoria]++;
        } else {
          categoriasMap[categoria] = 1;
        }
      });

      setCategorias(Object.entries(categoriasMap).map(([categoria, count]) => ({ categoria, count })));
    } catch (error) {
      console.log('Error al cargar las categorías:', error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarCategorias();
  }, []);

  const renderUsuario = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.nombre}</Text>
      <Text>{item.correo_electronico}</Text>
    </View>
  );

  const renderCategoria = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.categoria}: {item.count} productos</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>

      <Text style={styles.sectionTitle}>Usuarios</Text>
      <FlatList
        data={usuarios}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderUsuario}
      />

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
