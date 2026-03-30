import React, { useMemo, useState } from 'react';
import {
	DesignConfig,
	getAllDesignConfigs,
	saveDesignConfig,
	formatDateForInput,
	parseDateToTimestamp,
	isDesignExpired,
	deleteDesignByCode,
} from './adminDesignStore';

interface DisenioProps {
	onBack: () => void;
	onGoToCodigo: () => void;
	onGoToMenuControl: () => void;
}

const toQuestionsText = (questions: any[]) => '';

const Disenio: React.FC<DisenioProps> = ({ onBack, onGoToCodigo, onGoToMenuControl }) => {
	const [editingCode, setEditingCode] = useState('');
	const [name, setName] = useState('Diseno personalizado');
	const [primaryColor, setPrimaryColor] = useState('#f5821f');
	const [backgroundImage, setBackgroundImage] = useState('/images/fondo 3.jpg');
	const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans, sans-serif');
	const [savedCode, setSavedCode] = useState('');
	const [feedback, setFeedback] = useState('');
	const [expiryDate, setExpiryDate] = useState(formatDateForInput());
	const [refreshTick, setRefreshTick] = useState(0);

	const designs = useMemo(() => getAllDesignConfigs(), [refreshTick]);

	const loadDesign = (design: DesignConfig) => {
		setEditingCode(design.code);
		setName(design.name);
		setPrimaryColor(design.primaryColor);
		setBackgroundImage(design.backgroundImage);
		setFontFamily(design.fontFamily);
		setSavedCode(design.code);
		setExpiryDate(formatDateForInput(design.expiryDate));
		setFeedback(`Editando codigo ${design.code}`);
	};

	const handleSave = () => {
		if (!name.trim()) {
			setFeedback('Debes indicar un nombre de diseno.');
			return;
		}

		const expiryTimestamp = parseDateToTimestamp(expiryDate);
		const result = saveDesignConfig({
			code: editingCode,
			name,
			primaryColor,
			backgroundImage,
			fontFamily,
			questions: [],
			expiryDate: expiryTimestamp,
		});

		setEditingCode(result.code);
		setSavedCode(result.code);
		setFeedback('Configuracion guardada en archivo temporal.');
		setRefreshTick((prev) => prev + 1);
	};

	const handleDeleteDesign = (code: string) => {
		if (!window.confirm(`¿Realmente deseas eliminar el diseno ${code}?`)) {
			return;
		}

		const deleted = deleteDesignByCode(code);
		if (!deleted) {
			setFeedback('No se pudo eliminar ese diseno.');
			return;
		}

		setFeedback(`Diseno ${code} eliminado completamente.`);
		setEditingCode('');
		setName('Diseno personalizado');
		setPrimaryColor('#f5821f');
		setBackgroundImage('/images/fondo 3.jpg');
		setFontFamily('Plus Jakarta Sans, sans-serif');
		setExpiryDate(formatDateForInput());
		setRefreshTick((prev) => prev + 1);
	};

	return (
		<div className="min-h-[100dvh] p-4 sm:p-6 max-w-3xl mx-auto text-white">
			<header className="flex items-center justify-between gap-3 mb-6">
				<button
					onClick={onBack}
					className="px-3 py-2 rounded-full bg-white/10 border border-white/15 uppercase text-xs font-bold"
				>
					Volver
				</button>
				<h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-primary">Panel de Diseno</h1>
				<div className="w-16" />
			</header>

			<div className="grid gap-4 bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5">
				<label className="text-sm font-semibold">
					Codigo del diseno (opcional para actualizar)
					<input
						value={editingCode}
						onChange={(e) => setEditingCode(e.target.value.toUpperCase())}
						placeholder="Ej: AB12CD"
						className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
					/>
				</label>

				<label className="text-sm font-semibold">
					Nombre del diseno
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
					/>
				</label>

				<label className="text-sm font-semibold">
					Color principal
					<input
						type="color"
						value={primaryColor}
						onChange={(e) => setPrimaryColor(e.target.value)}
						className="mt-1 w-28 h-10 rounded-lg bg-background-dark border border-white/15"
					/>
				</label>

				<label className="text-sm font-semibold">
					URL o ruta de fondo
					<input
						value={backgroundImage}
						onChange={(e) => setBackgroundImage(e.target.value)}
						className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
					/>
				</label>

				<label className="text-sm font-semibold">
					Fuente global (font-family)
					<input
						value={fontFamily}
						onChange={(e) => setFontFamily(e.target.value)}
						className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
					/>
				</label>

				<label className="text-sm font-semibold">
					Fecha de expiracion
					<input
						type="date"
						value={expiryDate}
						onChange={(e) => setExpiryDate(e.target.value)}
						className="mt-1 w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
					/>
				</label>


				<div className="flex flex-wrap gap-3">
					<button
						onClick={handleSave}
						className="px-4 py-2 rounded-full bg-primary text-black font-black uppercase text-xs"
					>
						Guardar configuracion
					</button>
					<button
						onClick={onGoToCodigo}
						className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
					>
						Ir a Codigo
					</button>
					<button
						onClick={onGoToMenuControl}
						className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
					>
						Ir a menuControl
					</button>
				</div>

				{feedback && <p className="text-sm text-white/80">{feedback}</p>}
				{savedCode && (
					<p className="text-sm font-bold text-primary">
						Codigo generado/asignado: {savedCode}
					</p>
				)}
			</div>

			<section className="mt-6 bg-black/30 border border-white/10 rounded-2xl p-4">
				<h2 className="font-black uppercase text-sm mb-3">Disenos guardados temporalmente</h2>
				{designs.length === 0 && <p className="text-sm text-white/60">No hay disenos guardados aun.</p>}
				<div className="grid gap-2">
					{designs.map((design) => (
						<div
							key={design.code}
							className={`p-3 rounded-xl border border-white/20 cursor-pointer transition ${
								editingCode === design.code
									? 'bg-primary/20 border-primary'
									: 'bg-black/30 hover:bg-black/50'
							}`}
							onClick={() => loadDesign(design)}
						>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="font-bold text-white">{design.name || `Diseno ${design.code}`}</p>
									<p className="text-xs text-white/60">Codigo: {design.code}</p>
									<p className="text-xs text-white/50 mt-1">
										Creado: {new Date(design.createdAt).toLocaleDateString()}
									</p>
									{isDesignExpired(design.code) ? (
										<p className="text-xs font-bold text-danger mt-1">
											EXPIRADO ({formatDateForInput(design.expiryDate)})
										</p>
									) : (
										<p className="text-xs font-bold text-success mt-1">
											Vigente hasta {formatDateForInput(design.expiryDate)}
										</p>
									)}
								</div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleDeleteDesign(design.code);
									}}
									className="px-2 py-1 rounded-lg bg-danger/20 border border-danger/50 text-danger font-bold uppercase text-xs ml-2"
								>
									X
								</button>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
};

export default Disenio;
