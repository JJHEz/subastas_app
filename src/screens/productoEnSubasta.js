import React, { useEffect, useState, useRef } from 'react';
import { Text, View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getDocs, collection, query, where, onSnapshot, doc, setDoc,updateDoc, getDoc } from 'firebase/firestore';
import database from '../config/firebase';
import { useRoute } from '@react-navigation/native';



export default function ProductoEnSubasta() {
  const [martillero, setMartillero] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productoActual, setProductoActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [mostrarFinalizado, setMostrarFinalizado] = useState(false);
  const intervaloRef = useRef(null);

  const [mejorPuja, setMejorPuja] = useState(null);
  const [ganadorActual, setGanadorActual] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [estadoGanador, setEstadoGanador] = useState({estado:"cargando"});

  const route = useRoute();
  const { idDelUsuarioQueIngreso } = route.params;
  const porcentajeIncrementoPujas = 0.10;
  const idUsuario = idDelUsuarioQueIngreso;
  const obtenerHoraGlobal = async () => {
    return new Date().getTime(); // Simula hora global
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const docRef = doc(database, 'usuario', idUsuario.toString());
        const docSnap = await getDoc(docRef);
        const usuario = docSnap.data();
        setUsuario(usuario)
        console.log('Usuario encontrado:', usuario);
      } catch (error) {
        console.log("Error al obtener el usuario:" + error);
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        
        const martilleroRef = collection(database, 'martillero');
        const snapshot = await getDocs(query(martilleroRef, where('__name__', '==', '1')));
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setMartillero({ id: doc.id, ...doc.data() });
        }

        
        const productosRef = collection(database, 'producto');
        const productosSnap = await getDocs(query(productosRef, where('id_martillero_fk', '==', 1)));
        const productosData = productosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProductos(productosData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchDatos();
  }, []);

useEffect(() => {
  if (!martillero || productos.length === 0) return;

  const iniciarSubasta = async () => {
    const ahora = await obtenerHoraGlobal();

    const [horaInicio, minutoInicio] = martillero.hora_ini.split(':').map(Number);
    const [horaFin, minutoFin] = martillero.hora_fin.split(':').map(Number);

    const fechaInicio = new Date();
    fechaInicio.setHours(horaInicio, minutoInicio, 0, 0);

    const fechaFin = new Date();
    fechaFin.setHours(horaFin, minutoFin, 0, 0);

    const duracionTotal = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / 1000);
    const duracionPorProducto = Math.floor(duracionTotal / martillero.nro_productos);

    const segundosDesdeInicio = Math.floor((ahora - fechaInicio.getTime()) / 1000);

    if (segundosDesdeInicio >= 0 && segundosDesdeInicio < duracionTotal) {
      const productoIndex = Math.floor(segundosDesdeInicio / duracionPorProducto);
      const tiempoRestanteActual = duracionPorProducto - (segundosDesdeInicio % duracionPorProducto);

      setProductoActual(productoIndex);
      setTiempoRestante(tiempoRestanteActual);

      intervaloRef.current = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(intervaloRef.current);
            if (productoIndex + 1 < productos.length) {
              setProductoActual(productoIndex + 1);
              setTiempoRestante(duracionPorProducto);
            } else {
              setMostrarFinalizado(true);
            }
            return 0;
          }
        });
      }, 1000);
    } else {
      setMostrarFinalizado(true);
    }
  };

  iniciarSubasta();

  return () => clearInterval(intervaloRef.current);
}, [martillero, productos]);

  const producto = productos[productoActual];


useEffect(() => {
  if (productos.length === 0 || productoActual >= productos.length) return;
  console.log("idddd.-" + producto.id);
  let id = parseInt(producto.id);
  const pujasRef = collection(database, 'oferta');
  const q = query(pujasRef, where('id_producto_fk', '==', id));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const nuevasPujas = snapshot.docs.map(doc => doc.data());
    // Puedes actualizar el estado para mostrar la última puja
    if (nuevasPujas.length > 0) {
      const ultimaPuja = nuevasPujas[nuevasPujas.length - 1];

      try {
        const docRef = doc(database, 'usuario', ultimaPuja.id_usuario.toString());
        const docSnap = await getDoc(docRef);
        const usuarioData = docSnap.exists() ? docSnap.data() : { nombre: 'Desconocido' };

        setMejorPuja({
          id_producto_fk: ultimaPuja.id_producto_fk,
          id_usuario: ultimaPuja.id_usuario,
          precio_oferta_actual: (ultimaPuja.precio_oferta_actual + (producto.precio_base * porcentajeIncrementoPujas))
        });

        setGanadorActual({
          nombre: usuarioData.nombre,
          id_usuario: ultimaPuja.id_usuario,
          precio_oferta_actual: ultimaPuja.precio_oferta_actual,
          id_producto_fk: ultimaPuja.id_producto_fk
        });

        if(usuarioData.nombre === usuario.nombre){
          setEstadoGanador({
            estado: "¡Vas Ganando!"
          });
        }else{
          setEstadoGanador({
            estado: "¡Vas Perdiendo!"
          });
        }

        console.log("Mejor puja:", ultimaPuja);
        console.log("Nombre del usuario que ofertó:", usuarioData.nombre);
      } catch (error) {
        console.log("Error al obtener el usuario de la puja:", error);
      }
    
    }else{
      setMejorPuja({precio_oferta_actual: (producto.precio_base + (producto.precio_base * porcentajeIncrementoPujas))});
      setGanadorActual({
        nombre: "Sin ofertas",
        precio_oferta_actual: (producto.precio_base)
      });

    }
  });
  return () => unsubscribe(); 
}, [producto]);


