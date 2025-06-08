import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import database from '../../config/firebase';

export default function ProductsPorUsuario() {
  const [resumen, setResumen] = useState([]);

  const cargarResumen = async () => {
    try {
      const usuariosSnapshot = await getDocs(collection(database, 'usuario'));
      const usuarios = usuariosSnapshot.docs
        .map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre,
        }))
        .filter(usuario => usuario.id !== '0'); // Excluir al admin

      const productosSnapshot = await getDocs(collection(database, 'producto'));
      const productos = productosSnapshot.docs.map(doc => doc.data());

      const dataResumen = usuarios.map(usuario => {
        const productosDelUsuario = productos.filter(
          p => String(p.id_usuario_fk) === usuario.id
        );

        const totalProductos = productosDelUsuario.length;
        const productosVendidos = productosDelUsuario.filter(p => p.vendido === true).length;

        return {
          nombre: usuario.nombre,
          totalProductos,
          productosVendidos,
        };
      });

      setResumen(dataResumen);
    } catch (error) {
      console.log('Error al cargar el resumen de productos por usuario:', error);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>Nombre: {item.nombre}</Text>
      <Text style={styles.text}>Productos: {item.totalProductos}</Text>
      <Text style={styles.text}>Vendidos: {item.productosVendidos}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos por Usuario</Text>
      <FlatList
        data={resumen}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFA500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
  },
});

