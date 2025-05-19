import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/background.jpg')} style={styles.background} />
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        Don't have an account?{' '}
        <Text style={styles.signUp} onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0096FF' },
  background: { position: 'absolute', width: '100%', height: '50%', top: 0 },
  logo: { width: 150, height: 150, resizeMode: 'contain', marginBottom: 50 },
  button: { backgroundColor: '#D4AF7A', padding: 15, borderRadius: 20, width: '70%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  footerText: { marginTop: 20, color: 'white' },
  signUp: { color: 'red' },
});
