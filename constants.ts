
import { Question } from './types';

export const QUESTIONS_DATABASE: Question[] = [
  // BANCA (20 preguntas existentes + extras)
  { id: 1, pregunta: "Brasil es el país con más títulos mundiales ganados.", respuesta: true, dificultad: "Banca", explicacion: "Brasil tiene 5 copas (1958, 1962, 1970, 1994 y 2002)." },
  { id: 2, pregunta: "El Mundial de 2022 se celebró en Arabia Saudita.", respuesta: false, dificultad: "Banca", explicacion: "Se celebró en Qatar." },
  { id: 3, pregunta: "Lionel Messi ganó su primer Mundial en Qatar 2022.", respuesta: true, dificultad: "Banca", explicacion: "Argentina venció a Francia en la final." },
  { id: 4, pregunta: "La selección de Italia ha ganado 5 copas del mundo.", respuesta: false, dificultad: "Banca", explicacion: "Italia tiene 4 títulos (1934, 1938, 1982, 2006)." },
  { id: 5, pregunta: "Uruguay fue el primer campeón de la historia en 1930.", respuesta: true, dificultad: "Banca", explicacion: "Ganó la final a Argentina 4-2 en Montevideo." },
  { id: 6, pregunta: "Cristiano Ronaldo ha anotado un gol en una final de Mundial.", respuesta: false, dificultad: "Banca", explicacion: "Cristiano ha marcado en varios mundiales, pero nunca ha jugado una final." },
  { id: 7, pregunta: "Pelé es el único jugador en ganar 3 Mundiales.", respuesta: true, dificultad: "Banca", explicacion: "Ganó en 1958, 1962 y 1970." },
  { id: 8, pregunta: "El trofeo actual del Mundial se llama 'Copa Jules Rimet'.", respuesta: false, dificultad: "Banca", explicacion: "Se llama Trofeo de la Copa Mundial de la FIFA; la Jules Rimet se entregó permanentemente a Brasil en 1970." },
  { id: 9, pregunta: "España ganó el Mundial de Sudáfrica 2010.", respuesta: true, dificultad: "Banca", explicacion: "Venció a Holanda con gol de Andrés Iniesta." },
  { id: 10, pregunta: "Un partido de fútbol de Mundial dura 100 minutos reglamentarios.", respuesta: false, dificultad: "Banca", explicacion: "Dura 90 minutos más el tiempo de descuento." },
  { id: 11, pregunta: "Miroslav Klose es el máximo goleador histórico de los Mundiales.", respuesta: true, dificultad: "Banca", explicacion: "Suma 16 goles en total." },
  { id: 12, pregunta: "El Mundial de 2026 tendrá 80 selecciones participantes.", respuesta: false, dificultad: "Banca", explicacion: "Participarán 48 selecciones por primera vez." },
  { id: 13, pregunta: "Diego Maradona anotó un gol con la mano en México 1986.", respuesta: true, dificultad: "Banca", explicacion: "Fue la famosa 'Mano de Dios' contra Inglaterra." },
  { id: 14, pregunta: "Alemania ganó el Mundial de Brasil 2014 tras vencer a Argentina.", respuesta: true, dificultad: "Banca", explicacion: "Ganó 1-0 con gol de Mario Götze." },
  { id: 15, pregunta: "La selección de Inglaterra ha ganado el Mundial en 2 ocasiones.", respuesta: false, dificultad: "Banca", explicacion: "Solo lo ha ganado una vez, en 1966." },
  { id: 16, pregunta: "El VAR se utilizó por primera vez en el Mundial de Rusia 2018.", respuesta: true, dificultad: "Banca", explicacion: "Fue el debut oficial de la tecnología de video." },
  { id: 17, pregunta: "El 'Maracanazo' fue la victoria de Uruguay sobre Brasil en 1950.", respuesta: true, dificultad: "Banca", explicacion: "Uruguay ganó 2-1 en el estadio Maracaná." },
  { id: 18, pregunta: "México ha organizado el Mundial tres veces antes del año 2026.", respuesta: false, dificultad: "Banca", explicacion: "Lo organizó en 1970 y 1986. En 2026 será su tercera vez." },
  { id: 19, pregunta: "Zinedine Zidane fue expulsado en la final de Alemania 2006.", respuesta: true, dificultad: "Banca", explicacion: "Por el famoso cabezazo a Marco Materazzi." },
  { id: 20, pregunta: "La selección de Francia ganó el Mundial de 1998 siendo anfitrión.", respuesta: true, dificultad: "Banca", explicacion: "Venció a Brasil 3-0 en la final." },

  // AMATEUR (Aumentando a 10+)
  { id: 41, pregunta: "Just Fontaine tiene el récord de más goles en un solo Mundial (13).", respuesta: true, dificultad: "Amateur", explicacion: "Lo logró en el Mundial de Suecia 1958." },
  { id: 42, pregunta: "La India se retiró del Mundial 1950 porque no les dejaron jugar con botas de cuero.", respuesta: false, dificultad: "Amateur", explicacion: "Se retiraron porque la FIFA no les permitía jugar descalzos." },
  { id: 43, pregunta: "Roger Milla es el goleador más veterano en la historia de los Mundiales.", respuesta: true, dificultad: "Amateur", explicacion: "Marcó con 42 años en Estados Unidos 1994." },
  { id: 44, pregunta: "La final de 1994 terminó 0-0 y se definió por penales.", respuesta: true, dificultad: "Amateur", explicacion: "Brasil venció a Italia tras el fallo de Roberto Baggio." },
  { id: 45, pregunta: "Ferenc Puskás jugó mundiales para dos selecciones distintas: Hungría y España.", respuesta: true, dificultad: "Amateur", explicacion: "Jugó con Hungría en 1954 y con España en 1962." },
  { id: 46, pregunta: "Thomas Müller ha ganado 2 Botas de Oro en Mundiales.", respuesta: false, dificultad: "Amateur", explicacion: "Ganó la de 2010. En 2014 ganó la de Plata." },
  { id: 47, pregunta: "Sudáfrica 2010 fue el primer Mundial celebrado en el continente africano.", respuesta: true, dificultad: "Amateur", explicacion: "Fue un hito histórico para el fútbol africano." },
  { id: 48, pregunta: "La selección de Países Bajos ha perdido 3 finales de Mundial.", respuesta: true, dificultad: "Amateur", explicacion: "Perdió en 1974, 1978 y 2010." },
  { id: 49, pregunta: "El portero con más minutos sin recibir gol es Gianluigi Buffon.", respuesta: false, dificultad: "Amateur", explicacion: "El récord es de Walter Zenga (Italia) con 517 minutos en 1990." },
  { id: 50, pregunta: "Bebeto celebró un gol haciendo el gesto de mecer un bebé en 1994.", respuesta: true, dificultad: "Amateur", explicacion: "Fue contra Holanda tras el nacimiento de su hijo." },

  // PRO (Aumentando a 10+)
  { id: 56, pregunta: "El primer gol en la historia de los Mundiales fue anotado por un jugador de Uruguay.", respuesta: false, dificultad: "PRO", explicacion: "Fue el francés Lucien Laurent contra México en 1930." },
  { id: 57, pregunta: "Mario Zagallo ganó el Mundial como jugador y como entrenador.", respuesta: true, dificultad: "PRO", explicacion: "Como jugador en 1958/62 y como DT en 1970." },
  { id: 58, pregunta: "Lothar Matthäus ha jugado en 5 Mundiales diferentes.", respuesta: true, dificultad: "PRO", explicacion: "Jugó consecutivamente de 1982 a 1998." },
  { id: 59, pregunta: "Zaire (hoy RD Congo) recibió una de las patadas más famosas de la historia en un tiro libre.", respuesta: true, dificultad: "PRO", explicacion: "Mwepu Ilunga pateó el balón antes que Brasil en 1974." },
  { id: 60, pregunta: "La mayor goleada en un Mundial fue un 10-1 de Hungría a El Salvador.", respuesta: true, dificultad: "PRO", explicacion: "Sucedió en el Mundial de España 1982." },
  { id: 61, pregunta: "Franz Beckenbauer solo ganó el mundial como entrenador.", respuesta: false, dificultad: "PRO", explicacion: "Lo ganó como jugador en 1974 y como DT en 1990." },
  { id: 62, pregunta: "El mundial de 1942 no se jugó debido a la Segunda Guerra Mundial.", respuesta: true, dificultad: "PRO", explicacion: "Se suspendieron las ediciones de 1942 y 1946." },
  { id: 63, pregunta: "Oleg Salenko tiene el récord de más goles en un solo partido (5).", respuesta: true, dificultad: "PRO", explicacion: "Los marcó contra Camerún en 1994." },
  { id: 64, pregunta: "La selección de Islandia es la nación más pequeña en población que ha jugado un Mundial.", respuesta: true, dificultad: "PRO", explicacion: "Debutó en Rusia 2018 con solo 330k habitantes." },
  { id: 65, pregunta: "Andrés Escobar fue asesinado tras anotar un autogol en USA 1994.", respuesta: true, dificultad: "PRO", explicacion: "Un trágico suceso tras la eliminación de Colombia." },
  { id: 68, pregunta: "Hakan Şükür marcó el gol más rápido de los Mundiales a los 11 segundos.", respuesta: true, dificultad: "PRO", explicacion: "Fue en el partido por el tercer puesto de 2002 contra Corea del Sur." },

  // LEYENDA (Aumentando a 10+)
  { id: 71, pregunta: "El jugador más joven en debutar en un Mundial es Norman Whiteside.", respuesta: true, dificultad: "Leyenda", explicacion: "Debutó con Irlanda del Norte en 1982 con 17 años y 41 días." },
  { id: 72, pregunta: "El árbitro que inventó las tarjetas amarilla y roja se inspiró en un semáforo.", respuesta: true, dificultad: "Leyenda", explicacion: "Ken Aston ideó el sistema tras el caótico Inglaterra-Argentina 1966." },
  { id: 73, pregunta: "Luis Monti es el único jugador en jugar dos finales de Mundial con dos países diferentes.", respuesta: true, dificultad: "Leyenda", explicacion: "Jugó para Argentina en 1930 y para Italia en 1934." },
  { id: 74, pregunta: "En el Mundial de 1930 se jugó la final con dos balones distintos (uno argentino y otro uruguayo).", respuesta: true, dificultad: "Leyenda", explicacion: "Hubo disputa por el balón y se usó uno de cada país en cada tiempo." },
  { id: 75, pregunta: "Un perro llamado Pickles encontró el trofeo Jules Rimet tras ser robado en 1966.", respuesta: true, dificultad: "Leyenda", explicacion: "Lo encontró enterrado en un jardín en Londres." },
  { id: 76, pregunta: "Sir Viv Richards es el único hombre que ha jugado mundiales de fútbol y de críquet.", respuesta: true, dificultad: "Leyenda", explicacion: "Representó a Antigua en eliminatorias de fútbol y a WI en críquet." },
  { id: 77, pregunta: "La selección de Italia fue campeona en 1934 usando a 5 jugadores 'oriundi' argentinos.", respuesta: true, dificultad: "Leyenda", explicacion: "Incluyendo a Guaita, Monti y Orsi." },
  { id: 78, pregunta: "Pelé jugó lesionado toda la final de México 1970.", respuesta: false, dificultad: "Leyenda", explicacion: "Pelé estaba en perfectas condiciones y anotó un gol histórico de cabeza." },
  { id: 79, pregunta: "En 1938, el portero de Brasil jugó sin zapatos parte de un partido por el barro.", respuesta: true, dificultad: "Leyenda", explicacion: "Leônidas da Silva jugó descalzo un tiempo contra Polonia." },
  { id: 80, pregunta: "La selección de Cuba llegó a cuartos de final en su único mundial (1938).", respuesta: true, dificultad: "Leyenda", explicacion: "Eliminó a Rumanía antes de caer ante Suecia." }
];

export const DIFFICULTY_CONFIG = [
  { id: 'Banca', label: 'Banca', desc: 'Para los que están calentando', color: '#38bdf8', icon: 'chair_alt' },
  { id: 'Amateur', label: 'Amateur', desc: 'Ya te sabes lo básico', color: '#13ec5b', icon: 'sports_soccer' },
  { id: 'PRO', label: 'PRO', desc: 'Solo para conocedores', color: '#f97316', icon: 'sports' },
  { id: 'Leyenda', label: 'Leyenda', desc: '¡Solo para historiadores del fútbol!', color: '#a855f7', icon: 'emoji_events' }
];
