import { Dexie } from "dexie";

export class GenioDatabase extends Dexie {
  constructor() {
    super('GenioDB');
    this.version(1).stores({
      tbl_categoria: '++id_categoria, nombre, descripcion, puntaje, tiempo_limite',
      tbl_diseno: 'code, nombre, color_primario, fuente, fondo_nombre_archivo, fondo_url, logo_nombre_archivo, logo_url, fecha_expiracion, app_titulo, app_subtitulo, app_tagline, icono_victoria_url, icono_fallaste_url, icono_v_url, icono_f_url, created_at, updated_at',
      tbl_preguntas_disenos: '++pregunta_id, pregunta, respuesta, explicacion, categoria, diseno_code',
      tbl_preguntas: 'id_pregunta, id_categoria, codigo, pregunta, respuesta_correcta, explicacion',
      tbl_pregunta_ronda: 'pregunta, ronda, estado_respuesta, fecha_respondida',
      tbl_rondas: '++id_ronda, id_usuarios, puntaje_total, fecha_jugado, preguntas',
      tbl_usuario: '++id_usuario, identificador, correo, telefono, estado, fecha_creacion, permisos, codigo_diseno'
    });
  }
}

export const db = new GenioDatabase();