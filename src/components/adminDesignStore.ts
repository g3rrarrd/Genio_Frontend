import { Question } from '../types';

export interface DesignConfig {
  code: string;
  name: string;
  primaryColor: string;
  backgroundImage: string;
  logoImage?: string;
  backgroundAssetName?: string;
  logoAssetName?: string;
  fontFamily: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
  expiryDate?: number;
  appTitle?: string;
  appSubtitle?: string;
  appTagline?: string;
  iconVictoriaImage?: string;
  iconFallasteImage?: string;
  iconVImage?: string;
  iconFImage?: string;
}

export interface DesignSyncPayload {
  code: string;
  payload: {
    code: string;
    nombre_diseno: string;
    color_primario: string;
    fuente: string;
    preguntas: Question[];
    fondo_url_o_base64: string;
    fondo_nombre_archivo?: string;
    logo_url_o_base64?: string;
    logo_nombre_archivo?: string;
    fecha_expiracion?: number;
    app_titulo?: string;
    app_subtitulo?: string;
    app_tagline?: string;
    icono_victoria_url?: string;
    icono_fallaste_url?: string;
    icono_v_url?: string;
    icono_f_url?: string;
  };
  queuedAt: number;
  status: 'PENDING';
}

const STORAGE_KEY = 'genio_design_configs_tmp';
const ACTIVE_CODE_KEY = 'genio_active_design_code';
const PENDING_SYNC_KEY = 'genio_design_db_sync_pending';
const API_BASE_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/?$/, '/');

const normalizeCode = (value: string) => value.trim().toUpperCase();
const designApiPath = (path: string) => `${API_BASE_URL}${path}`;

const parseRespuesta = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return ['true', '1', 'si', 'sí', 'yes', 'verdadero', 'correcto', 'v', 's'].includes(v);
  }
  return false;
};

const normalizeQuestionsForApi = (questions: Question[]): Question[] => {
  return questions
    .filter((item) => item && item.pregunta && item.explicacion !== undefined)
    .map((item, index) => {
      const respuesta = parseRespuesta(item.respuesta);
      return {
        id: Number.isFinite(item.id) ? item.id : index + 1,
        pregunta: String(item.pregunta || '').trim(),
        respuesta,
        explicacion: String(item.explicacion || '').trim(),
        categoria: 1,
      };
    })
    .filter((item) => item.pregunta.length > 0 && item.explicacion.length > 0);
};

const parseQuestionsFromApi = (value: unknown): Question[] => {
  if (!Array.isArray(value)) return [];
  return normalizeQuestionsForApi(value as Question[]);
};

const getSafeStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

const isExpired = (design: DesignConfig): boolean => {
  if (!design.expiryDate) return false;
  return Date.now() > design.expiryDate;
};

const cleanupExpiredDesigns = (items: DesignConfig[]): DesignConfig[] => {
  return items.filter((item) => !isExpired(item));
};

const readAll = (): DesignConfig[] => {
  const storage = getSafeStorage();
  if (!storage) return [];

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const valid = parsed.filter((item) => item && typeof item.code === 'string');
    const cleaned = cleanupExpiredDesigns(valid);

    if (cleaned.length !== valid.length) {
      writeAll(cleaned);
    }

    return cleaned;
  } catch {
    return [];
  }
};

const writeAll = (items: DesignConfig[]) => {
  const storage = getSafeStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const readPendingSync = (): DesignSyncPayload[] => {
  const storage = getSafeStorage();
  if (!storage) return [];

  const raw = storage.getItem(PENDING_SYNC_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => item && item.code && item.payload);
  } catch {
    return [];
  }
};

const writePendingSync = (items: DesignSyncPayload[]) => {
  const storage = getSafeStorage();
  if (!storage) return;
  storage.setItem(PENDING_SYNC_KEY, JSON.stringify(items));
};

const codeExists = (code: string, items: DesignConfig[]) =>
  items.some((item) => item.code === code);

export const generateDesignCode = () => {
  const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const all = readAll();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    let candidate = '';
    for (let i = 0; i < 6; i += 1) {
      const index = Math.floor(Math.random() * pool.length);
      candidate += pool[index];
    }

    if (!codeExists(candidate, all)) {
      return candidate;
    }
  }

  return `CFG${Date.now().toString().slice(-5)}`;
};

export const getAllDesignConfigs = () => {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
};

export const getDesignByCode = (inputCode: string) => {
  const code = normalizeCode(inputCode);
  if (!code) return null;

  return readAll().find((item) => item.code === code) ?? null;
};

