import React, { useMemo, useState } from 'react';
import { Question } from '../types';
import {
	getPendingDesignSyncPayloadByCode,
	getAllDesignConfigs,
	getDesignByCode,
	saveDesignConfig,
	updateAssetsByCode,
	insertQuestionsByCodeInApi,
	replaceQuestionsByCodeInApi,
	setExpiryDateByCode,
	deleteDesignByCodeInApi,
	isDesignExpired,
	formatDateForInput,
	parseDateToTimestamp,
	fetchQuestionsByCodeFromApi,
	syncDesignByCodeToApi,
	getQuestionsByCode,
} from './adminDesignStore';

interface MenuControlProps {
	onBack: () => void;
	onGoToDisenio: () => void;
	onGoToCodigo: () => void;
	onDesignUpdated?: () => void;
}

const readFileAsDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ''));
		reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
		reader.readAsDataURL(file);
	});

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';

// Splits a single CSV row respecting quoted fields ("field with, comma")
const splitCSVRow = (row: string, sep: string): string[] => {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < row.length; i++) {
		const ch = row[i];
		if (ch === '"') {
			// Escaped quote inside quoted field
			if (inQuotes && row[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (ch === sep && !inQuotes) {
			result.push(current.trim());
			current = '';
		} else {
			current += ch;
		}
	}
	result.push(current.trim());
	return result;
};

const parseCSV = (text: string): Question[] => {
	// Normalize line endings (Windows \r\n → \n)
	const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	const lines = normalized.split('\n').filter((line) => line.trim());

	if (lines.length < 2) throw new Error('CSV debe tener encabezado + al menos 1 fila de datos.');

	// Auto-detect separator: semicolon (Excel ES) or comma
	const sep = lines[0].includes(';') ? ';' : ',';

	const headers = splitCSVRow(lines[0], sep).map((h) => h.toLowerCase().replace(/^"|"$/g, '').trim());
	const preguntaIdx = headers.indexOf('pregunta');
	const respuestaIdx = headers.indexOf('respuesta');
	const explicacionIdx = headers.indexOf('explicacion');

	if (preguntaIdx === -1 || respuestaIdx === -1 || explicacionIdx === -1) {
		throw new Error(
			`CSV debe tener columnas: "pregunta", "respuesta", "explicacion".\nColumnas detectadas: ${headers.join(', ')}`,
		);
	}

	const questions: Question[] = [];
	for (let i = 1; i < lines.length; i++) {
		const parts = splitCSVRow(lines[i], sep).map((p) => p.replace(/^"|"$/g, '').trim());
		const pregunta = parts[preguntaIdx] ?? '';
		const respuestaStr = (parts[respuestaIdx] ?? '').toLowerCase();
		const explicacion = parts[explicacionIdx] ?? '';

		if (!pregunta || !explicacion) {
			console.warn(`Fila ${i + 1}: pregunta o explicación vacía, omitida.`);
			continue;
		}

		const respuesta = ['true', 'verdadero', '1', 'si', 'sí', 'yes'].includes(respuestaStr);

		questions.push({
			id: questions.length + 1,
			pregunta,
			respuesta,
			explicacion,
			categoria: 1,
		});
	}

	if (questions.length === 0) {
		throw new Error('No se encontraron preguntas válidas en el CSV.');
	}

	return questions;
};

const MenuControl: React.FC<MenuControlProps> = ({ onBack, onGoToDisenio, onGoToCodigo, onDesignUpdated }) => {
	const [selectedCode, setSelectedCode] = useState('');
	const [questions, setQuestions] = useState<Question[]>([]);
	const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
	const [formPregunta, setFormPregunta] = useState('');
	const [formRespuesta, setFormRespuesta] = useState(true);
	const [formExplicacion, setFormExplicacion] = useState('');
	const [feedback, setFeedback] = useState('');
	const [syncPayloadPreview, setSyncPayloadPreview] = useState('');
	const [expiryDateInput, setExpiryDateInput] = useState('');
	const [refreshTick, setRefreshTick] = useState(0);
	const [appTitleInput, setAppTitleInput] = useState('');
	const [appSubtitleInput, setAppSubtitleInput] = useState('');
	const [appTaglineInput, setAppTaglineInput] = useState('');

	const designs = useMemo(() => getAllDesignConfigs(), [refreshTick]);

	const handleSelectCode = async (code: string) => {
		if (!code) {
			setFeedback('Debes seleccionar un código válido.');
			return;
		}

		const design = designs.find((item) => item.code === code);
		if (!design) {
			setFeedback(`No se encontró el diseño para el código "${code}".`);
			return;
		}

		// Intentar cargar desde backend y hacer fallback a local si falla
		let filteredQuestions = getQuestionsByCode(code);
		try {
			filteredQuestions = await fetchQuestionsByCodeFromApi(code);
		} catch {
			// fallback local cache
		}

		setSelectedCode(code);
		setQuestions(filteredQuestions);
		setExpiryDateInput(formatDateForInput(design.expiryDate));
		setAppTitleInput(design.appTitle || '');
		setAppSubtitleInput(design.appSubtitle || '');
		setAppTaglineInput(design.appTagline || '');
		setEditingQuestionId(null);
		resetForm();
		setFeedback(`Código "${code}" seleccionado - ${filteredQuestions.length} preguntas cargadas.`);
	};

	const resetForm = () => {
		setFormPregunta('');
		setFormRespuesta(true);
		setFormExplicacion('');
		setEditingQuestionId(null);
	};

	const handleAddQuestion = () => {
		if (!formPregunta.trim() || !formExplicacion.trim()) {
			setFeedback('Pregunta y explicación son requeridas.');
			return;
		}

		if (editingQuestionId !== null) {
			const updated = questions.map((q) =>
				q.id === editingQuestionId
					? { ...q, pregunta: formPregunta, respuesta: formRespuesta, explicacion: formExplicacion }
					: q,
			);
			setQuestions(updated);
			setFeedback('Pregunta actualizada.');
		} else {
			const newQuestion: Question = {
				id: Math.max(0, ...questions.map((q) => q.id)) + 1,
				pregunta: formPregunta,
				respuesta: formRespuesta,
				explicacion: formExplicacion,
				categoria: 1,
			};
			setQuestions([...questions, newQuestion]);
			setFeedback('Pregunta agregada.');
		}

		resetForm();
	};

	const handleEditQuestion = (question: Question) => {
		setEditingQuestionId(question.id);
		setFormPregunta(question.pregunta);
		setFormRespuesta(question.respuesta);
		setFormExplicacion(question.explicacion);
	};

	const handleDeleteQuestion = (id: number) => {
		setQuestions(questions.filter((q) => q.id !== id));
		setFeedback('Pregunta eliminada.');
		if (editingQuestionId === id) resetForm();
	};

	// POST /api/preguntas/sync/ — inserta sin borrar las existentes
	const handleSaveQuestions = async () => {
		if (!selectedCode || !selectedCode.trim()) {
			setFeedback('Debes seleccionar un código antes de insertar preguntas.');
			return;
		}

		if (questions.length === 0) {
			setFeedback('No hay preguntas para insertar.');
			return;
		}

		try {
			const inserted = await insertQuestionsByCodeInApi(selectedCode, questions);
			setQuestions(inserted);
			setFeedback(
				`${inserted.length} pregunta${inserted.length !== 1 ? 's' : ''} insertada${inserted.length !== 1 ? 's' : ''} para ${selectedCode}.`,
			);
			setRefreshTick((prev) => prev + 1);
		} catch (error) {
			setFeedback((error as Error).message || `No se pudieron insertar las preguntas para "${selectedCode}".`);
		}
	};

	// PUT /api/design/{code}/questions/ — reemplaza TODAS las preguntas existentes
	const handleReplaceQuestions = async () => {
		if (!selectedCode || !selectedCode.trim()) {
			setFeedback('Debes seleccionar un código antes de reemplazar preguntas.');
			return;
		}

		if (questions.length === 0) {
			setFeedback('No hay preguntas para reemplazar.');
			return;
		}

		if (!window.confirm(`¿Reemplazar TODAS las preguntas de "${selectedCode}" con las ${questions.length} preguntas actuales? Esta acción borra las existentes.`)) {
			return;
		}

		try {
			const replaced = await replaceQuestionsByCodeInApi(selectedCode, questions);
			setQuestions(replaced);
			setFeedback(
				`${replaced.length} pregunta${replaced.length !== 1 ? 's' : ''} reemplazada${replaced.length !== 1 ? 's' : ''} en ${selectedCode}.`,
			);
			setRefreshTick((prev) => prev + 1);
		} catch (error) {
			setFeedback((error as Error).message || `No se pudieron reemplazar las preguntas de "${selectedCode}".`);
		}
	};

	const handleUploadAsset = async (event: React.ChangeEvent<HTMLInputElement>, type: 'fondo' | 'logo') => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!selectedCode) {
			setFeedback('Selecciona primero un codigo antes de subir archivos.');
			event.target.value = '';
			return;
		}

		const ext = getFileExtension(file.name);
		if (type === 'fondo' && !['jpg', 'jpeg', 'png'].includes(ext)) {
			setFeedback('El fondo debe ser una imagen JPG o PNG.');
			event.target.value = '';
			return;
		}
		if (type === 'logo' && ext !== 'svg') {
			setFeedback('El logo debe ser un archivo SVG.');
			event.target.value = '';
			return;
		}

		try {
			const dataUrl = await readFileAsDataUrl(file);
			const updated =
				type === 'fondo'
					? updateAssetsByCode(selectedCode, {
							backgroundDataUrl: dataUrl,
							backgroundFileName: file.name,
						})
					: updateAssetsByCode(selectedCode, {
							logoDataUrl: dataUrl,
							logoFileName: file.name,
						});

			if (!updated) {
				setFeedback('No fue posible guardar el archivo para ese codigo.');
				event.target.value = '';
				return;
			}

			setFeedback(`Archivo ${file.name} cargado.`);
			setRefreshTick((prev) => prev + 1);
			onDesignUpdated?.();
		} catch (error) {
			setFeedback((error as Error).message || 'No se pudo procesar el archivo.');
		}

		event.target.value = '';
	};

	const handleSaveTexts = () => {
		if (!selectedCode) {
			setFeedback('Selecciona primero un código.');
			return;
		}
		const design = getDesignByCode(selectedCode);
		if (!design) {
			setFeedback('Diseño no encontrado.');
			return;
		}
		saveDesignConfig({
			...design,
			appTitle: appTitleInput.trim() || undefined,
			appSubtitle: appSubtitleInput.trim() || undefined,
			appTagline: appTaglineInput.trim() || undefined,
		});
		setFeedback('Textos de la app guardados.');
		setRefreshTick((prev) => prev + 1);
		onDesignUpdated?.();
	};

	const handleUploadIcon = async (
		event: React.ChangeEvent<HTMLInputElement>,
		type: 'victoria' | 'fallaste' | 'v' | 'f',
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!selectedCode) {
			setFeedback('Selecciona primero un código antes de subir iconos.');
			event.target.value = '';
			return;
		}

		const ext = getFileExtension(file.name);
		if (!['svg', 'png'].includes(ext)) {
			setFeedback('Los iconos deben ser archivos SVG o PNG.');
			event.target.value = '';
			return;
		}

		try {
			const dataUrl = await readFileAsDataUrl(file);
			const updated = updateAssetsByCode(selectedCode, {
				iconVictoriaDataUrl: type === 'victoria' ? dataUrl : undefined,
				iconFallasteDataUrl: type === 'fallaste' ? dataUrl : undefined,
				iconVDataUrl: type === 'v' ? dataUrl : undefined,
				iconFDataUrl: type === 'f' ? dataUrl : undefined,
			});
			if (!updated) {
				setFeedback('No fue posible guardar el icono.');
				event.target.value = '';
				return;
			}
			setFeedback(`Icono "${type}" actualizado.`);
			setRefreshTick((prev) => prev + 1);
			onDesignUpdated?.();
		} catch (error) {
			setFeedback((error as Error).message || 'No se pudo procesar el icono.');
		}

		event.target.value = '';
	};

	const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const csvQuestions = parseCSV(text);
			setQuestions([...questions, ...csvQuestions]);
			setFeedback(`${csvQuestions.length} preguntas importadas desde CSV.`);
		} catch (error) {
			setFeedback(`Error al importar CSV: ${(error as Error).message}`);
		}

		event.target.value = '';
	};

	const handlePrepareSync = async () => {
		if (!selectedCode) {
			setFeedback('Selecciona primero un codigo para preparar el payload.');
			return;
		}
		try {
			const payload = await syncDesignByCodeToApi(selectedCode);
			const queuedPayload = getPendingDesignSyncPayloadByCode(selectedCode) || payload;
			setSyncPayloadPreview(JSON.stringify(queuedPayload, null, 2));
			setFeedback('Payload enviado a design/sync/ correctamente.');
		} catch (error) {
			setFeedback((error as Error).message || 'No se pudo sincronizar con backend.');
		}
	};

	const handleUpdateExpiryDate = () => {
		if (!selectedCode) {
			setFeedback('Selecciona primero un codigo.');
			return;
		}

		const expiryTimestamp = parseDateToTimestamp(expiryDateInput);
		const updated = setExpiryDateByCode(selectedCode, expiryTimestamp);
		if (!updated) {
			setFeedback('No se pudo actualizar la fecha de expiracion.');
			return;
		}

		setFeedback(` Fecha de expiracion actualizada a ${expiryDateInput}.`);
		setRefreshTick((prev) => prev + 1);
	};

	const handleDeleteDesign = async () => {
		if (!selectedCode) {
			setFeedback('Selecciona primero un codigo.');
			return;
		}

		if (!window.confirm(`¿Realmente deseas eliminar el codigo ${selectedCode} y todos sus archivos?`)) {
			return;
		}

		try {
			await deleteDesignByCodeInApi(selectedCode);
			setFeedback(`Codigo ${selectedCode} eliminado completamente.`);
			setSelectedCode('');
			setQuestions([]);
			setExpiryDateInput('');
			setRefreshTick((prev) => prev + 1);
		} catch (error) {
			setFeedback((error as Error).message || 'No se pudo eliminar ese codigo.');
		}
	};

	return (
		<div className="min-h-[100dvh] p-4 sm:p-6 max-w-4xl mx-auto text-white">
			<header className="flex items-center justify-between gap-3 mb-6">
				<button
					onClick={onBack}
					className="px-3 py-2 rounded-full bg-white/10 border border-white/15 uppercase text-xs font-bold"
				>
					Volver
				</button>
				<h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-primary">
					Gestor de Preguntas y Assets
				</h1>
				<div className="w-16" />
			</header>

			<div className="bg-black/40 border border-white/10 rounded-2xl p-5 grid gap-6">
				{/* Selector de Código */}
				<div>
					<label className="text-sm font-semibold">
						Selecciona código
						<select
							value={selectedCode}
							onChange={(e) => handleSelectCode(e.target.value)}
							className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
						>
							<option value="">-- Seleccionar --</option>
							{designs.map((design) => (
								<option key={design.code} value={design.code}>
									{design.code} - {design.name}
								</option>
							))}
						</select>
					</label>
				</div>

				{selectedCode && (
					<>
						{/* Gestor de Preguntas */}
						<div className="border-t border-white/10 pt-6">
							<h2 className="font-black uppercase text-sm mb-4 text-primary">Gestor de Preguntas</h2>

							{/* Editor de Pregunta Manual */}
							<div className="grid gap-4 p-4 rounded-xl border border-white/10 bg-black/20 mb-4">
								<label className="text-sm font-semibold">
									Pregunta
									<input
										value={formPregunta}
										onChange={(e) => setFormPregunta(e.target.value)}
										placeholder="Escribe la pregunta..."
										className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
									/>
								</label>

								<div>
									<p className="text-sm font-semibold mb-2">Respuesta correcta</p>
									<div className="flex gap-4">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												checked={formRespuesta === true}
												onChange={() => setFormRespuesta(true)}
											/>
											Verdadero
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												checked={formRespuesta === false}
												onChange={() => setFormRespuesta(false)}
											/>
											Falso
										</label>
									</div>
								</div>

								<label className="text-sm font-semibold">
									Explicación
									<textarea
										rows={4}
										value={formExplicacion}
										onChange={(e) => setFormExplicacion(e.target.value)}
										placeholder="Explica por qué esta es la respuesta correcta..."
										className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
									/>
								</label>

								<p className="text-xs text-white/60">Categoría: 1 (fija)</p>

								<div className="flex gap-3">
									<button
										onClick={handleAddQuestion}
										className="px-4 py-2 rounded-full bg-success/30 border border-success/50 text-success font-bold uppercase text-xs"
									>
										{editingQuestionId !== null ? 'Actualizar Pregunta' : 'Agregar Pregunta'}
									</button>
									{editingQuestionId !== null && (
										<button
											onClick={resetForm}
											className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
										>
											Cancelar
										</button>
									)}
								</div>
							</div>

							{/* Importar desde CSV */}
							<div className="grid gap-3 p-4 rounded-xl border border-white/10 bg-black/20 mb-4">
								<p className="text-sm font-bold text-white">Importar Preguntas desde CSV</p>
								<p className="text-xs text-white/60">
									Separador: coma o punto y coma (Excel ES). Columnas requeridas: <span className="font-mono">pregunta, respuesta, explicacion</span>
								</p>
								<p className="text-xs text-white/50">
									respuesta acepta: true / false / verdadero / falso / 1 / 0 / si / no
								</p>
								<label className="text-sm font-semibold">
									Archivo CSV
									<input
										type="file"
										accept=".csv,text/csv"
										onChange={handleCSVUpload}
										className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
									/>
								</label>
								<p className="text-xs text-white/70">
									Las preguntas se agregarán a la lista actual (sin reemplazar).
								</p>
							</div>

							{/* Lista de Preguntas */}
							<div className="grid gap-2">
								<p className="text-sm font-bold text-white/80">
									{questions.length} pregunta{questions.length !== 1 ? 's' : ''} agregada{questions.length !== 1 ? 's' : ''}
								</p>
								{questions.map((q) => (
									<div
										key={q.id}
										className={`p-3 rounded-xl border border-white/20 bg-black/30 text-sm ${
											editingQuestionId === q.id ? 'border-primary bg-primary/10' : ''
										}`}
									>
										<div className="flex justify-between items-start gap-3">
											<div className="flex-1">
												<p className="font-bold text-white">{q.pregunta}</p>
												<p className="text-xs text-white/70 mt-1">
													Respuesta: <span className="text-primary font-bold">{q.respuesta ? 'Verdadero' : 'Falso'}</span>
												</p>
												<p className="text-xs text-white/60 mt-1">{q.explicacion}</p>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() => handleEditQuestion(q)}
													className="px-2 py-1 rounded-lg bg-blue-500/30 border border-blue-500/50 text-blue-400 font-bold uppercase text-xs"
												>
													Edit
												</button>
												<button
													onClick={() => handleDeleteQuestion(q.id)}
													className="px-2 py-1 rounded-lg bg-danger/30 border border-danger/50 text-danger font-bold uppercase text-xs"
												>
													Del
												</button>
											</div>
										</div>
									</div>
								))}
							</div>

						<div className="mt-4 flex flex-col sm:flex-row gap-3">
							<button
								onClick={handleSaveQuestions}
								className="flex-1 px-4 py-2 rounded-full bg-primary text-black font-black uppercase text-xs"
							>
								Insertar Preguntas
							</button>
							<button
								onClick={handleReplaceQuestions}
								className="flex-1 px-4 py-2 rounded-full bg-danger/80 text-white font-black uppercase text-xs border border-danger"
							>
								Reemplazar Todo
							</button>
						</div>
						</div>

						{/* Fecha de Expiración */}
						<div className="grid gap-3 p-3 rounded-xl border border-white/10 bg-black/20">
							<p className="text-xs text-white/70 uppercase font-bold tracking-wide">
								Fecha de expiracion
							</p>
							<div className="flex gap-2">
								<input
									type="date"
									value={expiryDateInput}
									onChange={(e) => setExpiryDateInput(e.target.value)}
									className="flex-1 rounded-xl bg-background-dark border border-white/15 px-3 py-2"
								/>
								<button
									onClick={handleUpdateExpiryDate}
									className="px-3 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
								>
									Actualizar
								</button>
							</div>
							<p className="text-xs text-white/60">
								{isDesignExpired(selectedCode) ? (
									<span className="text-danger font-bold">EXPIRADO</span>
								) : (
									<span className="text-success font-bold">VIGENTE hasta {expiryDateInput}</span>
								)}
							</p>
						</div>

						{/* Assets */}
						<div className="grid gap-3 p-3 rounded-xl border border-white/10 bg-black/20">
							<p className="text-xs text-white/70 uppercase font-bold tracking-wide">Subir archivos</p>
							<label className="text-sm font-semibold">
								Fondo ({selectedCode ? `${selectedCode.toLowerCase()}_fondo.jpg` : 'codigo_fondo.jpg'})
								<input
									type="file"
									accept=".jpg,.jpeg,.png"
									onChange={(e) => handleUploadAsset(e, 'fondo')}
									className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
								/>
							</label>

						</div>
					{/* Textos de la App */}
					<div className="grid gap-3 p-3 rounded-xl border border-white/10 bg-black/20">
						<p className="text-xs text-white/70 uppercase font-bold tracking-wide">Textos de la app</p>
						<label className="text-sm font-semibold">
							Título principal (ej: EL GENIO MUNDIALISTA)
							<input
								value={appTitleInput}
								onChange={(e) => setAppTitleInput(e.target.value)}
								placeholder="EL GENIO MUNDIALISTA"
								className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Subtítulo (ej: The Ultimate Challenge)
							<input
								value={appSubtitleInput}
								onChange={(e) => setAppSubtitleInput(e.target.value)}
								placeholder="The Ultimate Challenge"
								className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Tagline — usa \n para salto de línea (ej: ¿SABES MÁS\nQUE EL GENIO?)
							<input
								value={appTaglineInput}
								onChange={(e) => setAppTaglineInput(e.target.value)}
								placeholder="¿SABES MÁS\nQUE EL GENIO?"
								className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
							/>
						</label>
						<button
							onClick={handleSaveTexts}
							className="px-4 py-2 rounded-full bg-primary text-black font-black uppercase text-xs w-full"
						>
							Guardar Textos
						</button>
					</div>

					{/* Iconos */}
					<div className="grid gap-3 p-3 rounded-xl border border-white/10 bg-black/20">
						<p className="text-xs text-white/70 uppercase font-bold tracking-wide">Iconos (SVG o PNG)</p>
						<label className="text-sm font-semibold">
							Icono General / Logo (icono general.svg)
							<input
								type="file"
								accept=".svg"
								onChange={(e) => handleUploadAsset(e, 'logo')}
								className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Icono Victoria — respuesta correcta (icono victoria.svg)
							<input
								type="file"
								accept=".svg,.png"
								onChange={(e) => handleUploadIcon(e, 'victoria')}
								className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Icono Fallaste — respuesta incorrecta (icono fallaste.svg)
							<input
								type="file"
								accept=".svg,.png"
								onChange={(e) => handleUploadIcon(e, 'fallaste')}
								className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Icono V / Verdadero — botón de respuesta (icono v.svg)
							<input
								type="file"
								accept=".svg,.png"
								onChange={(e) => handleUploadIcon(e, 'v')}
								className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
							/>
						</label>
						<label className="text-sm font-semibold">
							Icono F / Falso — botón de respuesta (icono f.svg)
							<input
								type="file"
								accept=".svg,.png"
								onChange={(e) => handleUploadIcon(e, 'f')}
								className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
							/>
						</label>
					</div>
						{/* Acciones */}
						<div className="flex flex-wrap gap-3">
							<button
								onClick={handlePrepareSync}
								className="px-4 py-2 rounded-full bg-blue-500 text-black font-black uppercase text-xs"
							>
								Preparar Payload
							</button>
							<button
								onClick={onGoToDisenio}
								className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
							>
								Ir a Disenio
							</button>
							<button
								onClick={onGoToCodigo}
								className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
							>
								Ir a Codigo
							</button>
							<button
								onClick={handleDeleteDesign}
								className="px-4 py-2 rounded-full bg-danger/20 border border-danger/50 font-bold uppercase text-xs text-danger"
							>
								Eliminar Diseno
							</button>
						</div>

						{/* Payload Preview */}
						{syncPayloadPreview && (
							<details className="text-sm">
								<summary className="cursor-pointer font-bold text-primary">Ver Payload Preparado</summary>
								<pre className="mt-3 p-3 rounded-lg bg-black/40 border border-white/10 text-xs overflow-x-auto">
									{syncPayloadPreview}
								</pre>
							</details>
						)}
					</>
				)}

				{feedback && <p className="text-sm text-white/80">{feedback}</p>}
			</div>
		</div>
	);
};

export default MenuControl;
