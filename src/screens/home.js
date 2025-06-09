import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { collection, getDocs } from "firebase/firestore";
import database from "../config/firebase";
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { FAB } from 'react-native-paper';

const Home = ({ navigation }) => {
  const route = useRoute();
  const { idUsuario } = route.params;
  const idDelUsuarioQueIngreso = idUsuario;

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const [categoriasMap, setCategoriasMap] = useState({});
  const [categoriasCargadas, setCategoriasCargadas] = useState(false);
  const [productosCargados, setProductosCargados] = useState(false);

  const [open, setOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [categoriasDropDown, setCategoriasDropDown] = useState([]);
  const [nombreUsuario, setNombreUsuario] = useState("");

  // Carga categorías y productos cada vez que la pantalla está en foco
  useFocusEffect(
    useCallback(() => {
      if (categoriasCargadas && productosCargados) return;

      const fetchNombreUsuario = async () => {
        try {
          const snapshot = await getDocs(collection(database, "usuario"));
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (String(doc.id) === String(idDelUsuarioQueIngreso)) {
              setNombreUsuario(data.nombre);
            }
          });
        } catch (error) {
          console.error("Error al obtener el nombre del usuario:", error);
        }
      };

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

      const fetchProductos = async () => {
        if (!categoriasCargadas) return;
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

          setProductos(items);
          setProductosFiltrados(items);
          setProductosCargados(true);
        } catch (error) {
          console.error("Error al obtener productos:", error);
        }
      };

      fetchNombreUsuario();
      // Primero cargar categorías y después productos
      fetchCategorias().then(() => fetchProductos());

      return () => {
        // Limpieza si necesaria
      };
    }, [categoriasCargadas, categoriasMap, productosCargados])
  );

  // Función para actualizar los productos automáticamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Actualizando productos...');
      setProductosCargados(false); // Esto hará que se recarguen los productos.
    }, 15000); // 15 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

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
      onPress={() => navigation.navigate('Producto', { producto: item, userId: idDelUsuarioQueIngreso })}
    >
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{item.nombre_producto}</Text>
        <Text style={{ fontStyle: 'italic' }}>Categoría: {item.nombre_categoria}</Text>
        <Text>Estado: {item.estado_del_producto}</Text>
        <Text>Base: ${item.precio_base}</Text>
        <Text>Ubicación: {item.ubicacion}</Text>
        <Text>Vendido: {item.vendido ? "Sí" : "No"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#007BFF", padding: 10 }}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/logo.png')} // Ruta relativa a tu archivo
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.bienvenida}>Bienvenido {nombreUsuario ? nombreUsuario : '...'} !!!</Text>
      {productos.length === 0 ? (
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
              filtrarPorCategoria(value);
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
  container: {
    padding: 10,
    zIndex: 1,
  },
  burbuja: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  bienvenida: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
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
    width: '95.1%',
  },
  dropdownContainer: {
    marginHorizontal: 10,
    borderColor: '#ccc',
    borderRadius: 15,
    zIndex: 1000,
    width: '97%',
  },
  imagen: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 20,
    backgroundColor: '#ccc',
  },
  detalles: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: '#BB6161',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
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
  }
});

export default Home;
