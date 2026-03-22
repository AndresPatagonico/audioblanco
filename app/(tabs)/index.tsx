import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// --- PANTALLA DE BIENVENIDA ---
function PantallaBienvenida() {
  return (
    <View style={styles.contenedorSplash}>
      <Image 
        source={require('../../assets/Chihuahuas _antes_despues.jpg')} 
        style={styles.imagenSplash}
        resizeMode="contain" 
      />
      <StatusBar style="light" />
    </View>
  );
}

// --- NUESTRA PLAYLIST OFICIAL ---
const PISTAS = [
  { id: '1', titulo: '🌊 Mar', archivo: require('../../assets/SantaClaraDelMar.mp3'), icono: 'water' },
  { id: '2', titulo: '🌧️ Lluvia', archivo: require('../../assets/Lluvia.mp3'), icono: 'rainy' },
  { id: '3', titulo: '🌧️ Lluvia 2', archivo: require('../../assets/Lluvia2-2Horas.mp3'), icono: 'rainy' },
];

const TIEMPOS_TEMPORIZADOR = [
  { label: '15 min', minutos: 15 },
  { label: '30 min', minutos: 30 },
  { label: '1 hora', minutos: 60 },
  { label: '2 horas', minutos: 120 },
];

// --- PANTALLA PRINCIPAL ---
export default function Index() {
  const [mostrarSplash, setMostrarSplash] = useState(true);
  
  const [pistaActiva, setPistaActiva] = useState(PISTAS[0]);
  const [sonido, setSonido] = useState<Audio.Sound>();
  const [estaReproduciendo, setEstaReproduciendo] = useState(false);
  const [posicion, setPosicion] = useState(0);
  const [duracion, setDuracion] = useState(0);
  
  const [minutosTemporizador, setMinutosTemporizador] = useState<number | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    const timer = setTimeout(() => setMostrarSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timerApagado: NodeJS.Timeout;
    if (estaReproduciendo && minutosTemporizador !== null) {
      timerApagado = setTimeout(() => {
        detenerAudio();
        setMinutosTemporizador(null);
      }, minutosTemporizador * 60 * 1000);
    }
    return () => clearTimeout(timerApagado);
  }, [estaReproduciendo, minutosTemporizador]);

  useEffect(() => {
    return sonido ? () => { sonido.unloadAsync(); } : undefined;
  }, [sonido]);

  const formatearTiempo = (milisegundos: number) => {
    if (!milisegundos) return '00:00';
    const horas = Math.floor(milisegundos / 3600000);
    const minutos = Math.floor((milisegundos % 3600000) / 60000);
    const segundos = Math.floor((milisegundos % 60000) / 1000);
    const h = horas > 0 ? `${horas}:` : '';
    const m = minutos < 10 ? `0${minutos}` : minutos;
    const s = segundos < 10 ? `0${segundos}` : segundos;
    return `${h}${m}:${s}`;
  };

  async function cambiarPista(nuevaPista: any) {
    if (sonido) {
      await sonido.stopAsync();
      await sonido.unloadAsync();
      setSonido(undefined);
    }
    setPistaActiva(nuevaPista);
    setEstaReproduciendo(false);
    setPosicion(0);
  }

  async function reproducirAudio() {
    if (!sonido) {
      const { sound } = await Audio.Sound.createAsync(
        pistaActiva.archivo,
        { shouldPlay: true },
        (estado) => {
          if (estado.isLoaded) {
            setPosicion(estado.positionMillis);
            setDuracion(estado.durationMillis || 0);
            if (estado.didJustFinish) {
              setEstaReproduciendo(false);
              setPosicion(0);
              sound.setPositionAsync(0);
            }
          }
        }
      );
      setSonido(sound);
      setEstaReproduciendo(true);
    } else {
      await sonido.playAsync();
      setEstaReproduciendo(true);
    }
  }

  async function pausarAudio() { if (sonido) { await sonido.pauseAsync(); setEstaReproduciendo(false); } }
  
  async function detenerAudio() { 
    if (sonido) { 
      await sonido.stopAsync(); 
      setEstaReproduciendo(false); 
      setPosicion(0); 
    } 
  }

  const porcentajeAvance = duracion > 0 ? (posicion / duracion) * 100 : 0;

  if (mostrarSplash) { return <PantallaBienvenida />; }

  return (
    <ScrollView style={styles.fondoGlobal} contentContainerStyle={styles.contenedor}>
      <Text style={styles.tituloPrincipal}>Relax Descansar</Text>

      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Seleccioná un sonido</Text>
        {PISTAS.map((pista) => {
          const esActiva = pistaActiva.id === pista.id;
          return (
            <TouchableOpacity 
              key={pista.id} 
              style={[styles.itemPlaylist, esActiva && styles.itemPlaylistActivo]}
              onPress={() => cambiarPista(pista)}
            >
              <View style={styles.iconoPlaylist}>
                <Ionicons name={pista.icono as any} size={20} color={esActiva ? "#38BDF8" : "#94A3B8"} />
              </View>
              <Text style={[styles.textoPlaylist, esActiva && styles.textoPlaylistActivo]}>
                {pista.titulo}
              </Text>
              {esActiva && <Ionicons name="musical-notes" size={20} color="#38BDF8" />}
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.tarjetaReproductor}>
        <Text style={styles.tituloReproduciendo}>Escuchando ahora:</Text>
        <Text style={styles.nombrePistaActiva}>{pistaActiva.titulo}</Text>

        <View style={styles.contenedorProgreso}>
          <Text style={styles.textoTiempo}>{formatearTiempo(posicion)}</Text>
          <View style={styles.barraFondo}>
            <View style={[styles.barraActiva, { width: `${porcentajeAvance}%` }]} />
          </View>
          <Text style={styles.textoTiempo}>{formatearTiempo(duracion)}</Text>
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

      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Apagar en...</Text>
        <View style={styles.grillaTemporizador}>
          {TIEMPOS_TEMPORIZADOR.map((tiempo) => {
            const estaSeleccionado = minutosTemporizador === tiempo.minutos;
            return (
              <TouchableOpacity 
                key={tiempo.minutos}
                style={[styles.botonTiempo, estaSeleccionado && styles.botonTiempoActivo]}
                onPress={() => setMinutosTemporizador(estaSeleccionado ? null : tiempo.minutos)}
              >
                <Ionicons name="timer-outline" size={18} color={estaSeleccionado ? "#0F172A" : "#94A3B8"} />
                <Text style={[styles.textoTiempoBoton, estaSeleccionado && styles.textoTiempoBotonActivo]}>
                  {tiempo.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

        {/* --- PUBLICIDAD ADMOB --- */}
        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
          <BannerAd
            unitId={'ca-app-pub-5520020338893290/5303857864'}
            size={BannerAdSize.BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>

      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedorSplash: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', padding: 20 },
  imagenSplash: { width: '80%', height: '60%' },
  fondoGlobal: { flex: 1, backgroundColor: '#0F172A' },
  contenedor: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  tituloPrincipal: { fontSize: 30, fontWeight: '800', color: '#F8FAFC', marginBottom: 25, textAlign: 'center', letterSpacing: 1 },
  seccion: { marginBottom: 25 },
  tituloSeccion: { fontSize: 16, color: '#94A3B8', fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  itemPlaylist: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 8 },
  itemPlaylistActivo: { borderColor: '#38BDF8', borderWidth: 1, backgroundColor: 'rgba(56, 189, 248, 0.1)' },
  iconoPlaylist: { marginRight: 15 },
  textoPlaylist: { flex: 1, fontSize: 16, color: '#CBD5E1', fontWeight: '500' },
  textoPlaylistActivo: { color: '#38BDF8', fontWeight: '700' },
  tarjetaReproductor: { backgroundColor: '#1E293B', padding: 20, borderRadius: 24, marginBottom: 25, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, alignItems: 'center' },
  tituloReproduciendo: { fontSize: 14, color: '#94A3B8', marginBottom: 5 },
  nombrePistaActiva: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginBottom: 20, textAlign: 'center' },
  contenedorProgreso: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 10, width: '100%' },
  textoTiempo: { color: '#94A3B8', fontSize: 12, fontWeight: '500', width: 45, textAlign: 'center' },
  barraFondo: { flex: 1, height: 6, backgroundColor: '#334155', borderRadius: 3 },
  barraActiva: { height: '100%', backgroundColor: '#38BDF8', borderRadius: 3 },
  filaBotones: { flexDirection: 'row', gap: 20, justifyContent: 'center', alignItems: 'center' },
  botonPrincipal: { backgroundColor: '#38BDF8', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10 },
  botonSecundario: { backgroundColor: '#334155', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  grillaTemporizador: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  botonTiempo: { flexBasis: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', padding: 15, borderRadius: 12, gap: 8 },
  botonTiempoActivo: { backgroundColor: '#38BDF8' },
  textoTiempoBoton: { color: '#94A3B8', fontWeight: '600', fontSize: 15 },
  textoTiempoBotonActivo: { color: '#0F172A', fontWeight: '800' }
});