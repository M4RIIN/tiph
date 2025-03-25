// pages/index.tsx
"use client";

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, isSameDay, isSameMonth } from 'date-fns';

const trainingTypes = ['🏋️‍♀️ Salle', '🔥 Crossfit'];

interface TrainingDay {
  date: string; // yyyy-MM-dd
  type: string;
}

interface Objective {
  weeks: number;
  title: string;
  type: string;
  description: string;
}

const OBJECTIVES: Objective[] = [
  { weeks: 1, title: "Repas maison", type: "douce", description: "Un bon petit plat cuisiné par Marin." },
  { weeks: 2, title: "Massage relax ou sexy", type: "douce/sensuelle", description: "Un massage complet, détente ou coquin, à ton choix." },
  { weeks: 3, title: "Bain + Détente", type: "douce", description: "Bain chaud, bougies, playlist… tu ne fais rien, je gères tout." },
  { weeks: 4, title: "Soirée au choix", type: "fun", description: "Tu choisit le film, le repas, et l’activité." },
  { weeks: 5, title: "Enveloppe Sexy", type: "coquine", description: "Tu pioches une surprise sensuelle parmi des idées." },
  { weeks: 6, title: "Cadeau Surprise", type: "matérielle", description: "Un petit cadeau que tu kiffes : fringue, bijou…" },
  { weeks: 8, title: "Nuit Insolite", type: "expérience", description: "Nuit dans un lieu stylé ou insolite (cabane, air  bnb ..)." },
  { weeks: 10, title: "Fantasme débloqué", type: "coquine", description: "Un de tes fantasmes réalisé." },
  { weeks: 12, title: "Week-end surprise", type: "grosse récompense", description: "Un vrai weekend à deux, dans un endroit que tu kiffes ou que tu veux découvrir." },
  { weeks: 16, title: "Top du top", type: "prestige", description: "Spa luxe, dîner étoilé…" },
  { weeks: 17, title: "Le graal", type: "prestige", description: "Voyage de fou ?" },
];

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const alreadyExists = trainingDays.find(td => td.date === dateStr);
    if (alreadyExists) {
      setTrainingDays(trainingDays.filter(td => td.date !== dateStr));
    } else {
      const type = prompt("Quel type d'entraînement ? (salle / crossfit)");
      if (type === 'salle' || type === 'crossfit') {
        setTrainingDays([...trainingDays, {
          date: dateStr,
          type: type === 'salle' ? '🏋️‍♀️ Salle' : '🔥 Crossfit'
        }]);
      }
    }
  };

  const getTrainingForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return trainingDays.find(td => td.date === dateStr);
  };

  const getStats = () => {
    const total = trainingDays.filter(td => isSameMonth(new Date(td.date), currentMonth)).length;
    const salle = trainingDays.filter(td => isSameMonth(new Date(td.date), currentMonth) && td.type === '🏋️‍♀️ Salle').length;
    const crossfit = trainingDays.filter(td => isSameMonth(new Date(td.date), currentMonth) && td.type === '🔥 Crossfit').length;
    return { total, salle, crossfit };
  };

  const { total, salle, crossfit } = getStats();

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Suivi des entraînements 💪</h1>

      <div className="flex justify-between items-center mb-2">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>⬅️ Mois précédent</button>
        <h2 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>Mois suivant ➡️</button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {daysInMonth.map((day: Date) => {
          const training = getTrainingForDay(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={`p-2 rounded border text-sm flex flex-col items-center justify-center ${training ? 'bg-green-200' : 'bg-gray-100'} hover:bg-green-100`}
            >
              <span>{format(day, 'd')}</span>
              {training && <span className="text-xs">{training.type}</span>}
            </button>
          );
        })}
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Objectifs du mois 📅</h2>
        <ul className="list-disc ml-5 text-sm">
          <li>{total} séances au total</li>
          <li>{salle} séances de salle (objectif: 1+ par semaine)</li>
          <li>{crossfit} séances de crossfit (objectif: 2+ par semaine)</li>
        </ul>

        <div className="mt-4 h-4 w-full bg-gray-200 rounded">
          <div
            className="h-4 bg-green-500 rounded"
            style={{ width: `${Math.min((total / 12) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Progression vers objectif mensuel (12 séances)</p>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Récompenses 🔥</h2>
        <ul className="space-y-3">
          {OBJECTIVES.map(obj => {
            const percent = Math.min((total / (obj.weeks * 3)) * 100, 100);
            return (
              <li key={obj.weeks} className="border p-3 rounded">
                <div className="flex justify-between text-sm font-medium">
                  <span>{obj.title}</span>
                  <span>{percent.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded mt-1">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{obj.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}