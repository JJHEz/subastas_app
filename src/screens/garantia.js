import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';

export default function Garantia() {
  //const { producto, user} = route.params;

  const [qrData, setQrData] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [estadoPago, setEstadoPago] = useState('pendiente');
  const usuarioID = 'U123';
  const subastaID = 'S456';
  const monto = 100;

  /*useEffect(() => {
    // Opcionalmente puedes usar el usuario y producto aquí si es necesario.
    console.log("Usuario:", usuario);
    console.log("Producto:", producto);
  }, [usuario, producto]);*/

  const generarQR = () => {
    const fecha = new Date().toISOString();
    const contenidoQR = `usuario:${usuarioID};subasta:${subastaID};monto:${monto};fecha:${fecha}`;
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

  const enviarComprobante = () => {
    if (!imageUri) return;
    setEstadoPago('enRevision');
    setTimeout(() => {
      setEstadoPago('validado');
    }, 3000);
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
              source={require('../../assets/images/subir-archivo.png')} // puedes usar un ícono de clip 📎
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

          <TouchableOpacity>
            <Text style={styles.textoSaltar}>Saltar</Text>
          </TouchableOpacity>

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