export const saveDesignConfig = (payload: {
  code?: string;
  name: string;
  primaryColor: string;
  backgroundImage: string;
  logoImage?: string;
  backgroundAssetName?: string;
  logoAssetName?: string;
  fontFamily: string;
  questions: Question[];
  expiryDate?: number;
  appTitle?: string;
  appSubtitle?: string;
  appTagline?: string;
  iconVictoriaImage?: string;
  iconFallasteImage?: string;
  iconVImage?: string;
  iconFImage?: string;
}) => {
  const all = readAll();
  const now = Date.now();
  const normalizedCode = normalizeCode(payload.code || '');
  const code = normalizedCode || generateDesignCode();

  const existing = all.find((item) => item.code === code);

  const nextItem: DesignConfig = {
    code,
    name: payload.name.trim(),
    primaryColor: payload.primaryColor.trim() || '#f5821f',
    backgroundImage: payload.backgroundImage.trim() || '/images/fondo 3.jpg',
    logoImage: payload.logoImage?.trim() || existing?.logoImage || '/images/icon general.svg',
    backgroundAssetName: payload.backgroundAssetName?.trim() || existing?.backgroundAssetName,
    logoAssetName: payload.logoAssetName?.trim() || existing?.logoAssetName,
    fontFamily: payload.fontFamily.trim() || 'Plus Jakarta Sans, sans-serif',
    questions: payload.questions.filter((q) => q && q.pregunta && q.explicacion !== undefined),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    expiryDate: payload.expiryDate || existing?.expiryDate,
    appTitle: payload.appTitle || existing?.appTitle,
    appSubtitle: payload.appSubtitle || existing?.appSubtitle,
    appTagline: payload.appTagline || existing?.appTagline,
    iconVictoriaImage: payload.iconVictoriaImage || existing?.iconVictoriaImage,
    iconFallasteImage: payload.iconFallasteImage || existing?.iconFallasteImage,
    iconVImage: payload.iconVImage || existing?.iconVImage,
    iconFImage: payload.iconFImage || existing?.iconFImage,
  };

  if (existing) {
    writeAll(all.map((item) => (item.code === code ? nextItem : item)));
  } else {
    writeAll([nextItem, ...all]);
  }

  return nextItem;
};

const buildDesignSyncPayload = (design: DesignConfig): DesignSyncPayload => {
  return {
    code: design.code,
    payload: {
      code: design.code,
      nombre_diseno: design.name,
      color_primario: design.primaryColor,
      fuente: design.fontFamily,
      preguntas: design.questions,
      fondo_url_o_base64: design.backgroundImage,
      fondo_nombre_archivo: design.backgroundAssetName,
      logo_url_o_base64: design.logoImage,
      logo_nombre_archivo: design.logoAssetName,
      fecha_expiracion: design.expiryDate,
      app_titulo: design.appTitle,
      app_subtitulo: design.appSubtitle,
      app_tagline: design.appTagline,
      icono_victoria_url: design.iconVictoriaImage,
      icono_fallaste_url: design.iconFallasteImage,
      icono_v_url: design.iconVImage,
      icono_f_url: design.iconFImage,
    },
    queuedAt: Date.now(),
    status: 'PENDING',
  };
};

const queuePendingSyncByDesign = (design: DesignConfig) => {
  const all = readPendingSync();
  const withoutCurrent = all.filter((item) => item.code !== design.code);
  const next = [buildDesignSyncPayload(design), ...withoutCurrent];
  writePendingSync(next);
};

