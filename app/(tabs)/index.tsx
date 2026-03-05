import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Audio, AVPlaybackSource } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

function PantallaBienvenida() {
  return (
    <View style={styles.contenedorSplash}>
      <Image 
        source={require('../../assets/Chihuahuas_Antes_y_Despues.jpeg')} 
        style={styles.imagenSplash}
        resizeMode="contain" 
      />
      <StatusBar style="light" />
    </View>
  );
}

function ReproductorSonido({ titulo, archivoAudio, icono }: { titulo: string, archivoAudio: AVPlaybackSource, icono: any }) {
  const [sonido, setSonido] = useState<Audio.Sound>();
  const [estaReproduciendo, setEstaReproduciendo] = useState(false);

  async function reproducirAudio() {
    if (!sonido) {
      const { sound } = await Audio.Sound.createAsync(archivoAudio);
      setSonido(sound);
      await sound.playAsync();
      setEstaReproduciendo(true);
    } else {
      await sonido.playAsync();
      setEstaReproduciendo(true);
    }
  }

  async function pausarAudio() {
    if (sonido) {
      await sonido.pauseAsync();
      setEstaReproduciendo(false);
    }
  }

  async function detenerAudio() {
    if (sonido) {
      await sonido.stopAsync();
      setEstaReproduciendo(false);
    }
  }

  useEffect(() => {
    return sonido ? () => { sonido.unloadAsync(); } : undefined;
  }, [sonido]);

  return (
    <View style={styles.tarjetaReproductor}>
      <View style={styles.encabezadoTarjeta}>
        <View style={styles.circuloIcono}>
          <Ionicons name={icono} size={24} color="#38BDF8" />
        </View>
        <Text style={styles.texto}>{titulo}</Text>
      </View>
      <View style={styles.filaBotones}>
        {!estaReproduciendo ? (
          <TouchableOpacity style={styles.botonPrincipal} onPress={reproducirAudio}>
            <Ionicons name="play" size={28} color="#0F172A" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.botonPrincipal} onPress={pausarAudio}>
            <Ionicons name="pause" size={28} color="#0F172A" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.botonSecundario} onPress={detenerAudio}>
          <Ionicons name="stop" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Index() {
  const [mostrarSplash, setMostrarSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (mostrarSplash) {
    return <PantallaBienvenida />;
  }

  return (
    <ScrollView style={styles.fondoGlobal} contentContainerStyle={styles.contenedor}>
      <Text style={styles.tituloPrincipal}>mySonidos</Text>
      <ReproductorSonido titulo="🌊 Mar" archivoAudio={require('../../assets/SantaClaraDelMar.mp3')} icono="water" />
      <ReproductorSonido titulo="🌧️ Lluvia 2 horas" archivoAudio={require('../../assets/Lluvia.mp3')} icono="rainy" />
      <ReproductorSonido titulo="🌧️ Otra lluvia 2 horas" archivoAudio={require('../../assets/Lluvia2-2Horas.mp3')} icono="rainy" />
      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedorSplash: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imagenSplash: {
    width: '80%',
    height: '60%',
  },
  fondoGlobal: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contenedor: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  tituloPrincipal: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 35,
    letterSpacing: 1,
  },
  tarjetaReproductor: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  encabezadoTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  circuloIcono: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    padding: 10,
    borderRadius: 15,
  },
  texto: {
    fontSize: 19,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonPrincipal: {
    backgroundColor: '#38BDF8',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  botonSecundario: {
    backgroundColor: '#334155',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  }
});