import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { collection, getDocs } from "firebase/firestore";
import database from "../config/firebase";


//home donde se muestran todos los productos

const Home = ({ navigation, route }) => {
  const { id: usuarioId } = route.params || {}; // captura el id del usuario desde la URL
  const [userId, setUserId] = useState(usuarioId || null); // guarda el id para uso libre

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const [categoriasMap, setCategoriasMap] = useState({});
  const [categoriasCargadas, setCategoriasCargadas] = useState(false);

  const [open, setOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [categoriasDropDown, setCategoriasDropDown] = useState([]);
  
  useEffect(() => {
    if (userId) {
      console.log("Usuario ID desde la URL:", userId);
    }
  }, [userId]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const snapshot = await getDocs(collection(database, "categoria"));
        const map = {};
        const listaDropDown = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          map[doc.id] = data.nombre_categoria;
          listaDropDown.push({ label: data.nombre_categoria, value: doc.id });
        });
        setCategoriasMap(map);
        setCategoriasDropDown(listaDropDown);
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
        const querySnapshot = await getDocs(collection(database, "producto"));
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const nombreCategoria = categoriasMap[String(data.id_categoria_fk)] || "Sin categoría";
          
          if (data.vendido === false) {
            items.push({ id: doc.id, ...data, nombre_categoria: nombreCategoria });
          }
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

  const filtrarProductos = (texto, categoria = categoriaSeleccionada || '') => {
    setBusqueda(texto);
    const textoLower = texto.toLowerCase();

    const filtrados = productos.filter((item) => {
      const coincideNombre = item.nombre_producto.toLowerCase().includes(textoLower);
      const coincideCategoria = categoria === '' || String(item.id_categoria_fk) === String(categoria);
      return coincideNombre && coincideCategoria;      
    });

    setProductosFiltrados(filtrados);
  };
  
  const filtrarPorCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    filtrarProductos(busqueda, categoria);
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
            onChangeText={(texto) => filtrarProductos(texto)}
          />
          <Text style={styles.label}>Categoría:</Text>

          <DropDownPicker
            open={open}
            value={categoriaSeleccionada}
            items={[{ label: 'Todas las categorías', value: '' }, ...categoriasDropDown]}
            setOpen={setOpen}
            setValue={(callback) => {
              const value = callback(categoriaSeleccionada);
              setCategoriaSeleccionada(value);
              filtrarProductos(busqueda, value);
            }}
            setItems={setCategoriasDropDown}
            placeholder="Selecciona una categoría"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={1000}
            zIndexInverse={3000}
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
    zIndex: 1,
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
  label: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    marginBottom: 2,
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderRadius: 15,
    zIndex: 1000,
    width: '97%',
  },
  dropdownContainer: {
    marginHorizontal: 10,
    borderColor: '#ccc',
    borderRadius: 15,
    zIndex: 1000,
    width: '97%',
  },
  imagen: {
    width: 150,  // Tamaño fijo
    height: 150,
    borderRadius: 10,
    marginRight: 20, // Espacio entre imagen y detalles
    backgroundColor: '#ccc',
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