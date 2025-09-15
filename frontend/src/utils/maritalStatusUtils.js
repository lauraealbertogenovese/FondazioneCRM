// Mappatura stato civile da inglese a italiano
export const maritalStatusMap = {
  single: 'Celibe/Nubile',
  married: 'Coniugato/a',
  divorced: 'Divorziato/a',
  widowed: 'Vedovo/a',
  separated: 'Separato/a',
  cohabiting: 'Convivente'
};

// Funzione per convertire il valore inglese in italiano
export const getMaritalStatusLabel = (englishValue) => {
  if (!englishValue) return 'Non specificato';
  return maritalStatusMap[englishValue] || englishValue;
};

// Opzioni per i form (valore inglese per il backend, etichetta italiana per l'UI)
export const maritalStatusOptions = [
  { value: '', label: 'Seleziona...' },
  { value: 'single', label: 'Celibe/Nubile' },
  { value: 'married', label: 'Coniugato/a' },
  { value: 'divorced', label: 'Divorziato/a' },
  { value: 'widowed', label: 'Vedovo/a' },
  { value: 'separated', label: 'Separato/a' },
  { value: 'cohabiting', label: 'Convivente' }
];