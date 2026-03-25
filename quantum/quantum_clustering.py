"""
quantum_clustering.py - Quantum Clustering in Hilbert Space

Implements quantum kernel-based clustering using overlap of quantum states.
Defines reference "prototype" states for each attack type and classifies
new signals by computing quantum kernel distance.

Theory: Quantum kernel K(ψ_1, ψ_2) = |⟨ψ_1|ψ_2⟩|^2 measures overlap
between quantum states. States with high overlap are similar.
"""

import numpy as np
from typing import Dict, Tuple, List
import json


class QuantumClustering:
    """
    Quantum Clustering using Kernel Methods
    
    Pre-defines reference states for each class (normal, jamming, spoofing).
    Classifies new 2-qubit states by computing quantum kernel distances.
    """
    
    def __init__(self):
        """Initialize clustering module."""
        self.reference_states = {}
        self._generate_reference_states()
    
    def _generate_reference_states(self):
        """
        Generate prototype states for each attack type.
        
        These represent "typical" 2-qubit quantum states observed for each
        attack type. Generated from expected gate parameters for each scenario.
        """
        
        from quantum_gates import QuantumGateEncoding
        
        encoder = QuantumGateEncoding(use_qiskit=False)  # Use numpy
        
        # NORMAL: focused frequency, low noise, high power
        # Features: freq_peak=0.5, power_high, noise_low
        theta_normal_freq = np.pi * 0.5
        phi_normal_power = np.pi * 0.1
        theta_normal_noise = np.pi * 0.2
        _, normal_state = encoder.build_feature_encoding_circuit(
            theta_normal_freq, phi_normal_power, theta_normal_noise,
            return_statevector=True
        )
        self.reference_states['normal'] = normal_state
        
        # JAMMING: random noise across all frequencies, high entropy
        # Features: broad distribution, uniform probabilities
        theta_jamming_freq = np.pi * 0.3
        phi_jamming_power = np.pi * 0.4
        theta_jamming_noise = np.pi * 0.7  # High noise
        _, jamming_state = encoder.build_feature_encoding_circuit(
            theta_jamming_freq, phi_jamming_power, theta_jamming_noise,
            return_statevector=True
        )
        # Make it more uniform by adding noise
        jamming_state = jamming_state + 0.3 * np.random.randn(4).astype(complex)
        jamming_state = jamming_state / np.linalg.norm(jamming_state)
        self.reference_states['jamming'] = jamming_state
        
        # SPOOFING: biased frequency, looks like signal but shifted
        # Features: focused but at wrong frequency
        theta_spoofing_freq = np.pi * 0.8  # Different peak
        phi_spoofing_power = np.pi * 0.3
        theta_spoofing_noise = np.pi * 0.15
        _, spoofing_state = encoder.build_feature_encoding_circuit(
            theta_spoofing_freq, phi_spoofing_power, theta_spoofing_noise,
            return_statevector=True
        )
        self.reference_states['spoofing'] = spoofing_state
    
    def compute_quantum_kernel(self, state1: np.ndarray, 
                              state2: np.ndarray) -> float:
        """
        Compute quantum kernel between two states.
        
        K(ψ_1, ψ_2) = |⟨ψ_1|ψ_2⟩|^2
        
        This is the overlap (inner product magnitude squared) between
        two 2-qubit states.
        
        Args:
            state1: First state vector (shape: 4 for 2 qubits)
            state2: Second state vector (shape: 4 for 2 qubits)
            
        Returns:
            Kernel value in [0, 1]
        """
        # Inner product
        inner_product = np.dot(np.conj(state1), state2)
        
        # Magnitude squared
        kernel = np.abs(inner_product) ** 2
        
        return float(kernel)
    
    def compute_kernel_distances(self, state: np.ndarray) -> Dict[str, float]:
        """
        Compute quantum kernel distance to all reference states.
        
        Args:
            state: 2-qubit state vector to classify
            
        Returns:
            Dict mapping cluster label to kernel value (overlap)
        """
        distances = {}
        
        for label, ref_state in self.reference_states.items():
            kernel_val = self.compute_quantum_kernel(state, ref_state)
            distances[label] = kernel_val
        
        return distances
    
    def predict_cluster(self, state: np.ndarray) -> Tuple[str, Dict[str, float]]:
        """
        Predict cluster for new state.
        
        Args:
            state: 2-qubit state vector
            
        Returns:
            (cluster_label, kernel_distances)
        """
        kernel_distances = self.compute_kernel_distances(state)
        
        # Find cluster with highest kernel overlap
        cluster_label = max(kernel_distances, key=kernel_distances.get)
        
        return cluster_label, kernel_distances
    
    def compute_probability_scores(self, kernel_distances: Dict[str, float]) -> Dict[str, float]:
        """
        Convert kernel distances to probability scores.
        
        Uses softmax: P(cluster) = exp(kernel) / sum(exp(all kernels))
        
        Args:
            kernel_distances: Dict of kernel values
            
        Returns:
            Dict of normalized probabilities summing to 1
        """
        kernels = np.array(list(kernel_distances.values()))
        
        # Softmax: exp(x) / sum(exp(x))
        exp_kernels = np.exp(kernels)
        probs = exp_kernels / np.sum(exp_kernels)
        
        prob_dict = {}
        for label, prob in zip(kernel_distances.keys(), probs):
            prob_dict[label] = float(prob)
        
        return prob_dict
    
    def compute_kernel_matrix(self, states: List[np.ndarray]) -> np.ndarray:
        """
        Compute full pairwise kernel matrix for a set of states.
        
        Useful for training (QSVM) or batch processing.
        
        Args:
            states: List of state vectors (shape: [n_samples, 4])
            
        Returns:
            Kernel matrix (shape: [n_samples, n_samples])
        """
        n = len(states)
        K = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                K[i, j] = self.compute_quantum_kernel(states[i], states[j])
        
        return K
    
    def export_reference_states(self, filepath: str):
        """
        Save reference states to JSON.
        
        Args:
            filepath: Path to save JSON file
        """
        export_dict = {}
        
        for label, state in self.reference_states.items():
            export_dict[label] = {
                'real': np.real(state).tolist(),
                'imag': np.imag(state).tolist(),
            }
        
        with open(filepath, 'w') as f:
            json.dump(export_dict, f, indent=2)
    
    def load_reference_states(self, filepath: str):
        """
        Load reference states from JSON.
        
        Args:
            filepath: Path to JSON file
        """
        with open(filepath, 'r') as f:
            import_dict = json.load(f)
        
        self.reference_states = {}
        
        for label, data in import_dict.items():
            real_part = np.array(data['real'])
            imag_part = np.array(data['imag'])
            state = real_part + 1j * imag_part
            self.reference_states[label] = state
    
    def get_reference_states_dict(self) -> Dict[str, np.ndarray]:
        """Return copy of reference states."""
        return self.reference_states.copy()
    
    def export_visualization_data(self, kernel_distances: Dict[str, float],
                                  cluster_label: str) -> Dict:
        """
        Export data for cluster visualization.
        
        Args:
            kernel_distances: Dict of kernel values
            cluster_label: Predicted cluster
            
        Returns:
            Dict with visualization data
        """
        prob_scores = self.compute_probability_scores(kernel_distances)
        
        return {
            'cluster_label': cluster_label,
            'kernel_scores': kernel_distances,
            'probability_scores': prob_scores,
            'reference_states': {
                label: {
                    'real': np.real(state).tolist(),
                    'imag': np.imag(state).tolist(),
                }
                for label, state in self.reference_states.items()
            }
        }


def test_quantum_clustering():
    """Test quantum clustering module."""
    clustering = QuantumClustering()
    
    # Create a test state (similar to jamming)
    test_state = clustering.reference_states['jamming'].copy()
    test_state = test_state + 0.1 * np.random.randn(4).astype(complex)
    test_state = test_state / np.linalg.norm(test_state)
    
    # Predict cluster
    cluster_label, kernel_distances = clustering.predict_cluster(test_state)
    
    print(f"Predicted cluster: {cluster_label}")
    print(f"Kernel distances: {kernel_distances}")
    
    # Get probability scores
    prob_scores = clustering.compute_probability_scores(kernel_distances)
    print(f"Probability scores: {prob_scores}")
    
    # Compute full kernel matrix
    states = [clustering.reference_states[label] for label in ['normal', 'jamming', 'spoofing']]
    kernel_matrix = clustering.compute_kernel_matrix(states)
    print(f"\nKernel matrix:\n{kernel_matrix}")


if __name__ == '__main__':
    test_quantum_clustering()
