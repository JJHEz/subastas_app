import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where, getDoc, doc, deleteDoc,updateDoc} from "firebase/firestore";
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
  const eliminarProducto = async (idProducto) => {
    try {
      await deleteDoc(doc(database, "producto", idProducto));
      setProductosSubidos(prev => prev.filter(p => p.id !== idProducto));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const actualizarMartilleroDelProducto = async (producto) => {
  try {
    const martillerosSnapshot = await getDocs(collection(database, "martillero"));
    const ahora = new Date();

    let nuevoIdMartillero = null;

    martillerosSnapshot.forEach(docMart => {
      const data = docMart.data();
      const [dia, mes, anio] = data.fecha_ini.split('-').map(Number);
      const [hora, minuto] = data.hora_ini.split(':').map(Number);
      const fechaHoraMartillero = new Date(anio, mes - 1, dia, hora, minuto);

      if (fechaHoraMartillero > ahora && !nuevoIdMartillero) {
        nuevoIdMartillero = parseInt(docMart.id); // Asumiendo que el ID es numérico
        console.log(`Nuevo martillero seleccionado: ${nuevoIdMartillero}`);
      }
    });

    if (!nuevoIdMartillero) {
      console.log("No hay martilleros disponibles con fecha futura.");
      return;
    }

    // Actualizar en Firebase
    const productoRef = doc(database, "producto", producto.id);
    await updateDoc(productoRef, { id_martillero_fk: nuevoIdMartillero });

    // Actualizar estado local sin recargar
    setProductosSubidos(prev =>
      prev.map(p =>
        p.id === producto.id
          ? { ...p, id_martillero_fk: nuevoIdMartillero, estadoVenta: "en_publicacion" }
          : p
      )
    );
  } catch (error) {
    console.error("Error al actualizar martillero del producto:", error);
  }
}; 
  
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

    const productos = await Promise.all(querySnapshot.docs.map(async docProd => {
      const data = docProd.data();
      const idMartillero = data.id_martillero_fk;
      let estadoVenta = "";

      if (data.vendido) {
        estadoVenta = "vendido";
      } else {
        try {
          const martilleroDoc = await getDoc(doc(database, "martillero", String(idMartillero)));
          if (martilleroDoc.exists()) {
            const martilleroData = martilleroDoc.data();
            const [dia, mes, anio] = martilleroData.fecha_ini.split('-').map(Number);
            const [hora, minuto] = martilleroData.hora_ini.split(':').map(Number);
            const fechaHoraMartillero = new Date(anio, mes - 1, dia, hora, minuto);
            const ahora = new Date();

            if (fechaHoraMartillero > ahora) {
              estadoVenta = "en_publicacion";
            } else {
              estadoVenta = "no_vendido";
            }
          }
        } catch (e) {
          console.error("Error al obtener datos del martillero:", e);
        }
      }

      return {
        id: docProd.id,
        ...data,
        estadoVenta,
      };
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

    >
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{item.nombre_producto}</Text>
        <Text>Estado: {item.estado_del_producto}</Text>
        <Text>Vendido: {item.vendido ? "Sí" : "No"}</Text>
        <Text>Precio inicial: ${item.precio_base}</Text>
        <Text>Ubicación: {item.ubicacion}</Text>

        {/* Texto adicional basado en estadoVenta */}
        {item.estadoVenta === "vendido" && (
          <Text style={{ color: 'green', fontWeight: 'bold' }}>Vendido con éxito</Text>
        )}
        {item.estadoVenta === "en_publicacion" && (
          <Text style={{ color: 'blue', fontWeight: 'bold' }}>Producto en publicación</Text>
        )}
        {item.estadoVenta === "no_vendido" && (
          <>
      <Text style={{ color: 'red', fontWeight: 'bold' }}>Su producto no se logró vender</Text>

      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity
          style={[styles.boton, { backgroundColor: '#4CAF50' }]}
          onPress={() => actualizarMartilleroDelProducto(item)}
        >
          <Text style={styles.botonTexto}>Publicar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, { backgroundColor: '#F44336', marginLeft: 10 }]}
          onPress={() => eliminarProducto(item.id)}
        >
          <Text style={styles.botonTexto}>Retirar</Text>
        </TouchableOpacity>
      </View>
    </>
        )}
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
    //marginTop: 30,
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
  boton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 10,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MisProductos;


