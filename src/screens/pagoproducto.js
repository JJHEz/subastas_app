import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import database  from '../config/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';

export default function PagoProducto() {
  const [montoProducto, setMontoProducto] = useState(null);
  const [montoGarantia, setMontoGarantia] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [qrData, setQrData] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [estadoPago, setEstadoPago] = useState('pendiente');
  const [telefonoPublicador, setTelefonoPublicador] = useState('');
  const route = useRoute();
  const { idUsuario, idProducto, producto } = route.params || {};
  const productoIDnum = Number(idProducto);
  const navigation = useNavigation();
  // IDs para obtener los documentos
  const productoID = idProducto;
  const martilleroID = String(producto?.id_martillero_fk); 
  const usuarioID = idUsuario;
  const tipopago = 'Producto';
  const idUsuarioProducto = String(producto?.id_usuario_fk);
  
  // Obtener datos usuario, producto y garantía
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // oferta
        const pagosRef = collection(database, 'oferta');
        const q = query(pagosRef, where('id_producto_fk', '==', productoIDnum));

        const querySnapshot = await getDocs(q);
        let precioOfertado = 0;
        
        querySnapshot.forEach((doc) => {
        // Aquí accedemos al campo 'precio_oferta_actual' de cada oferta
        const ofertaData = doc.data();
        precioOfertado = ofertaData.precio_oferta_actual || 0;
        console.log(doc.id, " => ", ofertaData);
        });
        setMontoProducto(precioOfertado);  
       
        // Garantía
        const docGarantia = await getDoc(doc(database, 'martillero', martilleroID));
        setMontoGarantia(docGarantia.exists() ? docGarantia.data().garantia || 0 : 0);

        // Usuario
        const docUsuario = await getDoc(doc(database, 'usuario', usuarioID));
        setNombreUsuario(docUsuario.exists() ? docUsuario.data().nombre || '' : '');

        // Usuario que publicó el producto
        const docUsuarioPublicador = await getDoc(doc(database, 'usuario', idUsuarioProducto));
        if (docUsuarioPublicador.exists()) {
          setTelefonoPublicador(docUsuarioPublicador.data().telefono || '');
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setMontoProducto(0);
        setMontoGarantia(0);
        setNombreUsuario('');
        setTelefonoPublicador('');
      }
    };

    fetchDatos();
  }, []);

  const montoTotalAPagar = (montoProducto || 0) - (montoGarantia || 0);

  const generarQR = () => {
    const fecha = new Date().toISOString();
    const contenidoQR = `usuario:${usuarioID};subasta:S456;monto:${montoTotalAPagar};fecha:${fecha}`;
    setQrData(contenidoQR);
  };

  const subirComprobante = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const enviarComprobante = async () => {
  if (!imageUri || !nombreUsuario) return;
  setEstadoPago('enRevision');

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}-${mes}-${anio}`;
  };

  try {
    // Guardar el pago/comprobante en Firestore
    await addDoc(collection(database, 'pagos'), {
      usuario: nombreUsuario,
      usuarioID: usuarioID,
      montoProducto: montoProducto,
      montoGarantia: montoGarantia,
      montoTotal: montoProducto - montoGarantia,
      fecha: obtenerFechaActual(),
      estado: 'Pendiente',
      tipopago: tipopago,
      martilleroID: martilleroID,
      productoID: productoID,
      comprobanteUri: imageUri,
    });

    setEstadoPago('validado');
    setTimeout(() => {
      const numeroWhatsApp = '591'+ telefonoPublicador;
      const mensaje = `Hola, soy ${nombreUsuario} y ya subí el comprobante de pago del producto.`;
      const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
      Linking.openURL(urlWhatsApp);  
      navigation.navigate('TabNavigator',{idUsuario});
      }, 1500);

  } catch (error) {
    console.error('Error guardando el comprobante en BD:', error);
    setEstadoPago('pendiente');
  }
};

  const renderEstadoPago = () => {
    if (estadoPago === 'pendiente') return null;
    if (estadoPago === 'enRevision') return <ActivityIndicator size="large" color="#007BFF" />;
    if (estadoPago === 'validado') return <Text style={styles.estadoValidado}>✅ Pago Validado</Text>;
  };

  if (montoProducto === null || montoGarantia === null || nombreUsuario === '') {
    return (
      <View style={[styles.fondo, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

        <View style={styles.card}>
          <Text style={styles.titulo}>¿Desea completar el pago?</Text>

          <Text style={styles.subtitulo}>Usuario: <Text style={{fontWeight:'bold'}}>{nombreUsuario}</Text></Text>

          <Text style={styles.subtitulo}>Detalles del pago</Text>
          <Text>Monto total del producto: <Text style={{fontWeight:'bold'}}>{montoProducto} Bs</Text></Text>
          <Text>Garantía: <Text style={{fontWeight:'bold'}}>{montoGarantia} Bs</Text></Text>
          <Text>Monto total a pagar: <Text style={{fontWeight:'bold'}}>{montoTotalAPagar} Bs</Text></Text>

          <Text style={[styles.subtitulo, { marginTop:20 }]}>Pago QR</Text>
          {qrData ? (
            <QRCode value={qrData} size={160} />
          ) : (
            <TouchableOpacity style={styles.qrPlaceholder} onPress={generarQR}>
              <Text style={styles.qrTexto}>Generar QR</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={subirComprobante} style={styles.botonSubir}>
            <Image
              source={require('../../assets/images/subir-archivo.png')}
              style={styles.iconoClip}
            />
            <Text style={styles.textoSubir}>Subir imagen de comprobante</Text>
          </TouchableOpacity>

          {imageUri !== '' && (
            <Image source={{ uri: imageUri }} style={styles.imagen} />
          )}

          <View style={styles.checkboxFake}>
            <Text style={styles.checkboxTexto}>☑ Acepto las condiciones de pago</Text>
          </View>

          <TouchableOpacity style={styles.botonPagar} onPress={enviarComprobante} disabled={!imageUri}>
            <Text style={styles.textoBoton}>Pagar</Text>
          </TouchableOpacity>

          {/*<TouchableOpacity>
            <Text style={styles.textoSaltar}>Saltar</Text>
          </TouchableOpacity>*/}

          <View style={{ marginTop: 10 }}>
            {renderEstadoPago()}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#007BFF',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  qrTexto: {
    color: '#555',
  },
  botonSubir: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconoClip: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  textoSubir: {
    color: '#6c757d',
    fontSize: 14,
  },
  imagen: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginVertical: 10,
  },
  checkboxFake: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  checkboxTexto: {
    color: '#6a0dad',
    fontSize: 13,
  },
  botonPagar: {
    backgroundColor: '#d2b48c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
  },
  textoSaltar: {
    color: '#555',
    fontSize: 14,
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  estadoValidado: {
    fontSize: 16,
    color: '#28a745',
    marginTop: 10,
    fontWeight: 'bold',
  },
});
