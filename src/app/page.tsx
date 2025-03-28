// pages/index.tsx
"use client";

import { ReactElement, useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, isSameDay, isSameMonth, isSameWeek, startOfWeek } from 'date-fns';
import Modal from './component/Modal';

import { collection, setDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const trainingTypes = ['🏋️‍♀️ Salle', '🔥 Crossfit'];

interface TrainingDay {
  date: string; // yyyy-MM-dd
  type: string;
}

interface Objective {
  cost: number;
  title: string;
  type: string;
  description: string;
}

const OBJECTIVES: Objective[] = [
  { cost: 2, title: "Repas maison", type: "douce", description: "Un bon petit plat cuisiné par Marin." },
  { cost: 3, title: "Massage relax", type: "douce/sensuelle", description: "Un massage complet, détente, à ton choix." },
  { cost: 4, title: "Bain + Détente", type: "douce", description: "Bain chaud, bougies, playlist… tu ne fais rien, je gères tout." },
  { cost: 5, title: "Soirée au choix", type: "fun", description: "Tu choisis le film, le repas, et l’activité." },
  { cost: 6, title: "Enveloppe de choix", type: "coquine", description: "Tu pioches une surprise parmi des idées." },
  { cost: 7, title: "Cadeau Surprise", type: "matérielle", description: "Un petit cadeau que tu kiffes : fringue, bijou…" },
  { cost: 8, title: "Nuit Insolite", type: "expérience", description: "Nuit dans un lieu stylé ou insolite (cabane, air  bnb ..)." },
  { cost: 10, title: "Petit goal life débloqué", type: "coquine", description: "Un de tes petit goal life  réalisé." },
  { cost: 13, title: "Week-end surprise", type: "grosse récompense", description: "Un vrai weekend à deux, dans un endroit que tu kiffes ou que tu veux découvrir." },
  { cost: 16, title: "Top du top", type: "prestige", description: "Spa luxe, dîner étoilé…" },
  { cost: 17, title: "Le graal", type: "prestige", description: "Voyage de fou ?" },
];

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [contentModal, setContentModal] = useState<ReactElement>();
  const [dataLoaded, setDataLoaded] = useState(false);

  const saveToFirebase = async (trainingDays:TrainingDay[]) => {
    await setDoc(doc(db, "users", "tiph"), {
      trainingDays
    });
  };

  useEffect(() => {
    const loadFromFirebase = async () => {
      const docSnap = await getDocs(collection(db, "users"));
      const userDoc = docSnap.docs.find(doc => doc.id === "tiph");
      if (userDoc) {
        const data = userDoc.data();
        if (data.trainingDays) {
          setTrainingDays(data.trainingDays);
        }
      }
    };
    loadFromFirebase();
  }, []);
  

  const modalContentAdd =(day:Date) => {
   return ( <div className='flex h-30 gap-2'>
    <div className=' flex-1 flex border rounded-sm cursor-pointer' onClick={()=>handleTypeSeance('salle', day)}>
      <div className='m-auto'>
      🏋️‍♀️ Salle
      </div>
    </div>
    <div  className=' flex-1 flex border rounded-sm cursor-pointer' onClick={()=>handleTypeSeance('crossfit',day)}>
      <div className='m-auto'>
      🔥 Crossfit
      </div>
    </div>
  </div>
   )
  }

  const modalContentDelete = (day:Date)=> {
    const dateStr = format(day, 'yyyy-MM-dd');
   return( <div >
      On supprime cette séance ?
      
      <button onClick={()=>{setTrainingDays(trainingDays.filter(td => td.date !== dateStr));setIsModalOpen(false);saveToFirebase(trainingDays.filter(td => td.date !== dateStr))}}>Yes</button>
      <button onClick={()=>{setIsModalOpen(false)}}>Nope.</button>
    </div>)
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    const dateStr = format(day, 'yyyy-MM-dd');
    const alreadyExists = trainingDays.find(td => td.date === dateStr);
    if (alreadyExists) {
      setContentModal(() => modalContentDelete(day))
      setIsModalOpen(true)
    } else {
      setContentModal(() => modalContentAdd(day))
      setIsModalOpen(true);
    }
  };

  const handleTypeSeance = (type:String, day:Date)=>{
    const dateStr = format(day, 'yyyy-MM-dd');
    const newState = [...trainingDays, {
      date: dateStr,
      type: type === 'salle' ? '🏋️‍♀️ Salle' : '🔥 Crossfit'
    }];
    setTrainingDays(newState);
    setIsModalOpen(false)
    saveToFirebase(newState)
  }

  const getTrainingForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return trainingDays.find(td => td.date === dateStr);
  };

  const getStats = () => {
    const totalSemaineActuelle = trainingDays.filter(td => isSameMonth(new Date(td.date), currentMonth) && isSameWeek(new Date(td.date),new Date())).length;
    const totalSalleSemaineActuelle = trainingDays.filter(td => isSameMonth(new Date(td.date), currentMonth) && isSameWeek(new Date(td.date),new Date()) && td.type === '🏋️‍♀️ Salle').length;
    const totalCossfitSemaineActuelle = trainingDays.filter(td => isSameMonth(new Date(td.date), currentMonth) && isSameWeek(new Date(td.date),new Date()) && td.type === '🔥 Crossfit').length;
    

    const totalMoisActuel = trainingDays.filter(td => isSameMonth(new Date(td.date), new Date())).length;
    const totalSalleMoisActuel = trainingDays.filter(td => isSameMonth(new Date(td.date), new Date()) && td.type === '🏋️‍♀️ Salle').length;
    const totalCossfitMoisActuel = trainingDays.filter(td => isSameMonth(new Date(td.date), new Date())  && td.type === '🔥 Crossfit').length;
    
    return { totalSemaineActuelle,totalSalleSemaineActuelle,totalCossfitSemaineActuelle,totalMoisActuel,totalSalleMoisActuel,totalCossfitMoisActuel };
  };

  const { totalSemaineActuelle, totalSalleSemaineActuelle, totalCossfitSemaineActuelle,totalCossfitMoisActuel,totalMoisActuel,totalSalleMoisActuel } = getStats();

  const getValidWeeksCount = (trainingDays: TrainingDay[]) => {

    const weeksMap = new Map<string, TrainingDay[]>();
  
    trainingDays.forEach(td => {
      const weekStart = format(startOfWeek(new Date(td.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      if (!weeksMap.has(weekStart)) {
        weeksMap.set(weekStart, []);
      }
      weeksMap.get(weekStart)?.push(td);
    });
  
    let validWeeks = 0;
  
    weeksMap.forEach(weekTrainings => {
      const salle = weekTrainings.filter(td => td.type === '🏋️‍♀️ Salle').length;
      const crossfit = weekTrainings.filter(td => td.type === '🔥 Crossfit').length;
  
      if (salle + crossfit >= 3) {
        validWeeks += 1;
      }
    });
  
    return validWeeks;
  };

  const validWeeks = getValidWeeksCount(trainingDays);

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tiph Tracker 💪</h1>

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
      <p className="mt-4 text-sm text-gray-700">
        Nombre Semaines valides (3 entraînements par semaines) : <strong>{validWeeks}</strong> points
      </p>


      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Objectifs de la semaine 📅</h2>
        <ul className="list-disc ml-5 text-sm">
          {/* <li>
            <div className='flex gap-2'>
              <div className='whitespace-nowrap'>
              {total} séances au total ( objectif: 3 par semaine)
              </div>
              <div className="h-4 w-full bg-gray-200 rounded relative">
                <div
                  className="h-4 bg-green-500 rounded"
                  style={{ width: `${Math.min((total / 3) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </li> */}
          
          <li>
          <div className='flex gap-2'>
          <div className='whitespace-nowrap'>
              {totalSalleSemaineActuelle} séances de salle 
              </div>
              <div className="h-4 w-full bg-gray-200 rounded relative">
                <div
                  className="h-4 bg-green-500 rounded"
                  style={{ width: `${Math.min((totalSalleSemaineActuelle /1) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </li>
          <li>
          <div className='flex gap-2'>
          <div className='whitespace-nowrap'>
              {totalCossfitSemaineActuelle} séances de crossfit 
              </div>
              <div className=" h-4 w-full bg-gray-200 rounded relative">
                <div
                  className="h-4 bg-green-500 rounded"
                  style={{ width: `${Math.min((totalCossfitSemaineActuelle / 2) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </li>
        </ul>

        <div className="mt-4 h-4 w-full bg-gray-200 rounded">
          <div
            className="h-4 bg-green-500 rounded"
            style={{ width: `${Math.min((totalSemaineActuelle / 3) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Progression vers objectif hebdomadaire (3 séances)</p>
      </div>


      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Objectifs du mois 📅</h2>
        <ul className="list-disc ml-5 text-sm">
          {/* <li>
            <div className='flex gap-2'>
              <div className='whitespace-nowrap'>
              {total} séances au total ( objectif: 3 par semaine)
              </div>
              <div className="h-4 w-full bg-gray-200 rounded relative">
                <div
                  className="h-4 bg-green-500 rounded"
                  style={{ width: `${Math.min((total / 3) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </li> */}
          
          <li>
          <div className='flex gap-2'>
          <div className='whitespace-nowrap'>
              {totalSalleMoisActuel} séances de salle 
              </div>
              <div className=" h-4 w-full bg-gray-200 rounded relative">
                <div
                  className="h-4 bg-green-500 rounded"
                  style={{ width: `${Math.min((totalSalleMoisActuel /4) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </li>
          <li>
          <div className='flex gap-2'>
          <div className='whitespace-nowrap'>
              {totalCossfitMoisActuel} séances de crossfit 
              </div>
              <div className=" h-4 w-full bg-gray-200 rounded relative">
                <div
                  className="h-4 bg-green-500 rounded"
                  style={{ width: `${Math.min((totalCossfitMoisActuel / 8) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </li>
        </ul>

        <div className="mt-4 h-4 w-full bg-gray-200 rounded">
          <div
            className="h-4 bg-green-500 rounded"
            style={{ width: `${Math.min((totalMoisActuel / 12) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Progression vers objectif mensuel (12 séances)</p>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Récompenses 🔥</h2>
        <ul className="space-y-3">
          {OBJECTIVES.map(obj => {
            const percent = Math.min((validWeeks / (obj.cost)) * 100, 100);
            return (
              <li key={obj.cost} className="border p-3 rounded">
                <div className="flex justify-between text-sm font-medium">
                  <span>{obj.title} (coût: {obj.cost} point(s))</span>
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
      <Modal isOpen={isModalOpen} onClosed={() => {
        setIsModalOpen(false);
      } } 
      content={
       contentModal ?? (<div></div>)
      }/>
    </main>


  );
}