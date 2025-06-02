import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useRoute, useFocusEffect } from '@react-navigation/native';
import database from "../config/firebase";
import { TouchableOpacity } from 'react-native';

const ProductosGanados = ({ navigation }) => {
  const route = useRoute();
  const { idUsuario } = route.params || {};
  const usuarioId = parseInt(idUsuario);

  const [productosGanados, setProductosGanados] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fetchProductosGanados = async () => {
    try {
      const ofertasSnapshot = await getDocs(collection(database, "oferta"));
      const productosGanadosTemp = [];

      for (const ofertaDoc of ofertasSnapshot.docs) {
        const oferta = ofertaDoc.data();

        if (String(oferta.id_usuario) === String(usuarioId)) {
          const productoRef = doc(database, "producto", String(oferta.id_producto_fk));
          const productoSnap = await getDoc(productoRef);

          if (productoSnap.exists()) {
            const producto = productoSnap.data();
            productosGanadosTemp.push({
              id: productoSnap.id,
              ...producto,
              precio_ganado: oferta.precio_oferta_actual,
            });
          }
        }
      }

      setProductosGanados(productosGanadosTemp);
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener productos ganados:", error);
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (usuarioId) {
        setCargando(true);
        fetchProductosGanados();
      }
    }, [usuarioId])
  );

const renderItem = ({ item }) => (
  <TouchableOpacity 
    style={styles.card} 
    onPress={() => navigation.navigate('pagoproducto', {
      idUsuario: String(usuarioId),
      idProducto: item.id,
      producto: item
    })}
  >
    <Image source={{ uri: item.imagen }} style={styles.imagen} />
    <View style={styles.detalles}>
      <Text style={styles.nombre}>{item.nombre_producto}</Text>
      <Text>Estado: {item.estado_del_producto}</Text>
      <Text>Ganado por: ${item.precio_ganado}</Text>
      <Text>Ubicación: {item.ubicacion}</Text>
    </View>
  </TouchableOpacity>
);

  return (
    <View style={{ flex: 1, backgroundColor: '#E6F0FF', padding: 10 }}>
      {cargando ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando productos ganados...</Text>
      ) : productosGanados.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No tienes productos ganados.</Text>
      ) : (
        <FlatList
          data={productosGanados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
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
});

export default ProductosGanados;

