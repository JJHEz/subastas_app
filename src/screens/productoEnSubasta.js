import React, { useState, useEffect } from 'react';
import { Text, View, Button, TextInput, Image, StyleSheet } from 'react-native';
import database from "../config/firebase"
import { collection, addDoc, getDocs, getDoc, doc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';


export default function ProductoEnSubasta() {


    // Estado para almacenar los datos del producto
    const [producto, setProducto] = useState(null);
    const [tiempo, setTiempo] = useState(0); // Tiempo inicial en segundos


    const getProductoPorID = async () => {
        try {
            const productoID = "2"; // <-- aquí pones el ID específico
            const docRef = doc(database, 'producto', productoID);
            const docSnap = await getDoc(docRef);

            const datosObtenidos = docSnap.data();
            setProducto({idProducto:docSnap.id, ...datosObtenidos});

            console.log("Producto encontrado:", docSnap.data());
            console.log("Id del producto: " + docSnap.id);
            
        } catch (error) {
            console.error("Error al obtener el producto: ", error);
        }
    };

    // Ejecutar la función automáticamente cuando el componente se monta
    useEffect(() => {
        getProductoPorID();
    }, []);  // El arreglo vacío asegura que se ejecute solo una vez al montar el componente

    const getTiempo = () =>{
        if(producto){
            const tiempoInicio = producto.hora_de_subasta;
            const tiempoFin = producto.hora_fin_subasta;

            const [horaInicio, minutoInicio] = tiempoInicio.split(':').map(Number);
            const [horaFin, minutoFin] = tiempoFin.split(':').map(Number);

            // Crear fechas usando el día actual
            const ahora = new Date();
            const fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaInicio, minutoInicio);
            const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaFin, minutoFin);

            // Calcular la diferencia en milisegundos y convertir a segundos
            const diferenciaSegundos = Math.floor((fechaFin - fechaInicio) / 1000);

            return diferenciaSegundos;

            console.log("Hora de inicio:", tiempoInicio);
            console.log("Hora de fin:", tiempoFin);
            console.log("Diferencia en segundos" + diferenciaSegundos);
        } else {
            console.log("Producto aún no cargado");
        }
    };

    useEffect(() => { //Metodo solo para imprimir los segundos de diferencia
        if (producto) {
          setTiempo(getTiempo());
        }
    }, [producto]); // Se ejecuta cuando producto cambia



    useEffect(() => {
        if (tiempo === 0) return; // Si ya llegó a 0, detener
        const intervalo = setInterval(() => {
          setTiempo((prevTiempo) => prevTiempo - 1);
        }, 1000); // Disminuye cada segundo
    
        return () => clearInterval(intervalo); // Limpiar el intervalo al desmontar
      }, [tiempo]);

      const formatoDeTiempo = (segundos) => {
        const horas = String(Math.floor(segundos / 3600)).padStart(2, '0');
        const minutos = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
        const segs = String(segundos % 60).padStart(2, '0');
        return `${horas}:${minutos}:${segs}`;
      };


    return (
        <View style={styles.container}>
            {producto ?(
                <View style={styles.recuadroProducto}>
                    <Image source={{ uri:producto.imagen }} style={styles.imagen} />
                    <Text style={ styles.nombreProducto }>Producto: {producto.nombre_producto}</Text>
                    <Text>Estado: {producto.estado_del_producto}</Text>
                    <Text>Fecha de Subasta: {producto.fecha_de_subasta}</Text>
                    <Text>Hora de Subasta: {producto.hora_de_subasta}</Text>
                    <Text>Ubicación: {producto.ubicacion}</Text>
                    <Text>Precio Base: ${producto.precio_base}</Text>
                    <Text>Vendido: {producto.vendido ? "Sí" : "No"}</Text>
                </View>
            ):(
                <Text>Cargando producto...</Text>
            )}

            <Text style={styles.tiempoTexto}>
                {tiempo > 0 ? formatoDeTiempo(tiempo) : '¡Tiempo terminado!'}
            </Text>
            
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007BFF', 
    },

    recuadroProducto: {
        marginTop: 20,
        padding: 15,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },

    imagen: {
        width: 180,
        height: 180,
        borderRadius: 10,
    },

    nombreProducto: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    tiempoTexto: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
    },
    

  });