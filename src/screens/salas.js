import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import database from "../config/firebase";
import { useRoute } from '@react-navigation/native';

const Salas = ({ navigation }) => {

  const route = useRoute();
  const { idUsuario } = route.params;
  const idDelUsuarioQueIngreso = idUsuario;  //--------> Pueden usar este id para hacer todas sus consultas en la base de datos
  console.log("id de sala Xd con usuario.- " + idDelUsuarioQueIngreso);

  const userId = parseInt(idUsuario);  // Aquí defines el ID del usuario de manera constante, puedes modificar este valor.

  const [salas, setSalas] = useState([]);
  const [categorias, setCategorias] = useState({});  // Aquí almacenamos las categorías
  const [nombreUsuario, setNombreUsuario] = useState("");

  // Función para obtener las categorías
  const fetchCategorias = async () => {
    try {
      const snapshot = await getDocs(collection(database, "categoria"));
      const categoriasData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        categoriasData[doc.id] = data.nombre_categoria;
      });
      setCategorias(categoriasData);  // Guardamos las categorías en el estado
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  // Función para obtener las salas filtradas por id de usuario
  const fetchSalas = async () => {
    try {
      // Aquí filtramos las salas donde el array 'participantes' contiene el id del usuario (userId).
      const salasQuery = query(
        collection(database, "martillero"), 
        where("participantes", "array-contains", userId)  // Filtrar por el id del usuario (ya es un número)
      );
      
      // Ejecutamos la consulta
      const querySnapshot = await getDocs(salasQuery);
      const salasData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        salasData.push({ id: doc.id, ...data });
      });

      // Guardamos las salas filtradas en el estado
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
        setNombreUsuario(data.nombre); // Ajusta si el campo se llama diferente
      } else {
        console.warn("No se encontró el usuario con ese ID.");
      }
    } catch (error) {
      console.error("Error al obtener el nombre del usuario:", error);
    }
  };

  useEffect(() => {
    fetchCategorias(); // Llamamos a la función que obtiene las categorías
    fetchSalas();  // Llamamos a la función que obtiene las salas filtradas por el userId
    fetchNombreUsuario(); // Llamamos a la función que obtiene el nombre del usuario
  }, [userId]);

  const renderSalaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.burbuja}  // Estilo similar al de los productos en Home.js
      onPress={() => navigation.navigate('ProductosSalas', { salaId: item.id, idDelUsuarioQueIngreso:idDelUsuarioQueIngreso })}
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
      <Text style={styles.header}>Salas de {nombreUsuario || `usuario ${userId}`}</Text>
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
  detalles: {
    flex: 1, // Los detalles ocupan el resto del espacio
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default Salas;
