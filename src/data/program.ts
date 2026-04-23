import type { WorkoutDay } from '../types'

const W = 'https://wger.de/media/exercise-images'

export const WORKOUT_PROGRAM: WorkoutDay[] = [
  {
    number: 1,
    title: 'Тренировка 1',
    exercises: [
      { id: 'w1_press',    name: 'Пресс (подъём ног / молитва)',         sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${W}/91/Crunches-1.png` },
      { id: 'w1_hyperext', name: 'Гиперэкстензия',                        sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${W}/128/Hyperextensions-1.png` },
      { id: 'w1_bench',    name: 'Жим штанги лёжа',                       sets: 3, repsRange: '8–10',                    imageUrl: `${W}/192/Bench-press-1.png` },
      { id: 'w1_row',      name: 'Тяга штанги к поясу',                   sets: 3, repsRange: '8–10',                    imageUrl: `${W}/109/Barbell-rear-delt-row-1.png` },
      { id: 'w1_leg_curl', name: 'Сгибание ног',                          sets: 3, repsRange: '8–10',                    imageUrl: `${W}/364/b318dde9-f5f2-489f-940a-cd864affb9e3.png` },
      { id: 'w1_bicep',    name: 'Подъём штанги на бицепс',               sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/74/Bicep-curls-1.png` },
      { id: 'w1_ohp',      name: 'Жим гантелей / штанги над головой',     sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/123/dumbbell-shoulder-press-large-1.png` },
      { id: 'w1_tricep',   name: 'Разгибание трицепса в блоке',           sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/1185/c5ca283d-8958-4fd8-9d59-a3f52a3ac66b.jpg` },
    ],
  },
  {
    number: 2,
    title: 'Тренировка 2',
    exercises: [
      { id: 'w2_press',      name: 'Пресс (подъём ног / молитва)',              sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${W}/91/Crunches-1.png` },
      { id: 'w2_hyperext',   name: 'Гиперэкстензия',                            sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${W}/128/Hyperextensions-1.png` },
      { id: 'w2_incline',    name: 'Жим гантели лёжа на наклонной (45°)',       sets: 3, repsRange: '8–10',                    imageUrl: `${W}/16/Incline-press-1.png` },
      { id: 'w2_cable_row',  name: 'Тяга блока параллельным хватом',            sets: 3, repsRange: '8–10',                    imageUrl: `${W}/512/b938437e-ff00-4679-9036-acb41bb28bbd.png` },
      { id: 'w2_leg_ext',    name: 'Разгибание ног',                            sets: 3, repsRange: '8–10',                    imageUrl: `${W}/369/78c915d1-e46d-4d30-8124-65d68664c3ef.png` },
      { id: 'w2_hammer',     name: 'Подъём гантелей на бицепс «молот»',         sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/86/Bicep-hammer-curl-1.png` },
      { id: 'w2_lateral',    name: 'Разведение гантелей в стороны',             sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/148/lateral-dumbbell-raises-large-2.png` },
      { id: 'w2_skull',      name: 'Разгибание гантели над головой (трицепс)',  sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/1519/fab7f641-27d4-40b5-8edd-1a0a137bfd94.gif` },
    ],
  },
  {
    number: 3,
    title: 'Тренировка 3',
    exercises: [
      { id: 'w3_press',       name: 'Пресс (подъём ног / молитва)',  sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${W}/91/Crunches-1.png` },
      { id: 'w3_hyperext',    name: 'Гиперэкстензия',                sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${W}/128/Hyperextensions-1.png` },
      { id: 'w3_crossover',   name: 'Сведение в кроссовере',         sets: 3, repsRange: '8–10',                    imageUrl: `${W}/71/Cable-crossover-2.png` },
      { id: 'w3_db_row',      name: 'Тяга гантели к поясу',          sets: 3, repsRange: '8–10',                    imageUrl: `${W}/1186/1987a039-cf35-437e-bbdc-40c53dd7d053.jpg` },
      { id: 'w3_hip_thrust',  name: 'Ягодичный мост',                sets: 3, repsRange: '8–10',                    imageUrl: `${W}/1642/a81ad922-caf5-47f8-99b4-640cb0717436.webp` },
      { id: 'w3_bicep_knee',  name: 'Бицепс с упором в колено',      sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/1649/441cc0e5-eca2-4828-8b0a-a0e554abb2ff.jpg` },
      { id: 'w3_upright_row', name: 'Тяга штанги к подбородку',      sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/693/05c91bd2-7814-40b6-b2d1-51ae942b8321.png` },
      { id: 'w3_french',      name: 'Французский жим',               sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${W}/50/695ced5c-9961-4076-add2-cb250d01089e.png` },
    ],
  },
]

export const WEEK_REPS: Record<number, { main: [number, number]; accessory: [number, number]; rir: string }> = {
  1: { main: [8, 10], accessory: [12, 16], rir: '1–2 в запасе' },
  2: { main: [8, 10], accessory: [12, 16], rir: '1–2 в запасе' },
  3: { main: [8, 10], accessory: [12, 16], rir: '0–1 в запасе' },
  4: { main: [6, 8],  accessory: [10, 12], rir: '0–1 в запасе' },
}

export const WEEK_SCHEME = [
  { week: 1, label: 'Неделя 1 — втягивающая', mainReps: '8–10', mainRPE: '1–2 в запасе' },
  { week: 2, label: 'Неделя 2', mainReps: '8–10', mainRPE: '1–2 в запасе' },
  { week: 3, label: 'Неделя 3', mainReps: '8–10', mainRPE: '0–1 в запасе' },
  { week: 4, label: 'Неделя 4', mainReps: '6–8', mainRPE: '0–1 в запасе' },
]

export function getTargetReps(weekNumber: number, isAccessory: boolean, isWarmup: boolean): [number, number] | null {
  if (isWarmup) return null
  const scheme = WEEK_REPS[weekNumber]
  if (!scheme) return null
  return isAccessory ? scheme.accessory : scheme.main
}
