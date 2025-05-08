import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { useRoute } from '@react-navigation/native';

const Productos_inscritos = ({ navigation }) => {
  const [productosInscritos, setProductosInscritos] = useState([]);
  const { id } = useRoute().params;  // Captura el ID del usuario desde la URL

  useEffect(() => {
    const fetchProductosInscritos = async () => {
      try {
        // Obtener los productos inscritos del usuario (filtrando por id_usuario_fk)
        const q = query(collection(db, "productos_inscritos"), where("id_usuario_fk", "==", id));
        const querySnapshot = await getDocs(q);
        const productosIds = [];

        querySnapshot.forEach((doc) => {
          productosIds.push(doc.data().id_producto_fk);  // Extrae los ID de productos inscritos
        });

        if (productosIds.length === 0) {
          console.log("No se encontraron productos inscritos para este usuario.");
          setProductosInscritos([]);  // Si no se encuentran productos, vaciar el estado
          return;
        }

        console.log("IDs de productos inscritos:", productosIds);

        // Ahora, obtenemos los detalles de esos productos usando los IDs
        const productosDetalles = await obtenerProductosDetalles(productosIds);
        setProductosInscritos(productosDetalles);
        
      } catch (error) {
        console.error("Error al obtener productos inscritos:", error);
      }
    };

    fetchProductosInscritos();
  }, [id]);

  // Función para obtener los detalles completos de los productos usando sus IDs
  const obtenerProductosDetalles = async (productosIds) => {
    const productosDetalles = [];
    for (let idProducto of productosIds) {
      const productoSnapshot = await getDocs(query(collection(db, "producto"), where("id", "==", idProducto)));
      productoSnapshot.forEach((doc) => {
        productosDetalles.push(doc.data());  // Agregar los detalles del producto
      });
    }
    return productosDetalles;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.burbuja}
      onPress={() => navigation.navigate('Producto', { producto: item })}
    >
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{item.nombre_producto}</Text>
        <Text>Estado: {item.estado_del_producto}</Text>
        <Text>Base: ${item.precio_base}</Text>
        <Text>Ubicación: {item.ubicacion}</Text>
        <Text>Inicio: {item.fecha_de_subasta} a las {item.hora_de_subasta}</Text>
        <Text>Fin: {item.hora_fin_subasta}</Text>
        <Text>Vendido: {item.vendido ? "Sí" : "No"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#007BFF" }}>
      {
        productosInscritos.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>No tienes productos inscritos.</Text>
          </View>
        ) : (
          <FlatList
            data={productosInscritos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.container}
          />
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  burbuja: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    flexDirection: "row", // Alineación horizontal de imagen y detalles
    alignItems: "center", // Alineación vertical de imagen y texto
  },
  imagen: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 20,
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

export default Productos_inscritos;





/*import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { useRoute } from '@react-navigation/native';

const Productos_inscritos = ({ navigation }) => {
  const [productosInscritos, setProductosInscritos] = useState([]);
  const { id } = useRoute().params;  // Captura el ID del usuario desde la URL

  useEffect(() => {
    const fetchProductosInscritos = async () => {
      try {
        // Obtener los productos inscritos del usuario (filtrando por id_usuario_fk)
        const q = query(collection(db, "productos_inscritos"), where("id_usuario_fk", "==", id));
        const querySnapshot = await getDocs(q);
        const productosIds = [];

        querySnapshot.forEach((doc) => {
          productosIds.push(doc.data().id_producto_fk);  // Extrae los ID de productos inscritos
        });

        setProductosInscritos(productosIds);
      } catch (error) {
        console.error("Error al obtener productos inscritos:", error);
      }
    };

    fetchProductosInscritos();
  }, [id]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.burbuja}
      onPress={() => navigation.navigate('Producto', { id: item })}
    >
      <Text style={styles.nombre}>Producto ID: {item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#007BFF" }}>
      {
        productosInscritos.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>No tienes productos inscritos.</Text>
          </View>
        ) : (
          <FlatList
            data={productosInscritos}
            keyExtractor={(item) => item.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.container}
          />
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  burbuja: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default Productos_inscritos;
*/