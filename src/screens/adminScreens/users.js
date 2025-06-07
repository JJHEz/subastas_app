import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import database from '../../config/firebase';

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);

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

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const renderUsuario = ({ item }) => (
    <View style={styles.item}>
      {/* Mostrar todos los atributos del usuario */}
      {Object.entries(item).map(([key, value]) => (
        <Text key={key} style={styles.text}>
          <Text style={styles.bold}>{key}: </Text>
          {value}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>

      <Text style={styles.sectionTitle}>Usuarios registrados </Text>
      <FlatList
        data={usuarios}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderUsuario}
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
  text: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
});

