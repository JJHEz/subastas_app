import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function AddProductForm() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [estado, setEstado] = useState('');
  const [fechaSubasta, setFechaSubasta] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [precioBase, setPrecioBase] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <IconButton icon="arrow-left" style={styles.botonRegresar} onPress={() => {}} />
      
      <View style={styles.card}>
        <View style={styles.userRow}>
          <IconButton icon="account" size={20} />
          <Text style={{ fontWeight: 'bold' }}>Alan (4.9)</Text>
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <>
              <IconButton icon="plus-box" size={30} />
              <Text>Añadir fotos</Text>
            </>
          )}
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="Categoría" value={category} onChangeText={setCategory} />
        <TextInput style={styles.input} placeholder="Estado" value={estado} onChangeText={setEstado} />

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: '#555' }}>{fechaSubasta.toLocaleDateString()}</Text>
          <IconButton icon="calendar" size={20} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={fechaSubasta}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setFechaSubasta(selectedDate);
            }}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Precio Base"
          keyboardType="numeric"
          value={precioBase}
          onChangeText={setPrecioBase}
        />

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Añadir producto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#008CFF',
      paddingTop: 1,
      paddingHorizontal: 20,
    },
    logo: {
      width: 60,
      height: 60,
      alignSelf: 'center',
      marginBottom: 10,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    imagePicker: {
      alignItems: 'center',
      marginVertical: 10,
    },
    preview: {
      width: 100,
      height: 100,
      borderRadius: 10,
    },
    input: {
      backgroundColor: '#e5e7eb',
      borderRadius: 10,
      padding: 12,
      marginVertical: 6,
    },
    dateInput: {
      backgroundColor: '#e5e7eb',
      borderRadius: 10,
      padding: 12,
      marginVertical: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    submitBtn: {
      backgroundColor: '#d4a373',
      borderRadius: 20,
      padding: 15,
      marginTop: 20,
      alignItems: 'center',
    },
    botonRegresar: {
        marginTop: 30,
    },
  });
  