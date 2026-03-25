"""
signal_processor.py - Signal Processing Utilities for Quantum ML

Handles:
- Signal generation (normal, jamming, spoofing patterns)
- FFT decomposition
- Feature normalization
- Training data generation
"""

import numpy as np
from typing import Tuple, List


class SignalProcessor:
    """Signal processing utilities."""
    
    @staticmethod
    def generate_normal_signal(n_samples: int = 64, n_freq: int = 3) -> np.ndarray:
        """
        Generate normal signal: multiple sine waves at different frequencies.
        
        Args:
            n_samples: Number of samples
            n_freq: Number of frequency components
            
        Returns:
            Signal array
        """
        signal = np.zeros(n_samples)
        
        for i in range(n_freq):
            freq = 2 * np.pi * (i + 1) / n_samples
            amplitude = 1.0 / (i + 1)  # Decrease amplitude for higher freqs
            signal += amplitude * np.sin(np.arange(n_samples) * freq)
        
        # Add small noise
        signal += 0.05 * np.random.randn(n_samples)
        
        return signal / (np.max(np.abs(signal)) + 1e-8)
    
    @staticmethod
    def generate_jamming_signal(n_samples: int = 64) -> np.ndarray:
        """
        Generate jamming signal: Gaussian white noise.
        
        Args:
            n_samples: Number of samples
            
        Returns:
            Noise signal
        """
        signal = np.random.randn(n_samples)
        return signal / (np.max(np.abs(signal)) + 1e-8)
    
    @staticmethod
    def generate_spoofing_signal(n_samples: int = 64, target_freq: int = 1) -> np.ndarray:
        """
        Generate spoofing signal: looks like normal but at wrong frequency.
        
        Args:
            n_samples: Number of samples
            target_freq: Frequency to spoof
            
        Returns:
            Signal array
        """
        freq = 2 * np.pi * target_freq / n_samples
        signal = np.sin(np.arange(n_samples) * freq)
        
        # Add slight modulation
        signal = signal * (1 + 0.1 * np.sin(np.arange(n_samples) * freq / 2))
        
        # Add small noise
        signal += 0.08 * np.random.randn(n_samples)
        
        return signal / (np.max(np.abs(signal)) + 1e-8)
    
    @staticmethod
    def fft_decomposition(signal: np.ndarray, n_freqs: int = 16) -> np.ndarray:
        """
        FFT decomposition: convert time-domain to frequency-domain.
        
        Args:
            signal: Time-domain signal
            n_freqs: Number of frequency bins
            
        Returns:
            Magnitude spectrum (normalized)
        """
        # Compute FFT
        fft_vals = np.fft.fft(signal)
        
        # Take magnitude
        magnitude = np.abs(fft_vals[:len(signal)//2])
        
        # Downsample to n_freqs bins
        if len(magnitude) > n_freqs:
            indices = np.linspace(0, len(magnitude)-1, n_freqs, dtype=int)
            magnitude = magnitude[indices]
        elif len(magnitude) < n_freqs:
            magnitude = np.pad(magnitude, (0, n_freqs - len(magnitude)))
        
        # Normalize
        magnitude = magnitude / (np.sum(magnitude) + 1e-8)
        
        return magnitude
    
    @staticmethod
    def normalize_features(features: np.ndarray, 
                          feature_min: np.ndarray = None,
                          feature_max: np.ndarray = None) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Normalize features to [0, 1].
        
        Args:
            features: Feature array (shape: [n_samples, n_features])
            feature_min: Min values (computed if None)
            feature_max: Max values (computed if None)
            
        Returns:
            (normalized_features, feature_min, feature_max)
        """
        if feature_min is None:
            feature_min = features.min(axis=0)
        if feature_max is None:
            feature_max = features.max(axis=0)
        
        # Avoid division by zero
        denom = feature_max - feature_min + 1e-8
        
        normalized = (features - feature_min) / denom
        
        return normalized, feature_min, feature_max
    
    @staticmethod
    def create_training_dataset(
        n_normal: int = 50,
        n_jamming: int = 50,
        n_spoofing: int = 50,
        signal_length: int = 64
    ) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Create full training dataset.
        
        Args:
            n_normal: Number of normal samples
            n_jamming: Number of jamming samples  
            n_spoofing: Number of spoofing samples
            signal_length: Length of each signal
            
        Returns:
            (X_train, y_train, class_labels)
        """
        X_train = []
        y_train = []
        
        # Normal signals (class 0)
        for i in range(n_normal):
            signal = SignalProcessor.generate_normal_signal(signal_length)
            X_train.append(signal)
            y_train.append(0)
        
        # Jamming signals (class 1)
        for i in range(n_jamming):
            signal = SignalProcessor.generate_jamming_signal(signal_length)
            X_train.append(signal)
            y_train.append(1)
        
        # Spoofing signals (class 1 - also attack)
        for i in range(n_spoofing):
            signal = SignalProcessor.generate_spoofing_signal(signal_length)
            X_train.append(signal)
            y_train.append(1)
        
        X_train = np.array(X_train)
        y_train = np.array(y_train)
        
        # Shuffle
        indices = np.random.permutation(len(X_train))
        X_train = X_train[indices]
        y_train = y_train[indices]
        
        return X_train, y_train, ['normal', 'attack']


def test_signal_processor():
    """Test signal processor module."""
    processor = SignalProcessor()
    
    print("=== Signal Generation ===")
    
    # Normal signal
    normal = processor.generate_normal_signal()
    print(f"Normal signal: shape={normal.shape}, mean={normal.mean():.3f}, std={normal.std():.3f}")
    
    # Jamming signal
    jamming = processor.generate_jamming_signal()
    print(f"Jamming signal: shape={jamming.shape}, mean={jamming.mean():.3f}, std={jamming.std():.3f}")
    
    # Spoofing signal
    spoofing = processor.generate_spoofing_signal()
    print(f"Spoofing signal: shape={spoofing.shape}, mean={spoofing.mean():.3f}, std={spoofing.std():.3f}")
    
    print("\n=== FFT Decomposition ===")
    
    # FFT of each signal type
    normal_fft = processor.fft_decomposition(normal, n_freqs=16)
    jamming_fft = processor.fft_decomposition(jamming, n_freqs=16)
    spoofing_fft = processor.fft_decomposition(spoofing, n_freqs=16)
    
    print(f"Normal FFT peak: {normal_fft.max():.3f}, entropy: {-np.sum(normal_fft * np.log(normal_fft+1e-8)):.3f}")
    print(f"Jamming FFT peak: {jamming_fft.max():.3f}, entropy: {-np.sum(jamming_fft * np.log(jamming_fft+1e-8)):.3f}")
    print(f"Spoofing FFT peak: {spoofing_fft.max():.3f}, entropy: {-np.sum(spoofing_fft * np.log(spoofing_fft+1e-8)):.3f}")
    
    print("\n=== Training Dataset ===")
    
    X_train, y_train, labels = processor.create_training_dataset(n_normal=30, n_jamming=30, n_spoofing=30)
    print(f"Dataset shape: {X_train.shape}")
    print(f"Class distribution: {np.bincount(y_train)}")
    print(f"Class labels: {labels}")


if __name__ == '__main__':
    test_signal_processor()
