import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

//home donde se muestran todos los productos

const Home = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categoriasMap, setCategoriasMap] = useState({});
  const [categoriasCargadas, setCategoriasCargadas] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const snapshot = await getDocs(collection(db, "categoria"));
        const map = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          map[doc.id] = data.nombre_categoria;
        });
        setCategoriasMap(map);
        setCategoriasCargadas(true);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
  
    fetchCategorias();
  }, []);
  
  useEffect(() => {
    if (!categoriasCargadas) return;

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "producto"));
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const nombreCategoria = categoriasMap[String(data.id_categoria_fk)] || "Sin categoría";
          items.push({ id: doc.id, ...data, nombre_categoria: nombreCategoria });
        });
        console.log("Productos cargados:", items); // controlador de error DEBUG
        setProductos(items);
        setProductosFiltrados(items);
      } catch (error) {
        console.error("Error al obtener productos:", error); // controlador de error DEBUG
      }
    };
  
    fetchData();
  }, [categoriasCargadas]);

  const filtrarProductos = (texto) => {
    setBusqueda(texto);
    const filtrados = productos.filter((item) =>
      item.nombre_producto.toLowerCase().includes(texto.toLowerCase())
    );
    setProductosFiltrados(filtrados);
  };
  

  const renderItem = ({ item }) => ( 
    <TouchableOpacity
      style={styles.burbuja}
      onPress={() => navigation.navigate('Producto', { producto: item })}
    >
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{item.nombre_producto}</Text>
        <Text style={{ fontStyle: 'italic' }}>Categoría: {item.nombre_categoria}</Text>
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
        productos.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>No hay productos para mostrar.</Text>
        </View>
    ) : (
      <>
          <TextInput
            style={styles.buscador}
            placeholder="Buscar producto..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={filtrarProductos}
          />
          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.container}
          />
      </>
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
    flexDirection: "row", // Importante: alinearlos en fila
    alignItems: "center", // Alinea imagen y texto verticalmente
  },
  buscador: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 15,
    fontSize: 16,
  }, 
  imagen: {
    width: 150,  // Tamaño fijo
    height: 150,
    borderRadius: 10,
    marginRight: 20, // Espacio entre imagen y detalles
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

export default Home;