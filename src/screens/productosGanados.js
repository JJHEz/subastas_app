import React, { useState, useCallback } from 'react'; 
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useRoute, useFocusEffect } from '@react-navigation/native';
import database from "../config/firebase";
import { Linking } from 'react-native';

const ProductosGanados = ({ navigation }) => {
  const route = useRoute();
  const { idUsuario } = route.params || {};
  const usuarioId = parseInt(idUsuario);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [productosGanados, setProductosGanados] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Fetch nombre del usuario
  const fetchNombreUsuario = async () => {
    try {
      const docRef = doc(database, "usuario", idUsuario);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombreUsuario(data.nombre);
      }
    } catch (error) {
      console.error("Error al obtener nombre del usuario:", error);
    }
  };

  // Fetch productos ganados
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

            // Obtener el teléfono del publicador utilizando el id_usuario_fk
            const usuarioPublicadorRef = doc(database, "usuario", String(producto.id_usuario_fk));
            const usuarioPublicadorSnap = await getDoc(usuarioPublicadorRef);
            const telefonoPublicador = usuarioPublicadorSnap.exists() ? usuarioPublicadorSnap.data().telefono : '';

            productosGanadosTemp.push({
              id: productoSnap.id,
              ...producto,
              precio_ganado: oferta.precio_oferta_actual,
              pagado: producto.pagado || false,  // Obtenemos el estado de pago directamente desde la tabla "producto"
              telefono_publicador: telefonoPublicador, // Obtenemos el teléfono del publicador
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
        fetchNombreUsuario();
        fetchProductosGanados();
      }
    }, [usuarioId])
  );

  // Función que redirige a WhatsApp
  const handleRedirectToWhatsapp = (telefonoPublicador) => {
    const numeroWhatsApp = '591' + telefonoPublicador; // Asegúrate de tener el código de país
    const mensaje = `Hola, soy ${nombreUsuario} y ya subí el comprobante de pago del producto.`;
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    Linking.openURL(urlWhatsApp);  // Redirige a WhatsApp
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        // Si el producto no está pagado, permitir la navegación
        if (!item.pagado) {
          navigation.navigate('pagoproducto', {
            idUsuario: String(usuarioId),
            idProducto: item.id,
            producto: item
          });
        }
      }}
    >
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{item.nombre_producto}</Text>
        <Text>Estado: {item.estado_del_producto}</Text>
        <Text>Ganado por: ${item.precio_ganado}</Text>
        <Text>Ubicación: {item.ubicacion}</Text>
        {/* Mostrar mensaje de estado de pago */}
        <Text style={{ fontWeight: 'bold', color: item.pagado ? 'green' : 'red' }}>
          {item.pagado ? "Pagado" : "No pagado"}
        </Text>
        {item.pagado && (
          <>
            <Text style={{ color: 'green', fontWeight: 'bold' }}>✅ Este producto ya ha sido pagado</Text>
            {/* Redirigir a WhatsApp si ya está pagado */}
            <TouchableOpacity onPress={() => handleRedirectToWhatsapp(item.telefono_publicador)} style={styles.botonWhatsapp}>
              <Text style={styles.botonTexto}>Contactarse con vendedor WhatsApp</Text>
            </TouchableOpacity>
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

      <Text style={styles.header}>Productos ganados por {nombreUsuario ? nombreUsuario : '...'}</Text>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
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
  botonWhatsapp: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductosGanados;
