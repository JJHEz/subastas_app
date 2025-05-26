import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, getDocs, query, where, getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import database from "../config/firebase";

const ProductosSalas = ({ route, navigation }) => {
  const { salaId, idDelUsuarioQueIngreso } = route.params;  // Capturamos el ID de la sala desde los parámetros de la navegación
  const [productos, setProductos] = useState([]);
  const salaIdNumerico = parseInt(salaId, 10); // Convertir a número
  console.log("Número de sala: " + salaIdNumerico);

  const [martillero, setMartillero] = useState('');

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // Consulta para obtener productos filtrados por id_martillero_fk (ID de la sala)
        const productosQuery = query(
            collection(database, "producto"), 
            where("id_martillero_fk", "==", salaIdNumerico)
        );
        const querySnapshot = await getDocs(productosQuery);

        const productosData = [];
        querySnapshot.forEach((doc) => {
          productosData.push({ id: doc.id, ...doc.data() });
        });

        setProductos(productosData);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProductos(); // Llamamos a la función que obtiene los productos de la sala seleccionada
  }, [salaId]);

  const renderProductoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.burbuja}  // Estilo similar al de los productos en Home.js
      onPress={() => console.log(`Producto: ${item.nombre_producto}`)}  // Aquí podrías navegar a la pantalla de detalle del producto
    >
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{item.nombre_producto}</Text>
        <Text>{item.descripcion_producto}</Text>
        <Text>Precio base: ${item.precio_base}</Text>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const datosMartillero = async () => {
      try {
        const docRef = doc(database, 'martillero', salaIdNumerico.toString());
        const docSnap = await getDoc(docRef);
        const datosObtenidos = docSnap.data();
        setMartillero({
          fechaInicio: datosObtenidos.fecha_ini,
          horaInicio: datosObtenidos.hora_ini,
          horaFin: datosObtenidos.hora_fin
        });
      } catch (error) {
        console.log("Error al obtener el martillero: " + error);
      }
    }

    
    datosMartillero();
  
  }, []);

  const comenzarSubasta = async () => {
    try {
      const ref = doc(database, 'servidor', 'hora_temp');
      await setDoc(ref, { timestamp: serverTimestamp() });
      const snapshot = await getDoc(ref);
      const fechaHora = snapshot.data().timestamp.toDate();

      const dia = String(fechaHora.getDate()).padStart(2, '0');
      const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
      const anio = fechaHora.getFullYear();
      const fechaActual = `${dia}-${mes}-${anio}`;

      const horas = String(fechaHora.getHours()).padStart(2, '0');
      const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
      const horaActual = `${horas}:${minutos}`;

      console.log("Fecha (dd-mm-yyyy):", fechaActual);
      console.log("Hora (HH:MM):", horaActual);
      
      let fechaAct = new Date(...fechaActual.split('-').reverse().map((v, i) => i === 1 ? v - 1 : v));
      let fechaProgramada = new Date(...martillero.fechaInicio.split('-').reverse().map((v, i) => i === 1 ? v - 1 : v));

      if(fechaAct < fechaProgramada){
        alert("No comenzo la subasta, la fecha en la que inicia es " + martillero.fechaInicio);
      }else if(fechaAct.getTime() == fechaProgramada.getTime()){
        console.log("subasta comenzo");
        if(horaActual < martillero.horaInicio){
          alert("No comenzo la hora de subasta, comenzara a las " + martillero.horaInicio);
        }else if(horaActual >= martillero.horaFin){
          alert("La subasta finalizo a las " + martillero.horaFin);
        }else{
          navigation.navigate("ProductoEnSubasta", {idDelUsuarioQueIngreso:idDelUsuarioQueIngreso});
        }
      }else{
        alert("La subasta finalizo en la fecha " + martillero.fechaInicio);
      }
        
      } catch (error) {
        console.log("Error al obtener la hora y fecha: " + error);
      }
  }


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Productos de la Sala {salaId} </Text>

      <TouchableOpacity style={styles.botonInscribirse} onPress={comenzarSubasta}>
        <Text style={styles.textoBoton}>Ir a subasta</Text>
      </TouchableOpacity>

      {productos.length === 0 ? (
        <Text>No hay productos disponibles en esta sala.</Text>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id}
          renderItem={renderProductoItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007BFF', // Aquí se establece el color de fondo como el de Home.js
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // Para que el texto del encabezado sea visible sobre el fondo azul
  },
  burbuja: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    flexDirection: "row", // Alineamos los elementos en fila
    alignItems: "center", // Alineamos verticalmente la imagen y el texto
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
  botonInscribirse: {
    backgroundColor: '#004a99',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 20,
    alignSelf: 'center', // para centrar el botón horizontalmente
  },
});

export default ProductosSalas;
