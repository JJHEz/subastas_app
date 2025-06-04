import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import database from '../config/firebase';

export default function Garantia() {
  const [qrData, setQrData] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [estadoPago, setEstadoPago] = useState('pendiente');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [comprobanteGenerado, setComprobanteGenerado] = useState(false); // Para verificar si se generó el comprobante
  const route = useRoute();
  const { userId, productoId, producto } = route.params || {};
  const navigation = useNavigation();
  const idSala = producto?.id_martillero_fk;
  const garantia = producto?.garantia || 0; // Asignar un valor por defecto si no existe
  const usuarioID = userId;  // ID de usuario asignado dinamicamente 
  const subastaID = idSala; // ID de sala que pertenece al producto
  const monto = garantia; // Monto de la garantía del producto
  const usuarioIDNum = Number(usuarioID);
  const idSalaStr = String(idSala);
  const idUsuario = usuarioID;


  // Generación del QR
  const generarQR = () => {
    const fecha = new Date().toISOString();
    const contenidoQR = `usuario:${usuarioID};subasta:${subastaID};monto:${monto};fecha:${fecha}`;
    setQrData(contenidoQR);
  };

  // Obtener nombre y email de usuario desde Firestore
  const [emailUsuario, setEmailUsuario] = useState('');

const obtenerNombrePorId = async (usuarioId) => {
  try {
    const docRef = doc(database, 'usuario', usuarioId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setNombreUsuario(data.nombre);
      setEmailUsuario(data.correo_electronico);  // Guardar el correo
    } else {
      setNombreUsuario(null);
      setEmailUsuario(null);
    }
  } catch (error) {
    setNombreUsuario(null);
    setEmailUsuario(null);
  }
};


  // Llamamos a obtenerNombrePorId solo cuando el componente se monta
  useEffect(() => {
    obtenerNombrePorId(usuarioID);  // Llamada a Firestore para obtener el nombre
  }, []);  // El array vacío asegura que solo se llame una vez al cargar el componente

  // Subir comprobante
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
      const pagosSnapshot = await getDocs(collection( database, 'pago'));
      const idsNumericos = pagosSnapshot.docs
        .map(doc => parseInt(doc.id))
        .filter(id => !isNaN(id));

      const nuevoID = idsNumericos.length > 0
        ? (Math.max(...idsNumericos) + 1).toString()
        : '1';

      await setDoc(doc( database, 'pago', nuevoID), {
        usuario_fk: usuarioID,
        estado: false,
        monto: monto,
        fecha_ini: obtenerFechaActual(),
        fecha_fin: obtenerFechaActual(),
        id_oferta_fk: 1,
      });
  // Actualizar array participantes en martillero (sala)
    if (idSala) {
      const salaRef = doc(database, 'martillero', idSalaStr);
      await updateDoc(salaRef, {
        participantes: arrayUnion(usuarioIDNum)
      });
    }
      console.log(`✅ Pago guardado con ID: ${nuevoID}`);
      setEstadoPago('validado');
      setTimeout(() => {
        navigation.navigate('TabNavigator',{idUsuario});
      }, 1500);

    } catch (error) {
      console.error('Error al guardar el pago:', error.message);
    }
/////////////////////////////
    try {
    const response = await fetch('https://4433-190-129-196-78.ngrok-free.app/send-payment-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailUsuario,
        nombre: nombreUsuario
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Correo de confirmación enviado');
      setEstadoPago('validado');  // O el estado que quieras asignar
    } else {
      console.error('Error al enviar correo:', data.error);
    }
  } catch (error) {
    console.error('Error en fetch:', error.message);
  }
  };

  const renderEstadoPago = () => {
    if (estadoPago === 'pendiente') return null;
    if (estadoPago === 'enRevision') return <ActivityIndicator size="large" color="#007BFF" />;
    if (estadoPago === 'validado') return <Text style={styles.estadoValidado}>✅ Pago Validado</Text>;
  };

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

        <View style={styles.card}>
          <Text style={styles.titulo}>¿Desea participar en subastas?</Text>
          <Text style={styles.subtitulo}>Pago QR</Text>

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
            <Text style={styles.checkboxTexto}>☑ Beneficios del pago de garantía</Text>
          </View>

          <TouchableOpacity style={styles.botonPagar} onPress={enviarComprobante} disabled={!imageUri}>
            <Text style={styles.textoBoton}>Pagar</Text>
          </TouchableOpacity>

          {/*<TouchableOpacity onPress={() => navigation.navigate('Home',{usuarioID})}>
            <Text style={styles.textoSaltar}>Saltar</Text>
          </TouchableOpacity>*/}

          <View style={{ marginTop: 10 }}>{renderEstadoPago()}</View>
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
