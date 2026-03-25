/**
 * Type definitions for Quantum ML system
 */

export interface QuantumWalkStage {
  probability_dist: number[];
  peak_frequency: number;
  entropy: number;
}

export interface FeatureExtractionStage {
  freq_peak: number;
  power_sum: number;
  noise_std: number;
}

export interface EncodingStage {
  circuit_qasm: string;
  state_vector_real: number[];
  state_vector_imag: number[];
  probabilities: number[];
  basis_labels: string[];
  entangled: boolean;
}

export interface ClusteringStage {
  cluster_label: 'normal' | 'jamming' | 'spoofing';
  kernel_scores: Record<string, number>;
  confidence: number;
}

export interface QSVMStage {
  prediction: 'normal' | 'jamming' | 'spoofing';
  confidence: number;
  decision_value: number;
}

export interface PipelineStages {
  quantum_walk: QuantumWalkStage;
  feature_extraction: FeatureExtractionStage;
  encoding: EncodingStage;
  clustering: ClusteringStage;
  qsvm: QSVMStage;
}

export interface ExecutionTimes {
  walk: number;
  feature: number;
  encoding: number;
  clustering: number;
  qsvm: number;
  total: number;
}

export interface QuantumInferenceResult {
  final_result: 'normal' | 'jamming' | 'spoofing' | 'error';
  confidence: number;
  attack_detected: boolean;
  pipeline_stages?: PipelineStages;
  metadata: {
    n_qubits: number;
    simulator: string;
    execution_times_ms: ExecutionTimes;
  };
  error?: string;
}

export interface QuantumTrainingResult {
  training_complete: boolean;
  model_saved: boolean;
  accuracy?: number;
  f1?: number;
  support_vectors?: number;
  total_samples?: number;
}

export interface QuantumMLStatusMessage {
  type: 'QUANTUM_TRAINING_COMPLETE' | 'QUANTUM_INFERENCE_COMPLETE';
  result: QuantumInferenceResult | QuantumTrainingResult;
  timestamp: string;
}

export interface QuantumVizData {
  circuit_qasm: string;
  state_vector: [number, number][]; // [real, imag] pairs
  basis_labels: string[];
  probabilities: number[];
  cluster_label: 'normal' | 'jamming' | 'spoofing';
  kernel_scores: Record<string, number>;
  quantum_walk_dist: number[];
}
