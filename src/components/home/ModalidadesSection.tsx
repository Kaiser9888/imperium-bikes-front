// src/components/home/ModalidadesSection.tsx
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
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {modalidades.map((modalidade) => {
                const Icon = modalidade.icon;
                return (
                    <button
                        key={modalidade.id}
                        className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#C9A96E]/30 transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center mb-2 group-hover:bg-[#C9A96E]/10 transition-colors">
                            <Icon className="w-4 h-4 text-gray-600 group-hover:text-[#C9A96E] transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-[#1A1A1A] text-center">
              {modalidade.nome}
            </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
              {modalidade.count}
            </span>
                    </button>
                );
            })}
        </div>
    );
}