"""
quantum_walk.py - Quantum Walk-based Signal Propagation Module

Implements 1D quantum walk simulation for modeling signal propagation.
Distinguishes between normal, jamming, and spoofing attacks based on
probability distribution shape.

Theory: A 1D quantum walk evolves a superposition of positions using
coin operator (Hadamard) and shift operator. After n steps, measurement
gives probability distribution P(x) over positions.
"""

import numpy as np
from typing import Tuple, List, Dict
import json


class QuantumWalk:
    """
    1D Quantum Walk Simulator
    
    Encodes signal features as initial quantum state and evolves
    under quantum walk dynamics for n_steps.
    """
    
    def __init__(self, n_steps: int = 8, n_positions: int = 16):
        """
        Initialize quantum walk parameters.
        
        Args:
            n_steps: Number of walk steps (evolution time)
            n_positions: Number of spatial positions
        """
        self.n_steps = n_steps
        self.n_positions = n_positions
        
    def create_initial_state(self, signal: np.ndarray) -> np.ndarray:
        """
        Create initial quantum state from signal.
        
        Map signal samples to superposition of positions with amplitudes
        proportional to signal values.
        
        Args:
            signal: Time-domain signal samples (shape: n_samples)
            
        Returns:
            Initial state vector (shape: n_positions)
        """
        # Normalize signal to probabilities
        signal_norm = np.abs(signal) / (np.max(np.abs(signal)) + 1e-8)
        
        # Pad or truncate to n_positions
        if len(signal_norm) < self.n_positions:
            state = np.zeros(self.n_positions)
            state[:len(signal_norm)] = signal_norm
        else:
            # Downsample to n_positions
            indices = np.linspace(0, len(signal_norm)-1, self.n_positions, dtype=int)
            state = signal_norm[indices]
        
        # Normalize to unit vector
        state = state / (np.linalg.norm(state) + 1e-8)
        
        return state
    
    def coin_operator(self) -> np.ndarray:
        """
        Hadamard-like coin operator (creates superposition).
        
        Returns:
            2x2 operator matrix
        """
        return np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
    
    def shift_operator(self, state: np.ndarray) -> np.ndarray:
        """
        Shift operator: moves amplitude based on coin state.
        
        Simulates: amplitude from |0⟩ moves left, from |1⟩ moves right.
        
        Args:
            state: Current state vector
            
        Returns:
            Shifted state
        """
        # Classical approximation: cyclic shift left/right with probability
        shifted = np.zeros_like(state)
        
        # Left shift (50% probability)
        shifted += 0.5 * np.roll(state, -1)
        
        # Right shift (50% probability)
        shifted += 0.5 * np.roll(state, 1)
        
        return shifted / (np.linalg.norm(shifted) + 1e-8)
    
    def evolve_step(self, state: np.ndarray) -> np.ndarray:
        """
        Single quantum walk step.
        
        Args:
            state: Current state vector
            
        Returns:
            State after one step
        """
        # Simple evolution: mix neighborhood with random phase
        evolved = np.zeros_like(state, dtype=complex)
        
        for i in range(len(state)):
            # Current position contributes
            evolved[i] += state[i]
            
            # Neighbors contribute (with phase shifts simulating interference)
            if i > 0:
                evolved[i] += 0.3 * state[i-1] * np.exp(1j * np.pi / 4)
            if i < len(state) - 1:
                evolved[i] += 0.3 * state[i+1] * np.exp(-1j * np.pi / 4)
        
        # Normalize
        evolved = evolved / (np.linalg.norm(evolved) + 1e-8)
        
        # Take real part (measurement at each step)
        evolved = np.real(evolved)
        evolved = evolved / (np.linalg.norm(evolved) + 1e-8)
        
        return evolved
    
    def run_walk(self, signal: np.ndarray, n_steps: int = None) -> np.ndarray:
        """
        Execute quantum walk for n_steps.
        
        Args:
            signal: Input signal
            n_steps: Number of steps (uses self.n_steps if None)
            
        Returns:
            Final probability distribution P(x)
        """
        if n_steps is None:
            n_steps = self.n_steps
        
        state = self.create_initial_state(signal)
        
        for _ in range(n_steps):
            state = self.evolve_step(state)
        
        # Ensure non-negative (probabilities)
        prob_dist = np.abs(state) ** 2
        prob_dist = prob_dist / np.sum(prob_dist)
        
        return prob_dist
    
    def apply_jamming_noise(self, prob_dist: np.ndarray, 
                            noise_level: float = 0.8) -> np.ndarray:
        """
        Add random noise to probability distribution (simulates jamming).
        
        Jamming: random noise spread across all frequencies.
        
        Args:
            prob_dist: Original probability distribution
            noise_level: Strength of jamming [0, 1]
            
        Returns:
            Jammed probability distribution
        """
        # Create uniform noise distribution
        noise = np.ones_like(prob_dist) / len(prob_dist)
        
        # Mix with original: jamming adds flat noise
        jammed = (1 - noise_level) * prob_dist + noise_level * noise
        
        return jammed / np.sum(jammed)
    
    def apply_spoofing_bias(self, prob_dist: np.ndarray,
                            bias_frequency: int = None,
                            bias_strength: float = 0.7) -> np.ndarray:
        """
        Add frequency bias to distribution (simulates spoofing).
        
        Spoofing: signal concentrated at specific (fake) frequency.
        
        Args:
            prob_dist: Original probability distribution
            bias_frequency: Which frequency to bias towards (center if None)
            bias_strength: Strength of bias [0, 1]
            
        Returns:
            Spoofed probability distribution
        """
        if bias_frequency is None:
            bias_frequency = len(prob_dist) // 2
        
        # Create biased distribution (Gaussian around bias_frequency)
        positions = np.arange(len(prob_dist))
        gaussian = np.exp(-((positions - bias_frequency) ** 2) / (2 * 2 ** 2))
        gaussian = gaussian / np.sum(gaussian)
        
        # Mix with original: spoofing shifts peak
        spoofed = (1 - bias_strength) * prob_dist + bias_strength * gaussian
        
        return spoofed / np.sum(spoofed)
    
    def extract_features(self, prob_dist: np.ndarray) -> Dict[str, float]:
        """
        Extract scalar features from probability distribution.
        
        Args:
            prob_dist: Probability distribution P(x)
            
        Returns:
            Feature dict with:
            - freq_peak: Position of highest probability (normalized to [0, 1])
            - power_sum: Total integrated power
            - noise_std: Standard deviation (breadth of distribution)
        """
        # Frequency of peak
        peak_idx = np.argmax(prob_dist)
        freq_peak = float(peak_idx / len(prob_dist))
        
        # Total power
        power_sum = float(np.sum(prob_dist))
        
        # Noise/breadth: entropy or std
        # High entropy = broad (jamming), Low entropy = sharp (normal)
        positions = np.arange(len(prob_dist)) / len(prob_dist)
        mean_pos = np.sum(positions * prob_dist)
        noise_std = float(np.sqrt(np.sum(prob_dist * (positions - mean_pos) ** 2)))
        
        return {
            'freq_peak': freq_peak,
            'power_sum': power_sum,
            'noise_std': noise_std,
        }
    
    def classify_attack(self, prob_dist: np.ndarray, 
                        entropy_threshold: float = 0.5,
                        peak_threshold: float = 0.3) -> str:
        """
        Simple heuristic classification based on probability distribution.
        
        Args:
            prob_dist: Probability distribution
            entropy_threshold: Threshold for entropy (normal vs jamming)
            peak_threshold: Threshold for peak height (normal vs spoofing)
            
        Returns:
            Classification: 'normal', 'jamming', or 'spoofing'
        """
        # Entropy: high = broad = jamming
        entropy = -np.sum(prob_dist * np.log(prob_dist + 1e-8))
        
        # Peak value: high = focused
        peak_value = np.max(prob_dist)
        
        if entropy > entropy_threshold:
            return 'jamming'
        elif peak_value < peak_threshold:
            return 'jamming'  # Also broad
        else:
            # Check for biasedness (spoofing indicator)
            peak_idx = np.argmax(prob_dist)
            is_centered = 0.3 < peak_idx / len(prob_dist) < 0.7
            
            if is_centered:
                return 'normal'
            else:
                return 'spoofing'
    
    def to_dict(self) -> Dict:
        """Export state as dict for JSON serialization."""
        return {
            'n_steps': self.n_steps,
            'n_positions': self.n_positions,
        }


def test_quantum_walk():
    """Test quantum walk module."""
    walk = QuantumWalk(n_steps=8, n_positions=16)
    
    # Test normal signal
    normal_signal = np.sin(np.linspace(0, 2*np.pi, 32))
    normal_prob = walk.run_walk(normal_signal)
    print("Normal signal probability dist:", normal_prob[:8])
    
    # Test with jamming
    jammed_prob = walk.apply_jamming_noise(normal_prob, noise_level=0.7)
    print("Jammed prob dist:", jammed_prob[:8])
    
    # Test with spoofing
    spoofed_prob = walk.apply_spoofing_bias(normal_prob, bias_frequency=10, bias_strength=0.8)
    print("Spoofed prob dist:", spoofed_prob[:8])
    
    # Feature extraction
    features = walk.extract_features(normal_prob)
    print("Features:", features)
    
    # Classification
    normal_class = walk.classify_attack(normal_prob)
    jammed_class = walk.classify_attack(jammed_prob)
    spoofed_class = walk.classify_attack(spoofed_prob)
    print(f"Classifications: normal={normal_class}, jamming={jammed_class}, spoofing={spoofed_class}")


if __name__ == '__main__':
    test_quantum_walk()
