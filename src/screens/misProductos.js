import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { useRoute, useFocusEffect } from '@react-navigation/native';
import database from "../config/firebase";
import { FAB } from 'react-native-paper';

const MisProductos = ({ navigation }) => {
  const route = useRoute();
  const { idUsuario } = route.params || {};
  const idDelUsuarioQueIngreso = idUsuario;
  const usuarioId = parseInt(idUsuario);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [productosSubidos, setProductosSubidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fetchNombreUsuario = async () => {
    try {
      const docRef = doc(database, "usuario", String(usuarioId));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombreUsuario(data.nombre);
      }
    } catch (error) {
      console.error("Error al obtener nombre del usuario:", error);
    }
  };
  
  const fetchProductosSubidos = async () => {
    try {
      const productosQuery = query(
        collection(database, "producto"),
        where("id_usuario_fk", "==", usuarioId)
      );

      const querySnapshot = await getDocs(productosQuery);
      const productos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProductosSubidos(productos);
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener productos subidos:", error);
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (usuarioId) {
        setCargando(true);
        fetchNombreUsuario();
        fetchProductosSubidos();
      }
    }, [usuarioId])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Producto', { idProducto: item.id, producto: item })}
    >
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{item.nombre_producto}</Text>
        <Text>Estado: {item.estado_del_producto}</Text>
        <Text>Vendido: {item.vendido ? "Sí" : "No"}</Text>
        <Text>Precio inicial: ${item.precio_base}</Text>
        <Text>Ubicación: {item.ubicacion}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#E6F0FF', padding: 10 }}>
      <View style={{ alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
      <Image
        source={require('../../assets/images/logo.png')} // Ruta relativa a tu archivo
        style={styles.logo}
        resizeMode="contain"
      />
    </View>

      <Text style={styles.header}>Productos subidos por {nombreUsuario ? nombreUsuario : '...'}</Text>
      {cargando ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando tus productos...</Text>
      ) : productosSubidos.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No has subido ningún producto.</Text>
      ) : (
        <FlatList
          data={productosSubidos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("subirProducto", { idDelUsuarioQueIngreso })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
    marginTop: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  imagen: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  detalles: {
    flex: 1,
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: '#BB6161',
  },
});

export default MisProductos;


