import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';

const Inicio = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {}
      <Image
        source={require('../../assets/logo_yolo_kiero.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')} 
      >
        <Text style={styles.buttonText}>Iniciar sesion</Text>
      </TouchableOpacity>

      {}
      <Text style={styles.signUpText}>
        ¿No tienes una cuenta?{' '}
        <Text
          style={styles.signUpLink}
          onPress={() => navigation.navigate('SignUp')} 
        >
          Registrarse
        </Text>
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 300,
    height: 400,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#D2B48C', // color dorado claro
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signUpText: {
    color: 'white',
    fontSize: 14,
  },
  signUpLink: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default Inicio;
