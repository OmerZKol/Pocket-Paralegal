import {
  LLAMA3_2_1B_SPINQUANT,
  LLAMA3_2_1B_QLORA,
  LLAMA3_2_1B,
  LLAMA3_2_3B,
  LLAMA3_2_3B_QLORA,
  LLAMA3_2_3B_SPINQUANT
} from 'react-native-executorch';

export const AVAILABLE_MODELS = [
  { id: 'llama-3.2-1b-spinquant', name: 'Llama 3.2 1B (SpinQuant)', model: LLAMA3_2_1B_SPINQUANT, description: 'Ultra-compressed', warning: false },
  { id: 'llama-3.2-1b-qlora', name: 'Llama 3.2 1B (QLoRA)', model: LLAMA3_2_1B_QLORA, description: 'Optimized quality', warning: false },
  { id: 'llama-3.2-1b', name: 'Llama 3.2 1B', model: LLAMA3_2_1B, description: 'Fast & efficient', warning: true },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', model: LLAMA3_2_3B, description: 'Higher accuracy', warning: true },
  { id: 'llama-3.2-3b-qlora', name: 'Llama 3.2 3B (QLoRA)', model: LLAMA3_2_3B_QLORA, description: 'Balanced performance', warning: true },
  { id: 'llama-3.2-3b-spinquant', name: 'Llama 3.2 3B (SpinQuant)', model: LLAMA3_2_3B_SPINQUANT, description: 'Compressed 3B', warning: true },
];
