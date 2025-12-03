import {
  LLAMA3_2_1B_QLORA,
  LLAMA3_2_1B,
  LLAMA3_2_3B,
  LLAMA3_2_3B_QLORA,
} from 'react-native-executorch';

// ============================================================================
// CUSTOM MODEL DEFINITIONS
// ============================================================================
// Use this section to define custom models outside of react-native-executorch
//
// Template for adding a custom model:
//
// const CUSTOM_MODEL_NAME = {
//   modelSource: 'https://your-cdn.com/path/to/model.pte',
//   tokenizerSource: 'https://your-cdn.com/path/to/tokenizer.json',
//   tokenizerConfigSource: 'https://your-cdn.com/path/to/tokenizer_config.json',
// };
//
// Then add to AVAILABLE_MODELS array below with:
// {
//   id: 'custom-model-id',                    // Unique identifier
//   name: 'Custom Model Name',                // Display name
//   model: CUSTOM_MODEL_NAME,                 // Model config object
//   description: 'Short description',         // Brief description
//   warning: true/false,                      // Show hardware warning?
//   hardwareRequirement: 'low'|'medium'|'high' // Hardware tier
// }
//
// Example:
// const QWEN2_5_3B_CUSTOM = {
//   modelSource: 'https://huggingface.co/your-org/qwen2.5-3b/resolve/main/model.pte',
//   tokenizerSource: 'https://huggingface.co/your-org/qwen2.5-3b/resolve/main/tokenizer.json',
//   tokenizerConfigSource: 'https://huggingface.co/your-org/qwen2.5-3b/resolve/main/tokenizer_config.json',
// };
// ============================================================================

// Add your custom model definitions here:
// const YOUR_CUSTOM_MODEL = { ... };


// ============================================================================
// AVAILABLE MODELS ARRAY
// ============================================================================
export const AVAILABLE_MODELS = [
  // Built-in Llama 3.2 models from react-native-executorch
  { id: 'llama-3.2-1b', name: 'Llama 3.2 1B', model: LLAMA3_2_1B, description: 'Fast & efficient', warning: true, hardwareRequirement: 'medium' },
  { id: 'llama-3.2-1b-qlora', name: 'Llama 3.2 1B (QLoRA)', model: LLAMA3_2_1B_QLORA, description: 'Optimised performance', warning: false, hardwareRequirement: 'low' },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', model: LLAMA3_2_3B, description: 'Higher accuracy', warning: true, hardwareRequirement: 'high' },
  { id: 'llama-3.2-3b-qlora', name: 'Llama 3.2 3B (QLoRA)', model: LLAMA3_2_3B_QLORA, description: 'Optimised performance', warning: true, hardwareRequirement: 'medium' },

  // Add your custom models here:
  // { id: 'custom-model', name: 'Custom Model', model: YOUR_CUSTOM_MODEL, description: 'Description', warning: false, hardwareRequirement: 'low' },
];
