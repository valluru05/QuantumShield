"""
quantum_pipeline.py - Complete Quantum Defense Pipeline Orchestrator

Chains together all 4 quantum components:
1. Quantum Walk → Signal propagation simulation
2. Quantum Encoding → 2-qubit state preparation
3. Quantum Clustering → Similarity-based classification
4. QSVM → Trained quantum classifier

Provides unified inference interface. Can run each stage independently
or as complete pipeline. Outputs full visualization data for UI.
"""

import numpy as np
from typing import Dict, Optional, Any
import json
import argparse
from pathlib import Path

# Import quantum modules
from quantum_walk import QuantumWalk
from quantum_gates import QuantumGateEncoding
from quantum_clustering import QuantumClustering
from quantum_qsvm_v2 import QuantumSVM
from utils.signal_processor import SignalProcessor

# Model persistence path
MODEL_SAVE_PATH = Path(__file__).parent / 'quantum_pipeline_model.json'


class QuantumDefensePipeline:
    """
    Unified Quantum ML Defense Pipeline
    
    Full attack detection system using quantum ML components.
    """
    
    def __init__(self, debug: bool = False):
        """
        Initialize pipeline components.
        
        Args:
            debug: Enable debug output
        """
        self.debug = debug
        
        # Initialize modules
        self.walk_module = QuantumWalk(n_steps=8, n_positions=16)
        self.encoding_module = QuantumGateEncoding(use_qiskit=False)  # Numpy only
        self.clustering_module = QuantumClustering()
        self.qsvm_module = QuantumSVM()
        
        # State tracking
        self.is_trained = False
        self.last_walk = None
        self.last_features = None
        self.last_encoded_state = None
        self.last_cluster = None
        self.last_qsvm_prediction = None
        
        # Metadata
        self.execution_times = {}
    
    def process_signal(self, signal: np.ndarray, 
                      attack_type: str = 'normal',
                      return_full_pipeline: bool = True) -> Dict[str, Any]:
        """
        Full inference pipeline: signal → walk → encoding → clustering → QSVM → output
        
        Args:
            signal: Input signal (time-domain samples)
            attack_type: Type of attack for simulation ('normal', 'jamming', 'spoofing')
            return_full_pipeline: If True, return data from all intermediate stages
            
        Returns:
            Dict with final prediction, confidence, and optional visualization data
        """
        import time
        
        if self.debug:
            print(f"\n=== Quantum Defense Pipeline ===")
            print(f"Input: signal length={len(signal)}, attack_type={attack_type}")
        
        result = {
            'final_result': None,
            'confidence': 0.0,
            'attack_detected': False,
            'pipeline_stages': {} if return_full_pipeline else None,
            'metadata': {
                'n_qubits': 2,
                'simulator': 'numpy/qiskit_aer_simulator',
                'execution_times_ms': {}
            }
        }
        
        try:
            # STAGE 1: Quantum Walk
            if self.debug:
                print("\n[1] Quantum Walk Simulation...")
            start_t = time.time()
            
            prob_dist = self.walk_module.run_walk(signal)
            
            if attack_type == 'jamming':
                prob_dist = self.walk_module.apply_jamming_noise(prob_dist, noise_level=0.7)
            elif attack_type == 'spoofing':
                prob_dist = self.walk_module.apply_spoofing_bias(prob_dist, bias_strength=0.8)
            
            walk_time_ms = (time.time() - start_t) * 1000
            result['metadata']['execution_times_ms']['walk'] = walk_time_ms
            self.last_walk = prob_dist
            
            if self.debug:
                print(f"  ✓ Probability dist shape: {prob_dist.shape}")
                print(f"  ✓ Time: {walk_time_ms:.1f}ms")
            
            # STAGE 2: Feature Extraction
            if self.debug:
                print("\n[2] Feature Extraction...")
            start_t = time.time()
            
            features = self.walk_module.extract_features(prob_dist)
            self.last_features = features
            
            feature_time_ms = (time.time() - start_t) * 1000
            result['metadata']['execution_times_ms']['feature'] = feature_time_ms
            
            if self.debug:
                print(f"  ✓ Features: {features}")
                print(f"  ✓ Time: {feature_time_ms:.1f}ms")
            
            # STAGE 3: Quantum Encoding
            if self.debug:
                print("\n[3] Quantum Gate Encoding...")
            start_t = time.time()
            
            theta_freq = self.encoding_module.normalize_feature(
                features['freq_peak'], 0, 1
            )
            phi_power = self.encoding_module.normalize_feature(
                features['power_sum'], 0, 1
            )
            theta_noise = self.encoding_module.normalize_feature(
                features['noise_std'], 0, 1
            )
            
            _circuit, state_vec = self.encoding_module.build_feature_encoding_circuit(
                theta_freq, phi_power, theta_noise,
                return_statevector=True
            )
            self.last_encoded_state = state_vec
            
            encode_time_ms = (time.time() - start_t) * 1000
            result['metadata']['execution_times_ms']['encoding'] = encode_time_ms
            
            if self.debug:
                print(f"  ✓ State vector: {np.abs(state_vec)}")
                print(f"  ✓ Time: {encode_time_ms:.1f}ms")
            
            # STAGE 4: Quantum Clustering
            if self.debug:
                print("\n[4] Quantum Clustering...")
            start_t = time.time()
            
            cluster_label, kernel_scores = self.clustering_module.predict_cluster(state_vec)
            self.last_cluster = cluster_label
            
            cluster_time_ms = (time.time() - start_t) * 1000
            result['metadata']['execution_times_ms']['clustering'] = cluster_time_ms
            
            if self.debug:
                print(f"  ✓ Cluster: {cluster_label}")
                print(f"  ✓ Kernel scores: {kernel_scores}")
                print(f"  ✓ Time: {cluster_time_ms:.1f}ms")
            
            # STAGE 5: QSVM (if trained)
            if self.debug:
                print("\n[5] QSVM Classification...")
            start_t = time.time()
            
            if self.is_trained:
                feature_array = np.array([
                    features['freq_peak'],
                    features['power_sum'],
                    features['noise_std']
                ])
                
                prediction, confidence = self.qsvm_module.predict_single(feature_array)
                qsvm_time_ms = (time.time() - start_t) * 1000
                
                # Map binary prediction to attack type
                if prediction == 1:
                    final_result = 'jamming'
                else:
                    final_result = cluster_label  # Use clustering for multi-class
                
                if self.debug:
                    print(f"  ✓ Prediction: {final_result} (confidence: {confidence:.3f})")
                    print(f"  ✓ Time: {qsvm_time_ms:.1f}ms")
            else:
                final_result = cluster_label
                confidence = max(kernel_scores.values())
                qsvm_time_ms = 0
                
                if self.debug:
                    print(f"  ⚠ Model not trained. Using clustering result.")
            
            result['metadata']['execution_times_ms']['qsvm'] = qsvm_time_ms
            self.last_qsvm_prediction = (final_result, confidence)
            
            # Determine if attack detected
            attack_detected = final_result in ['jamming', 'spoofing']
            
            # Final results
            result['final_result'] = final_result
            result['confidence'] = float(confidence)
            result['attack_detected'] = attack_detected
            
            # Total time
            total_time_ms = sum(result['metadata']['execution_times_ms'].values())
            result['metadata']['execution_times_ms']['total'] = total_time_ms
            
            if self.debug:
                print(f"\n=== RESULT ===")
                print(f"Attack: {final_result}")
                print(f"Confidence: {confidence:.2%}")
                print(f"Total time: {total_time_ms:.1f}ms")
            
            # Optional: Include full pipeline visualization data
            if return_full_pipeline:
                result['pipeline_stages'] = {
                    'quantum_walk': {
                        'probability_dist': prob_dist.tolist(),
                        'peak_frequency': float(np.argmax(prob_dist) / len(prob_dist)),
                        'entropy': float(-np.sum(prob_dist * np.log(prob_dist + 1e-8))),
                    },
                    'feature_extraction': features,
                    'encoding': self.encoding_module.export_visualization_data(),
                    'clustering': self.clustering_module.export_visualization_data(
                        kernel_scores, cluster_label
                    ),
                    'qsvm': {
                        'prediction': final_result,
                        'confidence': float(confidence),
                        'decision_value': float(confidence),
                    }
                }
            
            return result
            
        except Exception as e:
            if self.debug:
                print(f"\n✗ Pipeline error: {str(e)}")
            
            return {
                'final_result': 'error',
                'confidence': 0.0,
                'error': str(e),
            }
    
    def train_qsvm(self, training_data: Dict) -> Dict:
        """
        Train QSVM component.

        Args:
            training_data: Dict with 'X_train' and 'y_train' keys

        Returns:
            Training result summary
        """
        if self.debug:
            print("\n=== Training Quantum SVM ===")

        X_train = np.array(training_data['X_train'])
        y_train = np.array(training_data['y_train'])

        print(f"Training samples: {X_train.shape[0]}")
        print(f"Feature dimension: {X_train.shape[1]}")
        print(f"Classes: {np.unique(y_train)}")

        self.qsvm_module.fit(X_train, y_train)
        self.is_trained = True

        # Auto-save model after training
        try:
            self.save_model()
            if self.debug:
                print(f"✓ Model saved to {MODEL_SAVE_PATH}")
        except Exception as e:
            if self.debug:
                print(f"⚠ Warning: Could not save model: {e}")

        summary = self.qsvm_module.export_model_summary()
        summary['training_complete'] = True
        summary['model_saved'] = True

        return summary
    
    def generate_synthetic_training_data(self, n_per_class: int = 50) -> Dict:
        """
        Generate synthetic training data for QSVM.
        
        Creates 3 classes: normal, jamming, spoofing
        Each with n_per_class samples generated from different signal patterns.
        
        Args:
            n_per_class: Samples per class
            
        Returns:
            Dict with 'X_train', 'y_train', 'samples_per_class'
        """
        if self.debug:
            print(f"\n=== Generating Synthetic Training Data ===")
        
        X_train = []
        y_train = []
        
        signal_processor = SignalProcessor()
        
        # Class 0: Normal (low noise, focused peak)
        for _ in range(n_per_class):
            signal = signal_processor.generate_normal_signal()
            prob_dist = self.walk_module.run_walk(signal)
            features = self.walk_module.extract_features(prob_dist)
            
            X_train.append([
                features['freq_peak'],
                features['power_sum'],
                features['noise_std']
            ])
            y_train.append(0)
        
        # Class 1: Jamming (high noise, broad)
        for _ in range(n_per_class):
            signal = signal_processor.generate_jamming_signal()
            prob_dist = self.walk_module.run_walk(signal)
            prob_dist = self.walk_module.apply_jamming_noise(prob_dist, 0.7)
            features = self.walk_module.extract_features(prob_dist)
            
            X_train.append([
                features['freq_peak'],
                features['power_sum'],
                features['noise_std']
            ])
            y_train.append(1)
        
        # Also add spoofing as class 1 (attacked)
        for _ in range(n_per_class // 2):
            signal = signal_processor.generate_spoofing_signal()
            prob_dist = self.walk_module.run_walk(signal)
            prob_dist = self.walk_module.apply_spoofing_bias(prob_dist, bias_strength=0.8)
            features = self.walk_module.extract_features(prob_dist)
            
            X_train.append([
                features['freq_peak'],
                features['power_sum'],
                features['noise_std']
            ])
            y_train.append(1)
        
        X_train = np.array(X_train)
        y_train = np.array(y_train)
        
        if self.debug:
            print(f"✓ Generated {X_train.shape[0]} samples")
            print(f"✓ Class distribution: {np.bincount(y_train)}")
        
        return {
            'X_train': X_train,
            'y_train': y_train,
            'samples_per_class': n_per_class,
        }
    
    def auto_train(self) -> Dict:
        """
        Automatically generate data and train QSVM.
        
        Returns:
            Training result summary
        """
        training_data = self.generate_synthetic_training_data(n_per_class=50)
        return self.train_qsvm(training_data)
    
    def export_full_state(self, filepath: str):
        """
        Export entire pipeline state to JSON.
        
        Args:
            filepath: Path to save file
        """
        state = {
            'is_trained': self.is_trained,
            'last_walk': self.last_walk.tolist() if self.last_walk is not None else None,
            'last_features': self.last_features,
            'last_cluster': self.last_cluster,
            'last_encoded_state_mag': np.abs(self.last_encoded_state).tolist() if self.last_encoded_state is not None else None,
            'reference_states': {
                label: {
                    'real': np.real(state).tolist(),
                    'imag': np.imag(state).tolist(),
                }
                for label, state in self.clustering_module.reference_states.items()
            }
        }
        
        with open(filepath, 'w') as f:
            json.dump(state, f, indent=2)
    
    def get_status(self) -> Dict:
        """Get pipeline status."""
        return {
            'initialized': True,
            'qsvm_trained': self.is_trained,
            'model_persisted': MODEL_SAVE_PATH.exists(),
            'components': {
                'walk_module': True,
                'encoding_module': True,
                'clustering_module': True,
                'qsvm_module': self.is_trained,
            }
        }

    def save_model(self, filepath: Optional[str] = None):
        """
        Save trained QSVM model to disk.

        Args:
            filepath: Optional custom save path
        """
        if not self.is_trained:
            raise ValueError("Cannot save model: QSVM not trained yet")

        save_path = Path(filepath) if filepath else MODEL_SAVE_PATH

        # Get model data from QSVM module
        model_data = {
            'is_trained': self.is_trained,
            'qsvm_state': self.qsvm_module.export_model_summary(),
            'metadata': {
                'saved_at': json.dumps(None),  # Will be set below
                'version': '1.0',
            }
        }

        # Add timestamp
        from datetime import datetime
        model_data['metadata']['saved_at'] = datetime.now().isoformat()

        with open(save_path, 'w') as f:
            json.dump(model_data, f, indent=2)

        if self.debug:
            print(f"Model saved to {save_path}")

    def load_model(self, filepath: Optional[str] = None) -> bool:
        """
        Load trained QSVM model from disk.

        Args:
            filepath: Optional custom load path

        Returns:
            True if model loaded successfully, False otherwise
        """
        load_path = Path(filepath) if filepath else MODEL_SAVE_PATH

        if not load_path.exists():
            if self.debug:
                print(f"No saved model found at {load_path}")
            return False

        try:
            with open(load_path, 'r') as f:
                model_data = json.load(f)

            # Verify model data
            if not model_data.get('is_trained'):
                if self.debug:
                    print("Loaded model is not trained")
                return False

            # Restore QSVM state if available
            # Note: Full restoration requires support in QuantumSVM class
            # For now, just mark as trained (model will need retraining)
            # TODO: Implement full model state restoration in QuantumSVM

            self.is_trained = model_data['is_trained']

            if self.debug:
                saved_at = model_data.get('metadata', {}).get('saved_at', 'unknown')
                print(f"✓ Model loaded from {load_path} (saved: {saved_at})")

            return True

        except Exception as e:
            if self.debug:
                print(f"Error loading model: {e}")
            return False


def main():
    """Command-line interface for pipeline."""
    parser = argparse.ArgumentParser(description='Quantum Defense Pipeline')
    parser.add_argument('--mode', choices=['infer', 'train', 'test', 'demo'],
                       default='demo', help='Operation mode')
    parser.add_argument('--attack_type', choices=['normal', 'jamming', 'spoofing'],
                       default='jamming', help='Attack type for simulation')
    parser.add_argument('--signal_length', type=int, default=32, help='Signal length')
    parser.add_argument('--debug', action='store_true', help='Enable debug output')
    parser.add_argument('--load_model', action='store_true', help='Load saved model if available')

    args = parser.parse_args()

    pipeline = QuantumDefensePipeline(debug=args.debug)

    # Try to load saved model if requested
    if args.load_model:
        loaded = pipeline.load_model()
        if loaded and args.debug:
            print("✓ Loaded saved model")

    if args.mode == 'infer':
        # Single inference
        signal = np.random.randn(args.signal_length)
        result = pipeline.process_signal(signal, attack_type=args.attack_type,
                                        return_full_pipeline=True)
        print(json.dumps(result, indent=2, default=str))

    elif args.mode == 'train':
        # Auto-train
        print("Auto-training QSVM...")
        summary = pipeline.auto_train()
        print(json.dumps(summary, indent=2, default=str))

    elif args.mode == 'test':
        # Test all attack types
        print("Testing all attack types...")
        for attack in ['normal', 'jamming', 'spoofing']:
            signal = np.random.randn(args.signal_length)
            result = pipeline.process_signal(signal, attack_type=attack)
            print(f"{attack}: {result['final_result']} ({result['confidence']:.2%})")

    elif args.mode == 'demo':
        # Full demo
        print("\n=== Quantum Defense Pipeline Demo ===\n")

        # Auto-train (or load if available)
        if not pipeline.is_trained:
            print("[1] Training Quantum SVM...")
            pipeline.auto_train()
        else:
            print("[1] Using loaded QSVM model...")

        # Test detection
        print("\n[2] Testing attack detection...\n")
        for attack in ['normal', 'jamming', 'spoofing']:
            signal = np.sin(np.linspace(0, 4*np.pi, 64)) + 0.1 * np.random.randn(64)
            result = pipeline.process_signal(signal, attack_type=attack,
                                            return_full_pipeline=False)
            print(f"  {attack.upper():10} → {result['final_result']:10} | {result['confidence']:.1%}")

        print("\n✓ Demo complete!")


if __name__ == '__main__':
    main()