export const updateQuestionsByCode = async (inputCode: string, questions: Question[]) => {
  const code = normalizeCode(inputCode);
  if (!code) return null;

  let design = await getDesignByCode(code);
  
  if (!design) {
    design = {
      code: code,
      name: `Diseño ${code}`,
      primaryColor: '#f5821f',
      fontFamily: 'Inter',
      backgroundImage: '',
      questions: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  const updatedDesign: DesignConfig = {
    ...design,
    questions: questions,
    updatedAt: Date.now(),
  };

  return await saveDesignConfig(updatedDesign);
};

export const getQuestionsByCode = async (inputCode: string): Promise<Question[]> => {
  const code = normalizeCode(inputCode);
  if (!code) return [];

  const design = await getDesignByCode(code);
  if (!design) return [];

  return Array.isArray(design.questions) ? design.questions : [];
};

export const getQuestionsByCodeOffline = async (inputCode: string): Promise<Question[]> => {
  const CANTIDAD_PREGUNTAS = 10;
  const code = normalizeCode(inputCode);
  if (!code) return [];

  const design = await getDesignByCode(code);
  
  if (!design || !design.questions || design.questions.length === 0) {
    console.warn("No se encontraron preguntas locales para este código.");
    return [];
  }

  if (design.questions.length < CANTIDAD_PREGUNTAS) {
    console.error(`Pool insuficiente: Solo hay ${design.questions.length} preguntas.`);
  }

  const shuffled = [...design.questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, CANTIDAD_PREGUNTAS);  

  return shuffled;
};

export const fetchDesignByCodeFromApi = async (inputCode: string) => {
  const code = normalizeCode(inputCode);
  if (!code) return null;

  const response = await fetch(designApiPath(`design/${encodeURIComponent(code)}/`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar diseño (${response.status})`);
  }

  const data = await response.json();
  const payload = data?.payload || data;

  return {
    code,
    name: payload?.nombre_diseno || payload?.name || code,
    primaryColor: payload?.color_primario || payload?.primaryColor || '#f5821f',
    backgroundImage: payload?.fondo_url_o_base64 || payload?.backgroundImage || '/images/fondo 3.jpg',
    logoImage: payload?.logo_url_o_base64 || payload?.logoImage,
    backgroundAssetName: payload?.fondo_nombre_archivo || payload?.backgroundAssetName,
    logoAssetName: payload?.logo_nombre_archivo || payload?.logoAssetName,
    fontFamily: payload?.fuente || payload?.fontFamily || 'Plus Jakarta Sans, sans-serif',
    questions: parseQuestionsFromApi(payload?.preguntas || payload?.questions),
    expiryDate: payload?.fecha_expiracion || payload?.expiryDate,
    appTitle: payload?.app_titulo || payload?.appTitle,
    appSubtitle: payload?.app_subtitulo || payload?.appSubtitle,
    appTagline: payload?.app_tagline || payload?.appTagline,
    iconVictoriaImage: payload?.icono_victoria_url || payload?.iconVictoriaImage,
    iconFallasteImage: payload?.icono_fallaste_url || payload?.iconFallasteImage,
    iconVImage: payload?.icono_v_url || payload?.iconVImage,
    iconFImage: payload?.icono_f_url || payload?.iconFImage,
  };
};

export const fetchQuestionsByCodeFromApi = async (inputCode: string): Promise<Question[]> => {
  const code = normalizeCode(inputCode);
  if (!code) return [];

  const response = await fetch(
    designApiPath(`preguntas/?codigo=${encodeURIComponent(code)}`),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`No se pudieron cargar preguntas (${response.status})`);
  }

  const data = await response.json();
  const questions = parseQuestionsFromApi(
    data?.preguntas || data?.questions || data?.results || data,
  );

  updateQuestionsByCode(code, questions);
  return questions;
};

export const insertQuestionsByCodeInApi = async (
  inputCode: string,
  questions: Question[],
): Promise<Question[]> => {
  const code = normalizeCode(inputCode);
  if (!code) {
    throw new Error('Código inválido para insertar preguntas.');
  }

  const normalizedQuestions = normalizeQuestionsForApi(questions);

  const response = await fetch(designApiPath('preguntas/sync/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      preguntas: normalizedQuestions,
    }),
  });

  if (!response.ok) {
    throw new Error(`No se pudieron insertar preguntas (${response.status})`);
  }

  const data = await response.json();
  const inserted = parseQuestionsFromApi(
    data?.preguntas || data?.questions || normalizedQuestions,
  );

  await updateQuestionsByCode(code, inserted); 

  return inserted;
};

export const replaceQuestionsByCodeInApi = async (
  inputCode: string,
  questions: Question[],
): Promise<Question[]> => {
  const code = normalizeCode(inputCode);
  if (!code) {
    throw new Error('Código inválido para guardar preguntas.');
  }

  const normalizedQuestions = normalizeQuestionsForApi(questions);

  const response = await fetch(
    designApiPath(`design/${encodeURIComponent(code)}/questions/`),
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedQuestions),
    },
  );

  if (!response.ok) {
    throw new Error(`No se pudieron guardar preguntas (${response.status})`);
  }

  const data = await response.json();
  const persistedQuestions = parseQuestionsFromApi(
    data?.preguntas || data?.questions || normalizedQuestions,
  );
  updateQuestionsByCode(code, persistedQuestions);
  return persistedQuestions;
};

export const syncDesignByCodeToApi = async (inputCode: string) => {
  const payload = queueDesignSyncByCode(inputCode);
  if (!payload) {
    throw new Error('No se pudo construir payload de sincronización.');
  }

  payload.code = normalizeCode(payload.code);
  payload.payload.code = normalizeCode(payload.payload.code);
  payload.payload.preguntas = normalizeQuestionsForApi(payload.payload.preguntas);

  const response = await fetch(designApiPath('design/sync/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`No se pudo sincronizar diseño (${response.status})`);
  }

  return payload;
};

export const deleteDesignByCodeInApi = async (inputCode: string) => {
  const code = normalizeCode(inputCode);
  if (!code) {
    throw new Error('Código inválido para eliminar diseño.');
  }

  const response = await fetch(designApiPath(`design/${encodeURIComponent(code)}/`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`No se pudo eliminar diseño en backend (${response.status})`);
  }

  deleteDesignByCode(code);
  return true;
};

export const updateAssetsByCode = (inputCode: string, assets: {
  backgroundDataUrl?: string;
  backgroundFileName?: string;
  logoDataUrl?: string;
  logoFileName?: string;
  iconVictoriaDataUrl?: string;
  iconFallasteDataUrl?: string;
  iconVDataUrl?: string;
  iconFDataUrl?: string;
}) => {
  const code = normalizeCode(inputCode);
  if (!code) return null;

  const design = getDesignByCode(code);
  if (!design) return null;

  const saved = saveDesignConfig({
    ...design,
    backgroundImage: assets.backgroundDataUrl || design.backgroundImage,
    backgroundAssetName: assets.backgroundFileName || design.backgroundAssetName,
    logoImage: assets.logoDataUrl || design.logoImage,
    logoAssetName: assets.logoFileName || design.logoAssetName,
    iconVictoriaImage: assets.iconVictoriaDataUrl || design.iconVictoriaImage,
    iconFallasteImage: assets.iconFallasteDataUrl || design.iconFallasteImage,
    iconVImage: assets.iconVDataUrl || design.iconVImage,
    iconFImage: assets.iconFDataUrl || design.iconFImage,
  });

  queuePendingSyncByDesign(saved);
  return saved;
};

export const queueDesignSyncByCode = (inputCode: string) => {
  const code = normalizeCode(inputCode);
  if (!code) return null;

  const design = getDesignByCode(code);
  if (!design) return null;

  queuePendingSyncByDesign(design);
  return buildDesignSyncPayload(design);
};

export const getPendingDesignSyncPayloads = () => {
  return readPendingSync();
};

export const getPendingDesignSyncPayloadByCode = (inputCode: string) => {
  const code = normalizeCode(inputCode);
  if (!code) return null;

  return readPendingSync().find((item) => item.code === code) || null;
};

export const setExpiryDateByCode = (inputCode: string, expiryDate: number) => {
  const code = normalizeCode(inputCode);
  if (!code) {
    console.warn(`❌ setExpiryDateByCode: Código inválido: "${inputCode}"`);
    return null;
  }

  const design = getDesignByCode(code);
  if (!design) return null;

  const saved = saveDesignConfig({
    ...design,
    expiryDate,
  });

  queuePendingSyncByDesign(saved);
  return saved;
};

export const deleteDesignByCode = (inputCode: string) => {
  const code = normalizeCode(inputCode);
  if (!code) return false;

  const all = readAll();
  const filtered = all.filter((item) => item.code !== code);

  if (filtered.length === all.length) {
    return false;
  }

  writeAll(filtered);

  const pendingSync = readPendingSync();
  const filteredPending = pendingSync.filter((item) => item.code !== code);
  writePendingSync(filteredPending);

  return true;
};

export const isDesignExpired = (inputCode: string): boolean => {
  const code = normalizeCode(inputCode);
  if (!code) return false;

  const design = getDesignByCode(code);
  if (!design) return false;

  return isExpired(design);
};

export const formatDateForInput = (timestamp?: number): string => {
  if (!timestamp) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    return tomorrow.toISOString().split('T')[0];
  }

  return new Date(timestamp).toISOString().split('T')[0];
};

export const parseDateToTimestamp = (dateString: string): number => {
  return new Date(`${dateString}T23:59:59`).getTime();
};

export const setActiveDesignCode = (inputCode: string) => {
  const storage = getSafeStorage();
  if (!storage) return;

  const code = normalizeCode(inputCode);

  if (!code) {
    storage.removeItem(ACTIVE_CODE_KEY);
    return;
  }

  storage.setItem(ACTIVE_CODE_KEY, code);
};

export const getActiveDesignCode = () => {
  const storage = getSafeStorage();
  if (!storage) return '';

  return normalizeCode(storage.getItem(ACTIVE_CODE_KEY) || '');
};

export const clearActiveDesignCode = () => {
  const storage = getSafeStorage();
  if (!storage) return;
  storage.removeItem(ACTIVE_CODE_KEY);
};

export const getActiveDesignConfig = async () => {
  const activeCode = getActiveDesignCode();
  if (activeCode) {
    try {
        await fetchQuestionsByCodeFromApi(activeCode); 
        console.log("Diseño y preguntas sincronizados localmente.");
    } catch (syncErr) {
        console.warn("No se pudieron precargar las preguntas, se hará en el gameplay", syncErr);
    }
  }
};
