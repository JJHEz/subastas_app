import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import database from "../config/firebase"
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [cargando, setCargando] = useState(false);


  const validarCampos = () => {
      const nuevosErrores = {};
      if (!name) nuevosErrores.name = true;
      if (!password) nuevosErrores.password = true;
      if (!email) nuevosErrores.email = true;
      if (!phone) nuevosErrores.phone = true;
      setErrors(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    };

  const createAccount = async () => {
    if (!validarCampos()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setCargando(true);

      const usuariosRef = collection(database, 'usuario');
      const q = query(usuariosRef, where('correo_electronico', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setCargando(false);
        alert('Este correo ya está registrado en otra cuenta, ingresa otro por favor.');
        return;
      }

      
      let productoSnapshot = await getDocs(collection(database, 'usuario')); 
      let idsNumericos = productoSnapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
      let nuevoId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1; 

      await setDoc(doc(database, "usuario",nuevoId.toString()), {
        nombre:name,
        contraseña: password,
        correo_electronico: email,
        telefono: phone,
      });
      setCargando(false);
      alert("Cuenta creada correctamente");
      setName('');
      setPassword('');
      setEmail('');
      setPhone('');
      setErrors({});
    } catch (error) {
      setCargando(false);
      console.log("Error of the create account:" + error);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/background.jpg')} style={styles.background} />
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.form}>
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tabInactive} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.tabText}>Inicio de sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Bienvenido a YoloKiero</Text>
        <View>
          {errors.name && <Text style={styles.asterisk}> *</Text>}
          <TextInput placeholder="Nombre de Usuario" placeholderTextColor="#666" style={styles.input} value={name} onChangeText={setName}/>
        </View>
        <View>
          {errors.password && <Text style={styles.asterisk}> *</Text>}
          <TextInput placeholder="Contraseña" placeholderTextColor="#666" secureTextEntry style={styles.input} value={password} onChangeText={setPassword}/>
        </View>
        <View>
          {errors.email && <Text style={styles.asterisk}> *</Text>}
          <TextInput placeholder="E - Mail" placeholderTextColor="#666" style={styles.input} value={email} onChangeText={setEmail}/>
        </View>
        <View>
          {errors.phone && <Text style={styles.asterisk}> *</Text>}
          <TextInput placeholder="Teléfono" placeholderTextColor="#666" style={styles.input} keyboardType="numeric" value={phone} onChangeText={setPhone}/>
        </View>
        
        
        <TouchableOpacity style={styles.signupButton} onPress={createAccount}>
          <Text style={styles.signupButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        {cargando && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0096FF', 
    alignItems: 'center' 
  },
  background: { 
    width: '100%', 
    height: 200 
  },
  logo: { 
    width: 100, 
    height: 100, 
    resizeMode: 'contain', 
    marginTop: -50 
  },
  form: { 
    backgroundColor: 'white', 
    padding: 20, 
    width: '90%', 
    borderRadius: 20, 
    marginTop: 10 
  },
  tabContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  tabInactive: { 
    paddingBottom: 5 
  },
  tabActive: { 
    borderBottomWidth: 2, 
    borderColor: '#D4AF7A', 
    paddingBottom: 5 
  },
  tabText: { 
    fontWeight: 'bold' 
  },
  welcomeText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginVertical: 15 
  },
  input: { 
    borderBottomWidth: 1,
    color: '#000',
    borderColor: '#ccc', 
    marginBottom: 15, 
    paddingVertical: 5 
  },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  checkboxText: { 
    marginLeft: 10 
  },
  signupButton: { 
    backgroundColor: '#D4AF7A', 
    padding: 12, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  signupButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999, // Asegura que esté encima
      backgroundColor: 'rgba(0,0,0,0.4)', // Fondo oscuro semi-transparente
      justifyContent: 'center',
      alignItems: 'center',
    },
    asterisk: {
      position: 'absolute',
      left: -15, // cámbialo a -20, -30, etc. para moverlo más a la derecha
      top: '50%',
      transform: [{ translateY: -10 }],
      color: 'red',
      fontWeight: 'bold',
      fontSize: 16,
    },
});
