import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import database from '../../config/firebase';

export default function CategoriasResumen() {
  const [resumen, setResumen] = useState([]);

  const cargarResumen = async () => {
    try {
      // Obtener categorías (usamos doc.id como identificador)
      const categoriasSnapshot = await getDocs(collection(database, 'categoria'));
      const categorias = categoriasSnapshot.docs.map(doc => ({
        id: doc.id, // este es el ID del documento (string)
        nombre: doc.data().nombre_categoria,
      }));

      // Obtener martilleros
      const martillerosSnapshot = await getDocs(collection(database, 'martillero'));
      const martilleros = martillerosSnapshot.docs.map(doc => doc.data());

      // Construir resumen por categoría
      const dataResumen = categorias.map(cat => {
        const martillerosDeCategoria = martilleros.filter(
          m => String(m.id_categoria_fk) === cat.id
        );
        const cantidadMartilleros = martillerosDeCategoria.length;
        const totalParticipantes = martillerosDeCategoria.reduce(
          (acc, m) => acc + (Array.isArray(m.participantes) ? m.participantes.length : 0),
          0
        );

        return {
          nombre_categoria: cat.nombre,
          cantidad_martilleros: cantidadMartilleros,
          total_participantes: totalParticipantes,
        };
      });

      setResumen(dataResumen);
    } catch (error) {
      console.log('Error al cargar el resumen:', error);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Categoría</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Nombre_categoria: </Text>{item.nombre_categoria}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Cantidad de martilleros: </Text>{item.cantidad_martilleros}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Usuario participados: </Text>{item.total_participantes}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Panel de Administración</Text>
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
  header: {
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
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
});
