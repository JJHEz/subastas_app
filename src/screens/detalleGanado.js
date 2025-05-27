import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

const DetalleGanado = ({ route, navigation }) => {
  const { producto, userId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.burbuja}>
        <Image source={{ uri: producto.imagen }} style={styles.imagen} />
        
        <View style={styles.detalles}>
          <Text style={styles.nombre}>{producto.nombre_producto}</Text>
          <Text>Categoría: {producto.nombre_categoria || 'Sin categoría'}</Text>
          <Text>Estado: {producto.estado_del_producto}</Text>
          <Text>Base: ${producto.precio_base}</Text>
          <Text>Ubicación: {producto.ubicacion}</Text>
          <Text>Inicio: {producto.fecha_de_subasta} a las {producto.hora_de_subasta}</Text>
          <Text>Fin: {producto.hora_fin_subasta}</Text>
          <Text>Vendido: {producto.vendido ? "Sí" : "No"}</Text>
          <Text>Descripción: {producto.descripcion_producto || 'Sin descripción'}</Text>
        </View>
      </View>  

      <View style={styles.botones}>
        <TouchableOpacity style={styles.botonInscribirse} onPress={() => /*alert('Inscrito')*/ navigation.navigate('Pagoproducto')}>
          <Text style={styles.textoBoton}>Inscribirse a subasta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonParticipar} onPress={() => navigation.goBack()}>
          <Text style={styles.textoBoton}>Participar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007BFF",
    padding: 15,
  },
  burbuja: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  imagen: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#ccc", // en caso de que no cargue la imagen
  },
  detalles: {
    width: "100%",
  },
  nombre: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  texto: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "center",
  },
  botones: {
    alignItems: "center",
    marginTop: 10,
  },
  botonInscribirse: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  botonParticipar: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  textoBoton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});


export default DetalleGanado;