import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import database from "../config/firebase"
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState();
  const [errors, setErrors] = useState({});
  const [cargando, setCargando] = useState(false);

  const validarCampos = () => {
      const nuevosErrores = {};
      if (!email) nuevosErrores.email = true;
      if (!password) nuevosErrores.password = true;
      setErrors(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    };
  
  const authenticationWithAccount = async () =>{
    if (!validarCampos()) {
      alert('Por favor completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      const usuariosRef = collection(database, 'usuario');
      const q = query(usuariosRef, where('correo_electronico', '==', email), where('contraseña', '==', password));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setCargando(false);
        console.log("Existe la cuenta a loguearse");
        let idUsuario = querySnapshot.docs[0].id;
        navigation.navigate('TabNavigator', {idUsuario});
      } else {
        setCargando(false);
        console.log("Password o correo incorrectos");
        alert("Cuenta incorrecta, intenta nuevamente.");
      }
      
    } catch (error) {
      setCargando(false);
      console.log('Error of the authentication with account:' + error);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/background.jpg')} style={styles.background} />
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.form}>
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabText}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabInactive} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.tabText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Welcome to YoloKiero</Text>
        <View>
          {errors.email && <Text style={styles.asterisk}> *</Text>}
          <TextInput placeholder="E - Mail" style={styles.input} value={email} onChangeText={setEmail}/>
        </View>
        <View>
          {errors.password && <Text style={styles.asterisk}> *</Text>}
          <TextInput placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword}/>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={authenticationWithAccount}>
          <Text style={styles.loginButtonText}>Log in</Text>
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

  tabActive: { 
    borderBottomWidth: 2, 
    borderColor: '#D4AF7A', 
    paddingBottom: 5 
  },

  tabInactive: { 
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
    borderColor: '#ccc', 
    marginBottom: 15, 
    paddingVertical: 5 
  },

  loginButton: { 
    backgroundColor: '#D4AF7A', 
    padding: 12, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginTop: 10 
  },

  loginButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
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

});
