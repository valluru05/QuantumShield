"""
quantum_qsvm_v2.py - Quantum Support Vector Machine (2-Qubit)

Implements a quantum SVM using 2-qubit feature map and quantum kernel.
Trains on dataset and makes predictions using quantum kernel trick.

Theory: QSVM uses quantum feature map φ(x) to map data to high-dimensional
Hilbert space. Decision boundary is computed in this space using quantum kernel.
Even with 2 qubits (4D space), this can separate complex patterns classically.
"""

import numpy as np
from typing import Tuple, List, Dict, Optional
import json
import pickle


class QuantumSVM:
    """
    Quantum Support Vector Machine (2-Qubit)
    
    Implementation:
    1. Feature map: x ∈ ℝ^3 → |ψ(x)⟩ ∈ C^4 (via 2-qubit circuit)
    2. Kernel: K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|^2
    3. Classifier: Classical SVM with quantum kernel
    """
    
    def __init__(self):
        """Initialize quantum SVM."""
        self.support_vectors_x = None
        self.support_vectors_y = None
        self.coefficients = None
        self.bias = 0.0
        self.n_support_vectors = 0
        self.is_trained = False
        self.reference_states = {}
        self.scaler_x_min = None
        self.scaler_x_max = None
    
    def _quantum_feature_map(self, x: np.ndarray) -> np.ndarray:
        """
        Map classical feature vector to 2-qubit state.
        
        Uses parameterized gates:
        - Ry(x[0]) on Q0
        - H on Q1
        - CNOT
        - Rz(x[1]) on Q0
        - Ry(x[2]) on Q1
        
        Args:
            x: Feature vector (shape: 3,) with values in [0, 1]
            
        Returns:
            2-qubit state vector (shape: 4,)
        """
        from quantum_gates import QuantumGateEncoding
        
        encoder = QuantumGateEncoding(use_qiskit=False)
        
        # Normalize to [0, π]
        theta1 = encoder.normalize_feature(x[0], 0, 1)
        phi = encoder.normalize_feature(x[1], 0, 1)
        theta2 = encoder.normalize_feature(x[2], 0, 1)
        
        # Build circuit and get state
        _, state = encoder.build_feature_encoding_circuit(
            theta1, phi, theta2,
            return_statevector=True
        )
        
        return state
    
    def _quantum_kernel(self, x_i: np.ndarray, x_j: np.ndarray) -> float:
        """
        Compute quantum kernel: K(x_i, x_j) = |⟨ψ(x_i)|ψ(x_j)⟩|^2
        
        Args:
            x_i: First feature vector
            x_j: Second feature vector
            
        Returns:
            Kernel value in [0, 1]
        """
        psi_i = self._quantum_feature_map(x_i)
        psi_j = self._quantum_feature_map(x_j)
        
        # Inner product
        inner = np.dot(np.conj(psi_i), psi_j)
        
        # Magnitude squared (kernel)
        kernel = np.abs(inner) ** 2
        
        return float(kernel)
    
    def _compute_kernel_matrix(self, X: np.ndarray) -> np.ndarray:
        """
        Compute full quantum kernel matrix for dataset.
        
        Args:
            X: Feature matrix (shape: [n_samples, 3])
            
        Returns:
            Kernel matrix (shape: [n_samples, n_samples])
        """
        n = X.shape[0]
        K = np.zeros((n, n))
        
        print(f"Computing {n}x{n} quantum kernel matrix...")
        for i in range(n):
            for j in range(n):
                K[i, j] = self._quantum_kernel(X[i], X[j])
                if (i * n + j) % max(1, n*n//10) == 0:
                    progress = (i * n + j) / (n * n) * 100
                    print(f"  Progress: {progress:.0f}%")
        
        return K
    
    def fit(self, X_train: np.ndarray, y_train: np.ndarray):
        """
        Train quantum SVM on dataset.
        
        Args:
            X_train: Training features (shape: [n_samples, 3])
            y_train: Training labels (shape: [n_samples,])
                     Binary labels: 0 or 1
        """
        print("Starting Quantum SVM training...")
        
        # Store training data for reference
        self.X_train = X_train.copy()
        self.y_train = y_train.copy()
        
        # Normalize training data
        self.scaler_x_min = X_train.min(axis=0)
        self.scaler_x_max = X_train.max(axis=0)
        X_normalized = (X_train - self.scaler_x_min) / (self.scaler_x_max - self.scaler_x_min + 1e-8)
        
        # Compute quantum kernel matrix
        K = self._compute_kernel_matrix(X_normalized)
        
        # Train classical SVM with quantum kernel
        try:
            from sklearn.svm import SVC
            
            svm = SVC(kernel='precomputed', C=1.0)
            svm.fit(K, y_train)
            
            # Extract support vectors and coefficients
            self.support_vectors_x = X_normalized[svm.support_]
            self.support_vectors_y = y_train[svm.support_]
            self.coefficients = svm.dual_coef_[0]
            self.bias = svm.intercept_[0]
            self.n_support_vectors = len(svm.support_)
            
            print(f"✓ Training complete. Support vectors: {self.n_support_vectors}/{len(X_train)}")
            self.is_trained = True
            
        except ImportError:
            print("Error: scikit-learn not available. Using simple kernel classifier.")
            self._train_simple_classifier(X_normalized, y_train, K)
    
    def _train_simple_classifier(self, X_normalized: np.ndarray,
                                y_train: np.ndarray, K: np.ndarray):
        """
        Simple classifier if scikit-learn unavailable.
        Uses threshold on kernel distances.
        """
        # Use means as centers
        class_0_mean = X_normalized[y_train == 0].mean(axis=0)
        class_1_mean = X_normalized[y_train == 1].mean(axis=0)
        
        self.support_vectors_x = np.array([class_0_mean, class_1_mean])
        self.support_vectors_y = np.array([0, 1])
        self.coefficients = np.array([1.0, -1.0])
        self.bias = 0.0
        self.n_support_vectors = 2
        self.is_trained = True
    
    def predict(self, X_test: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Make predictions on test data.
        
        Args:
            X_test: Test features (shape: [n_samples, 3])
            
        Returns:
            (predictions, confidence_scores) where:
            - predictions: Binary labels (0 or 1)
            - confidence_scores: Confidence in [0, 1]
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Normalize test data using training statistics
        X_normalized = (X_test - self.scaler_x_min) / (self.scaler_x_max - self.scaler_x_min + 1e-8)
        
        n_test = X_normalized.shape[0]
        predictions = np.zeros(n_test, dtype=int)
        confidence_scores = np.zeros(n_test)
        
        print(f"Making predictions on {n_test} samples...")
        
        for i in range(n_test):
            # Compute kernel with support vectors
            kernel_vals = np.array([self._quantum_kernel(X_normalized[i], sv)
                                   for sv in self.support_vectors_x])
            
            # Decision function: f(x) = sum(α_i * y_i * K(sv_i, x)) + b
            decision = np.sum(self.coefficients * self.support_vectors_y * kernel_vals) + self.bias
            
            # Confidence: apply sigmoid
            confidence = 1.0 / (1.0 + np.exp(-decision))
            
            # Prediction: threshold at 0.5
            prediction = 1 if confidence > 0.5 else 0
            
            predictions[i] = prediction
            confidence_scores[i] = confidence if prediction == 1 else (1 - confidence)
            
            if (i + 1) % max(1, n_test//10) == 0:
                print(f"  Progress: {(i+1)/n_test*100:.0f}%")
        
        return predictions, confidence_scores
    
    def predict_single(self, x: np.ndarray) -> Tuple[int, float]:
        """
        Predict single sample.
        
        Args:
            x: Feature vector (shape: 3,)
            
        Returns:
            (prediction, confidence)
        """
        predictions, confidence_scores = self.predict(x.reshape(1, -1))
        return predictions[0], confidence_scores[0]
    
    def save(self, filepath: str):
        """
        Save trained model to pickle.
        
        Args:
            filepath: Path to save file
        """
        model_dict = {
            'support_vectors_x': self.support_vectors_x,
            'support_vectors_y': self.support_vectors_y,
            'coefficients': self.coefficients,
            'bias': self.bias,
            'n_support_vectors': self.n_support_vectors,
            'is_trained': self.is_trained,
            'scaler_x_min': self.scaler_x_min,
            'scaler_x_max': self.scaler_x_max,
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_dict, f)
        
        print(f"Model saved to {filepath}")
    
    def load(self, filepath: str):
        """
        Load trained model from pickle.
        
        Args:
            filepath: Path to file
        """
        with open(filepath, 'rb') as f:
            model_dict = pickle.load(f)
        
        self.support_vectors_x = model_dict['support_vectors_x']
        self.support_vectors_y = model_dict['support_vectors_y']
        self.coefficients = model_dict['coefficients']
        self.bias = model_dict['bias']
        self.n_support_vectors = model_dict['n_support_vectors']
        self.is_trained = model_dict['is_trained']
        self.scaler_x_min = model_dict['scaler_x_min']
        self.scaler_x_max = model_dict['scaler_x_max']
        
        print(f"Model loaded from {filepath}")
    
    def export_model_summary(self) -> Dict:
        """
        Export model summary for visualization/reporting.
        
        Returns:
            Dict with model information
        """
        return {
            'model_type': 'Quantum SVM (2-qubit)',
            'is_trained': self.is_trained,
            'n_support_vectors': self.n_support_vectors,
            'support_vector_count': len(self.support_vectors_x) if self.support_vectors_x is not None else 0,
            'decision_bias': float(self.bias),
            'feature_ranges': {
                'min': self.scaler_x_min.tolist() if self.scaler_x_min is not None else [],
                'max': self.scaler_x_max.tolist() if self.scaler_x_max is not None else [],
            }
        }


def test_quantum_svm():
    """Test quantum SVM module."""
    from sklearn.datasets import make_blobs
    
    print("Generating training data...")
    X, y = make_blobs(n_samples=20, centers=2, n_features=3, random_state=42)
    
    # Normalize to [0, 1]
    X = (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0) + 1e-8)
    
    # Train/test split
    n_train = 15
    X_train, y_train = X[:n_train], y[:n_train]
    X_test, y_test = X[n_train:], y[n_train:]
    
    # Create and train QSVM
    qsvm = QuantumSVM()
    qsvm.fit(X_train, y_train)
    
    # Predict
    predictions, confidence = qsvm.predict(X_test)
    
    print(f"\nPredictions: {predictions}")
    print(f"Confidence: {confidence}")
    print(f"Ground truth: {y_test}")
    
    # Accuracy
    accuracy = np.mean(predictions == y_test)
    print(f"Accuracy: {accuracy:.2f}")
    
    # Export summary
    summary = qsvm.export_model_summary()
    print(f"\nModel summary: {json.dumps(summary, indent=2)}")


if __name__ == '__main__':
    test_quantum_svm()