const pujar = async () => {
  const ofertasSnapshot = await getDocs(collection(database, 'oferta'));
  const idsNumericos = ofertasSnapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
  const nuevoId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;

  let id = parseInt(producto.id);

  const pujasRef = collection(database, 'oferta');
  const q = query(pujasRef, where('id_producto_fk', '==', id));
  const ofertaExistentes = await getDocs(q);

  if (!ofertaExistentes.empty) {
    try {
      const primeraPuja = ofertaExistentes.docs[0].data();
      const precio = primeraPuja.precio_oferta_actual;
      const incrementoDePuja = precio + (producto.precio_base * porcentajeIncrementoPujas);

      const refOferta = doc(database, 'oferta', ofertaExistentes.docs[0].id);
      await updateDoc(refOferta, {
        precio_oferta_actual: incrementoDePuja,
        id_usuario: parseInt(idUsuario)
      });

    } catch (error) {
      console.log("Actualizar oferta", error)
    }

  } else {
    try {
      const primeraPuja = producto.precio_base + (producto.precio_base * porcentajeIncrementoPujas);
      await setDoc(doc(database, 'oferta', nuevoId.toString()), {
        precio_oferta_actual: primeraPuja,
        id_producto_fk: parseInt(producto.id),
        id_usuario: parseInt(idUsuario)
      });
    } catch (error) {
      console.log("Error en una nueva oferta", error);
    }
  }
};

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

  const formatTiempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>SUBASTAS EN LÍNEA</Text>

        {martillero && (
          <View style={styles.martilleroCard}>
            
            <Text style={styles.infoText}>Fecha: {martillero.fecha_ini}</Text>
            <Text style={styles.infoText}>Hora de inicio: {martillero.hora_ini}</Text>
            <Text style={styles.infoText}>Hora finalizada: {martillero.hora_fin}</Text>
            <Text style={styles.infoText}>Productos: {martillero.nro_productos}</Text>
          </View>
        )}

        {producto && !mostrarFinalizado ? (
          <View key={producto.id} style={styles.productCard}>
            <Image source={{ uri: producto.imagen }} style={styles.productImage} />
            <Text style={styles.productText}>Producto: {producto.nombre_producto}</Text>
            <Text style={styles.productText}>Estado: {producto.estado_del_producto}</Text>
            <Text style={styles.productText}>Detalle: {producto.descripcion_producto}</Text>
            <Text style={styles.productText}>Ubicacion: {producto.ubicacion}</Text>
            <Text style={styles.productText}>Precio base: Bs {producto.precio_base}</Text>
            <Text style={styles.productText}>⏱ Tiempo: {formatTiempo(tiempoRestante)}</Text>

            <View style={styles.bidContainer}>
              <Text style={styles.ganando}>Ganando{"\n"}{ganadorActual ? ganadorActual.nombre : "Cargando"}{"\n"}bs {ganadorActual ? ganadorActual.precio_oferta_actual : producto.precio_base}</Text>
              <Text style={styles.subtitulo}>23 participantes</Text>
              <Text style={[styles.estado, { color: estadoGanador.estado === '¡Vas Ganando!' ? 'green' : 'red' }]}>{estadoGanador.estado}</Text>
              <View style={styles.precioOferta}>
                <Text style={styles.textoOferta}>Bs {mejorPuja ? mejorPuja.precio_oferta_actual : producto.precio_base}</Text>
              </View>
              <TouchableOpacity style={styles.botonPujar} onPress={() => pujar()}>
                <Text style={styles.textoBoton}>Pujar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : mostrarFinalizado && (
          <Text style={{ fontSize: 20, marginTop: 30, fontWeight: 'bold', color: 'white' }}>
            🎉🎉 Subasta finalizada 🎉🎉
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#007BFF',
  },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 16,
  },
  martilleroCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 4,
  },
  productCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  productImage: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    marginBottom: 10,
    borderRadius: 12,
  },
  productText: {
    fontSize: 15,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bidContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  ganando: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#e6e6e6',
    borderRadius: 60,
    width: 120,
    height: 120,
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  estado: {
    fontSize: 16,
    color: 'green',
    marginTop: 8,
  },
  precioOferta: {
    marginVertical: 10,
    backgroundColor: '#e6e6e6',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  textoOferta: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonPujar: {
    backgroundColor: '#00BFFF',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
  },
  textoBoton: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
