import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function SignUpScreen({ navigation }) {
  const [agree, setAgree] = React.useState(false);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/background.jpg')} style={styles.background} />
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.form}>
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tabInactive} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.tabText}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabActive}>
            <Text style={styles.tabText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Welcome to YoloKiero</Text>
        <TextInput placeholder="Nombre de Usuario" style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} />
        <TextInput placeholder="E - Mail" style={styles.input} />
        
        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0096FF', alignItems: 'center' },
  background: { width: '100%', height: 200 },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginTop: -50 },
  form: { backgroundColor: 'white', padding: 20, width: '90%', borderRadius: 20, marginTop: 10 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  tabInactive: { paddingBottom: 5 },
  tabActive: { borderBottomWidth: 2, borderColor: '#D4AF7A', paddingBottom: 5 },
  tabText: { fontWeight: 'bold' },
  welcomeText: { fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 15, paddingVertical: 5 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkboxText: { marginLeft: 10 },
  signupButton: { backgroundColor: '#D4AF7A', padding: 12, borderRadius: 20, alignItems: 'center' },
  signupButtonText: { color: 'white', fontWeight: 'bold' },
});
