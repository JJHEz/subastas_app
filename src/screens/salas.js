import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import database from "../config/firebase";
import { useRoute, useFocusEffect } from '@react-navigation/native';

const Salas = ({ navigation }) => {
  const route = useRoute();
  const { idUsuario } = route.params;
  const idDelUsuarioQueIngreso = idUsuario;

  const userId = parseInt(idUsuario);

  const [salas, setSalas] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [nombreUsuario, setNombreUsuario] = useState("");

  const fetchCategorias = async () => {
    try {
      const snapshot = await getDocs(collection(database, "categoria"));
      const categoriasData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        categoriasData[doc.id] = data.nombre_categoria;
      });
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  const fetchSalas = async () => {
    try {
      const salasQuery = query(
        collection(database, "martillero"),
        where("participantes", "array-contains", userId)
      );

      const querySnapshot = await getDocs(salasQuery);
      const salasData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        salasData.push({ id: doc.id, ...data });
      });

      setSalas(salasData);
    } catch (error) {
      console.error("Error al obtener salas:", error);
    }
  };

  const fetchNombreUsuario = async () => {
    try {
      const usuarioRef = doc(database, "usuario", String(idDelUsuarioQueIngreso));
      const usuarioSnap = await getDoc(usuarioRef);
      if (usuarioSnap.exists()) {
        const data = usuarioSnap.data();
        setNombreUsuario(data.nombre);
      } else {
        console.warn("No se encontró el usuario con ese ID.");
      }
    } catch (error) {
      console.error("Error al obtener el nombre del usuario:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategorias();
      fetchSalas();
      fetchNombreUsuario();

      return () => {
        // limpieza si necesario
      };
    }, [userId])
  );

  const renderSalaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.burbuja}
      onPress={() => navigation.navigate('ProductosSalas', { salaId: item.id, idDelUsuarioQueIngreso: idDelUsuarioQueIngreso })}
    >
      <View style={styles.detalles}>
        <Text style={styles.nombre}>Sala: {item.id}</Text>
        <Text>Categoría: {categorias[item.id_categoria_fk] || "Sin categoría"}</Text>
        <Text>Fecha inicio: {item.fecha_ini}</Text>
        <Text>Hora inicio: {item.hora_ini}</Text>
        <Text>Hora fin: {item.hora_fin}</Text>
        <Text>Número de productos: {item.nro_productos}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
            <Image
              source={require('../../assets/images/logo.png')} // Ruta relativa a tu archivo
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
      <Text style={styles.header}>Salas de {nombreUsuario || '...' }</Text>
      {salas.length === 0 ? (
        <Text>No hay salas disponibles para este usuario.</Text>
      ) : (
        <FlatList
          data={salas}
          keyExtractor={(item) => item.id}
          renderItem={renderSalaItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007BFF',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
    //marginTop: 30,
  },
  burbuja: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  detalles: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default Salas;

