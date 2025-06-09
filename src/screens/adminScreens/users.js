import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import database from '../../config/firebase';
import { useNavigation } from '@react-navigation/native'; // Asegúrate de importar esto para usar navigation

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const navigation = useNavigation();

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
    <View style={styles.card}>
      {'nombre' in item && (
        <Text style={styles.text}>
          <Text style={styles.bold}>Nombre: </Text>
          {item.nombre}
        </Text>
      )}
      {'telefono' in item && (
        <Text style={styles.text}>
          <Text style={styles.bold}>Teléfono: </Text>
          {item.telefono}
        </Text>
      )}
      {'correo_electronico' in item && (
        <Text style={styles.text}>
          <Text style={styles.bold}>Correo electrónico: </Text>
          {item.correo_electronico}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      <View style={styles.cierre}>
        <Text style={styles.sectionTitle}>Usuarios registrados</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FFA500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  cierre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#BB6161',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
