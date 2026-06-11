import { Mountain, Timer, Bike, Crosshair, Car, Trophy } from 'lucide-react';

const modalidades = [
    { id: 1, nome: 'Mountain', icon: Mountain, count: 145 },
    { id: 2, nome: 'Speed', icon: Timer, count: 89 },
    { id: 3, nome: 'BMX', icon: Bike, count: 56 },
    { id: 4, nome: 'Downhill', icon: Crosshair, count: 34 },
    { id: 5, nome: 'Urbana', icon: Car, count: 78 },
    { id: 6, nome: 'Corrida', icon: Trophy, count: 23 },
];

export function ModalidadesSection() {
    return (
        <div className="grid grid-cols-3 gap-3">
            {modalidades.map((m) => {
                const Icon = m.icon;
                return (
                    <button
                        key={m.id}
                        className="bg-[#2F2F2F] border border-[#8B0000]/20 rounded p-4 flex flex-col items-center hover:border-[#DC143C] hover:bg-[#1A1A1A] transition-all group"
                    >
                        <Icon className="w-6 h-6 text-[#8B0000] group-hover:text-[#DC143C] mb-2" />
                        <span className="text-xs text-[#D4C5A9] group-hover:text-white">{m.nome}</span>
                        <span className="text-[10px] text-[#8B0000] mt-1">{m.count}</span>
                    </button>
                );
            })}
        </div>
    );
}