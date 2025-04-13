import React, { useState, useEffect } from 'react';
import { Text, View, Button, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import database from "../config/firebase"
import { collection, addDoc, getDocs, getDoc, doc, setDoc, query, limit, where, orderBy } from 'firebase/firestore';
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

            const pujasExistentes = await precioMayorPujas(parseInt(docSnap.id));

            if(pujasExistentes){
                setProducto({
                    idProducto:docSnap.id,
                    nombre_producto: datosObtenidos.nombre_producto,
                    estado_del_producto:datosObtenidos.estado_del_producto,
                    fecha_de_subasta:datosObtenidos.fecha_de_subasta,
                    hora_de_subasta:datosObtenidos.hora_de_subasta,
                    ubicacion:datosObtenidos.ubicacion,
                    precio_base:pujasExistentes,
                    vendido:datosObtenidos.vendido,
                    imagen:datosObtenidos.imagen,
                });
            }else{
                setProducto({idProducto:docSnap.id, ...datosObtenidos});
            }
            console.log("Pujas existentes: " + pujasExistentes);
            

            console.log("Producto encontrado:", docSnap.data());
            console.log("Id del producto: " + docSnap.id);
            
        } catch (error) {
            console.error("Error al obtener el producto: ", error);
        }
    };

    useEffect(() => {
        getProductoPorID(); //carga el producto inicialmente
    }, []);



    const getTiempo = async () =>{ 
        if(producto){    //Tranforma el tiempo en segundos
            const tiempoActualDeBolivia = await getHoraDelInternet();
            const tiempoFin = producto.hora_fin_subasta;

            const [horaInicio, minutoInicio] = tiempoActualDeBolivia.split(':').map(Number);

            const [horaFin, minutoFin] = tiempoFin.split(':').map(Number);

            // Crear fechas usando el día actual
            const ahora = new Date();
            const fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaInicio, minutoInicio);
            const fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaFin, minutoFin);

            // Calcular la diferencia en milisegundos y convertir a segundos
            const diferenciaSegundos = Math.floor((fechaFin - fechaInicio) / 1000);

            return diferenciaSegundos;

        } else {
            console.log("Producto aún no cargado");
        }
    };

    const getHoraDelInternet = async () => {
        try { //utilizamos la api para obtener la hora actual de bolivia
          const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=America/La_Paz');
          const data = await response.json();
          const horaDeBolivia = data.dateTime;
          const soloHoraYMinutos = horaDeBolivia.substring(11, 16); // "HH:mm"
          return soloHoraYMinutos;
        } catch (error) {
          console.error("Error al obtener hora de Bolivia:", error);
          return null;
        }
      };

    useEffect(() => { //Metodo solo para imprimir los segundos de diferencia
        const calcularTiempo = async () => {
            if (producto) {
              const segundos = await getTiempo();
              console.log("Tiempo del conometro:", segundos);
              setTiempo(segundos);
            }
          };
        
          calcularTiempo();
    }, [producto]); // Se ejecuta cuando producto cambia



    useEffect(() => { // Descuenta el tiempo progresivamente
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


    const pujas = async (incremento) => {
        
        const pujaMayor = await precioMayorPujas(parseInt(producto.idProducto));

        const ofertasSnapshot = await getDocs(collection(database, 'oferta')); //obtenemos la coleccion oferta
        const idsNumericos = ofertasSnapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id)); // obtener los ids existentes
        const nuevoId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1; // Calcular el nuevo ID (el más alto + 1)


        if(pujaMayor){

            const incrementoDePuja = pujaMayor + incremento;

            await setDoc(doc(database, 'oferta', nuevoId.toString()), {
                precio_oferta_actual: incrementoDePuja,
                id_producto_fk:parseInt(producto.idProducto),
                id_Usuario:1,
                });
            setProducto((prevProducto) => ({
                ...prevProducto,
                precio_base: incrementoDePuja, // Actualiza el precio base
            }));
            
            console.log(" puja mayor :" + puja.pujaActual);
        }else{
            const primeraPuja = producto.precio_base + incremento;

            await setDoc(doc(database, 'oferta', nuevoId.toString()), {
                precio_oferta_actual: primeraPuja,
                id_producto_fk:parseInt(producto.idProducto),
                id_Usuario:1,
                });

                setProducto((prevProducto) => ({
                    ...prevProducto,
                    precio_base: primeraPuja, // Actualiza el precio base
                }));
            

            console.log("Id del insertado ?: " + nuevoId);
        }
    }

    const precioMayorPujas = async (idProducto) => {
        let res = null;
        try { 
            const q = query(
                collection(database, "oferta"),
                where("id_producto_fk", "==", idProducto),
                orderBy("precio_oferta_actual", "desc"),
                limit(1)
            );
            const ofertas = await getDocs(q);

            if (!ofertas.empty) {
                const docData = ofertas.docs[0].data();
                res = docData.precio_oferta_actual;
                console.log("Por que :" + res);
            }
            return res;
            
        } catch (error) {
            console.log("Error en precio mayor pujas: " + error);
        }
    }
    
    



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

            {producto ?(
            <View style={styles.ContenedorTiempo}>
                <Text>Ganando</Text>
                <Text>Rodrigo</Text>
                <Text>Precio base:{producto.precio_base} Bs</Text>
                <Text style={styles.textoTiempo}>
                    {tiempo > 0 ? formatoDeTiempo(tiempo) : '¡Tiempo terminado!'}
                </Text>
            </View>
            ):(
                <Text>Cargando datos...</Text>
            )}
            <View>
                <TouchableOpacity style={styles.boton} onPress={() => pujas(200)}>
                    <Text style={styles.textoBoton}>Presióname</Text>
                </TouchableOpacity>
            </View>
            
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

    ContenedorTiempo: {
        fontSize: 24,
        fontWeight: 'bold',
        borderColor:'black',
        borderWidth:4,
        padding:50,
        borderRadius:80,
        backgroundColor:'white',
    },
    textoTiempo: {
        fontSize:15,
    },

    boton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    textoBoton: {
        color: '#fff',
        fontSize: 16
    },
    

  });