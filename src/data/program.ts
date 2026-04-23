import type { WorkoutDay } from '../types'

const G = 'https://gymvisual.com/img/p'

export const WORKOUT_PROGRAM: WorkoutDay[] = [
  {
    number: 1,
    title: 'Тренировка 1',
    exercises: [
      { id: 'w1_press',    name: 'Пресс (подъём ног / молитва)',         sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${G}/4/7/3/9/4739.gif` },
      { id: 'w1_hyperext', name: 'Гиперэкстензия',                        sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${G}/2/0/8/2/5/20825.gif` },
      { id: 'w1_bench',    name: 'Жим штанги лёжа',                       sets: 3, repsRange: '8–10',                    imageUrl: `${G}/3/3/1/3/8/33138.gif` },
      { id: 'w1_row',      name: 'Тяга штанги к поясу',                   sets: 3, repsRange: '8–10',                    imageUrl: `${G}/1/0/6/1/7/10617.gif` },
      { id: 'w1_leg_curl', name: 'Сгибание ног',                          sets: 3, repsRange: '8–10',                    imageUrl: `${G}/4/1/8/2/0/41820.gif` },
      { id: 'w1_bicep',    name: 'Подъём штанги на бицепс',               sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/4/1/7/9/0/41790.gif` },
      { id: 'w1_ohp',      name: 'Жим гантелей / штанги над головой',     sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/1/8/5/6/3/18563.gif` },
      { id: 'w1_tricep',   name: 'Разгибание трицепса в блоке',           sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/7/0/7/6/7076.gif` },
    ],
  },
  {
    number: 2,
    title: 'Тренировка 2',
    exercises: [
      { id: 'w2_press',      name: 'Пресс (подъём ног / молитва)',              sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${G}/4/7/3/9/4739.gif` },
      { id: 'w2_hyperext',   name: 'Гиперэкстензия',                            sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${G}/2/0/8/2/5/20825.gif` },
      { id: 'w2_incline',    name: 'Жим гантели лёжа на наклонной (45°)',       sets: 3, repsRange: '8–10',                    imageUrl: `${G}/1/4/1/1/4/14114.gif` },
      { id: 'w2_cable_row',  name: 'Тяга блока параллельным хватом',            sets: 3, repsRange: '8–10',                    imageUrl: `${G}/4/8/9/2/4892.gif` },
      { id: 'w2_leg_ext',    name: 'Разгибание ног',                            sets: 3, repsRange: '8–10',                    imageUrl: `${G}/9/2/1/1/9211.gif` },
      { id: 'w2_hammer',     name: 'Подъём гантелей на бицепс «молот»',         sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/1/0/4/6/9/10469.gif` },
      { id: 'w2_lateral',    name: 'Разведение гантелей в стороны',             sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/2/1/5/4/5/21545.gif` },
      { id: 'w2_skull',      name: 'Разгибание гантели над головой (трицепс)',  sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/2/7/3/4/2/27342.gif` },
    ],
  },
  {
    number: 3,
    title: 'Тренировка 3',
    exercises: [
      { id: 'w3_press',       name: 'Пресс (подъём ног / молитва)',  sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${G}/4/7/3/9/4739.gif` },
      { id: 'w3_hyperext',    name: 'Гиперэкстензия',                sets: 3, repsRange: '15',   isWarmup: true,    imageUrl: `${G}/2/0/8/2/5/20825.gif` },
      { id: 'w3_crossover',   name: 'Сведение в кроссовере',         sets: 3, repsRange: '8–10',                    imageUrl: `${G}/4/8/9/1/4891.gif` },
      { id: 'w3_db_row',      name: 'Тяга гантели к поясу',          sets: 3, repsRange: '8–10',                    imageUrl: `${G}/1/0/4/0/3/10403.gif` },
      { id: 'w3_hip_thrust',  name: 'Ягодичный мост',                sets: 3, repsRange: '8–10',                    imageUrl: `${G}/5/7/6/1/5761.gif` },
      { id: 'w3_bicep_knee',  name: 'Бицепс с упором в колено',      sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/7/6/2/9/7629.gif` },
      { id: 'w3_upright_row', name: 'Тяга штанги к подбородку',      sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/1/0/2/8/9/10289.gif` },
      { id: 'w3_french',      name: 'Французский жим',               sets: 2, repsRange: '15–20', isAccessory: true, imageUrl: `${G}/6/9/7/1/6971.gif` },
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
