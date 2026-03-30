import React, { useState } from 'react';

interface CodigoProps {
	onBack: () => void;
	onGoToDisenio: () => void;
	onGoToMenuControl: () => void;
	currentCode: string;
	onApplyCode: (code: string) => { ok: boolean; message: string };
}

const Codigo: React.FC<CodigoProps> = ({
	onBack,
	onGoToDisenio,
	onGoToMenuControl,
	currentCode,
	onApplyCode,
}) => {
	const [codeInput, setCodeInput] = useState(currentCode);
	const [status, setStatus] = useState('');

	const handleApply = () => {
		const result = onApplyCode(codeInput);
		setStatus(result.message);
	};

	const handleDefault = () => {
		setCodeInput('');
		const result = onApplyCode('');
		setStatus(result.message);
	};

	return (
		<div className="min-h-[100dvh] p-4 sm:p-6 max-w-2xl mx-auto text-white">
			<header className="flex items-center justify-between gap-3 mb-6">
				<button
					onClick={onBack}
					className="px-3 py-2 rounded-full bg-white/10 border border-white/15 uppercase text-xs font-bold"
				>
					Volver
				</button>
				<h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-primary">Aplicar Codigo</h1>
				<div className="w-16" />
			</header>

			<div className="bg-black/40 border border-white/10 rounded-2xl p-5 grid gap-4">
				<p className="text-sm text-white/75">
					Ingresa el codigo del diseno para aplicarlo a todos los componentes. Si no ingresas nada se usa el diseno por defecto.
				</p>

				<input
					value={codeInput}
					onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
					placeholder="Ej: AB12CD"
					className="w-full rounded-xl bg-background-dark border border-white/15 px-3 py-2"
				/>

				<div className="flex flex-wrap gap-3">
					<button
						onClick={handleApply}
						className="px-4 py-2 rounded-full bg-primary text-black font-black uppercase text-xs"
					>
						Aplicar codigo
					</button>
					<button
						onClick={handleDefault}
						className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
					>
						Usar diseno por defecto
					</button>
				</div>

				{status && <p className="text-sm text-white/85">{status}</p>}
				{currentCode && <p className="text-xs text-primary font-bold">Codigo activo: {currentCode}</p>}
			</div>

			<div className="mt-5 flex flex-wrap gap-3">
				<button
					onClick={onGoToDisenio}
					className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
				>
					Ir a Disenio
				</button>
				<button
					onClick={onGoToMenuControl}
					className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-bold uppercase text-xs"
				>
					Ir a menuControl
				</button>
			</div>
		</div>
	);
};

export default Codigo;
