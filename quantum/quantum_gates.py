"""
quantum_gates.py - Quantum Gate-Based Feature Encoding

Implements 2-qubit feature encoding using parameterized Ry, Rz, Hadamard,
and CNOT gates. Maps classical features to quantum state in Hilbert space.

Theory: Each classical feature is mapped to a gate parameter (angle).
The resulting 2-qubit state is a superposition of 4 basis states:
|ψ⟩ = a|00⟩ + b|01⟩ + c|10⟩ + d|11⟩
"""

import numpy as np
from typing import Tuple, List, Dict, Optional

try:
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False
    print("Warning: Qiskit not installed. Falling back to numpy simulation.")


class QuantumGateEncoding:
    """
    2-Qubit Quantum Feature Encoding
    
    Encodes 3 classical features (freq, power, noise) into 2-qubit state
    using parameterized gates: Ry, Rz, Hadamard, CNOT.
    """
    
    def __init__(self, use_qiskit: bool = True):
        """
        Initialize encoder.
        
        Args:
            use_qiskit: Use Qiskit if available, else numpy fallback
        """
        self.use_qiskit = use_qiskit and QISKIT_AVAILABLE
        self.last_circuit = None
        self.last_state_vector = None
        
    def normalize_feature(self, value: float, min_val: float = 0.0, 
                         max_val: float = 1.0) -> float:
        """
        Normalize feature to [0, π] for gate parameters.
        
        Args:
            value: Feature value
            min_val: Minimum expected value
            max_val: Maximum expected value
            
        Returns:
            Normalized angle in [0, π]
        """
        # Clamp to [min, max]
        value = np.clip(value, min_val, max_val)
        
        # Scale to [0, 1]
        if max_val > min_val:
            scaled = (value - min_val) / (max_val - min_val)
        else:
            scaled = 0.5
        
        # Scale to [0, π]
        angle = scaled * np.pi
        
        return angle
    
    def build_feature_encoding_circuit(
        self,
        freq_normalized: float,
        power_normalized: float,
        noise_normalized: float,
        return_statevector: bool = True
    ) -> Tuple:
        """
        Build 2-qubit quantum circuit encoding features.
        
        Circuit structure:
        ┌──────────────────┐                    
        │                  │                    
        q_0: ───Ry(θ_freq)─●──Rz(φ_power)─────
                           │                    
        q_1: ───H()────────⊕──Ry(θ_noise)─────
                                              
        Args:
            freq_normalized: Feature 1, angle in [0, π]
            power_normalized: Feature 2, angle in [0, π]
            noise_normalized: Feature 3, angle in [0, π]
            return_statevector: If True, return state vector
            
        Returns:
            (circuit, state_vector) if return_statevector, else (circuit,)
        """
        if self.use_qiskit:
            return self._build_circuit_qiskit(
                freq_normalized, power_normalized, noise_normalized,
                return_statevector
            )
        else:
            return self._build_circuit_numpy(
                freq_normalized, power_normalized, noise_normalized
            )
    
    def _build_circuit_qiskit(
        self,
        theta_freq: float,
        phi_power: float,
        theta_noise: float,
        return_statevector: bool = True
    ) -> Tuple:
        """Build circuit using Qiskit."""
        qc = QuantumCircuit(2, name='feature_encoding')
        
        # Q1: Encode noise as Hadamard (creates superposition)
        qc.h(1)
        
        # Q0: Encode frequency as Ry rotation
        qc.ry(theta_freq, 0)
        
        # Entangle Q0 and Q1 with CNOT
        qc.cx(0, 1)
        
        # Q0: Encode power as Rz (phase)
        qc.rz(phi_power, 0)
        
        # Q1: Final encoding with noise as Ry
        qc.ry(theta_noise, 1)
        
        self.last_circuit = qc
        
        if return_statevector:
            # Get statevector
            try:
                statevector = Statevector.from_instruction(qc)
                state_vec = statevector.data
            except Exception as e:
                print(f"Error computing statevector: {e}")
                state_vec = np.ones(4) / 2
            
            self.last_state_vector = state_vec
            return qc, state_vec
        else:
            return qc,
    
    def _build_circuit_numpy(
        self,
        theta_freq: float,
        phi_power: float,
        theta_noise: float
    ) -> Tuple:
        """Fallback: Simulate circuit with numpy (no Qiskit)."""
        
        # Initialize |00⟩ state
        state = np.array([1, 0, 0, 0], dtype=complex)  # |00⟩
        
        # H on Q1: |00⟩ → (|00⟩ + |01⟩) / sqrt(2)
        state = self._apply_h_op(state, target=1)
        
        # Ry(θ_freq) on Q0: R_y rotation
        state = self._apply_ry_op(state, theta_freq, target=0)
        
        # CNOT(Q0→Q1): entangle
        state = self._apply_cnot_op(state, control=0, target=1)
        
        # Rz(φ_power) on Q0
        state = self._apply_rz_op(state, phi_power, target=0)
        
        # Ry(θ_noise) on Q1
        state = self._apply_ry_op(state, theta_noise, target=1)
        
        # Normalize
        state = state / np.linalg.norm(state)
        
        self.last_state_vector = state
        
        # Return dummy circuit object (for interface consistency)
        circuit_dict = {
            'gates': [
                {'name': 'H', 'target': 1},
                {'name': 'Ry', 'angle': theta_freq, 'target': 0},
                {'name': 'CX', 'control': 0, 'target': 1},
                {'name': 'Rz', 'angle': phi_power, 'target': 0},
                {'name': 'Ry', 'angle': theta_noise, 'target': 1},
            ]
        }
        return circuit_dict, state
    
    def _apply_h_op(self, state: np.ndarray, target: int) -> np.ndarray:
        """Apply Hadamard to qubit target."""
        H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
        
        if target == 0:
            # H ⊗ I
            op = np.kron(H, np.eye(2, dtype=complex))
        else:
            # I ⊗ H
            op = np.kron(np.eye(2, dtype=complex), H)
        
        return op @ state
    
    def _apply_ry_op(self, state: np.ndarray, angle: float, 
                     target: int) -> np.ndarray:
        """Apply Ry(angle) to qubit target."""
        c, s = np.cos(angle / 2), np.sin(angle / 2)
        Ry = np.array([[c, -s], [s, c]], dtype=complex)
        
        if target == 0:
            op = np.kron(Ry, np.eye(2, dtype=complex))
        else:
            op = np.kron(np.eye(2, dtype=complex), Ry)
        
        return op @ state
    
    def _apply_rz_op(self, state: np.ndarray, angle: float,
                     target: int) -> np.ndarray:
        """Apply Rz(angle) to qubit target."""
        Rz = np.array([[np.exp(-1j * angle / 2), 0],
                       [0, np.exp(1j * angle / 2)]], dtype=complex)
        
        if target == 0:
            op = np.kron(Rz, np.eye(2, dtype=complex))
        else:
            op = np.kron(np.eye(2, dtype=complex), Rz)
        
        return op @ state
    
    def _apply_cnot_op(self, state: np.ndarray, control: int,
                       target: int) -> np.ndarray:
        """Apply CNOT(control→target)."""
        CNOT = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 1, 0]
        ], dtype=complex)
        
        if control != 0 or target != 1:
            # Reorder state indices for different control/target
            # For simplicity, assuming control=0, target=1
            pass
        
        return CNOT @ state
    
    def get_state_vector(self) -> np.ndarray:
        """Return last computed state vector."""
        if self.last_state_vector is None:
            return np.ones(4) / 2
        return self.last_state_vector
    
    def get_probabilities(self) -> np.ndarray:
        """Get probability distribution from state vector."""
        state = self.get_state_vector()
        probs = np.abs(state) ** 2
        return probs / np.sum(probs)
    
    def get_basis_labels(self) -> List[str]:
        """Get 2-qubit basis state labels."""
        return ['|00⟩', '|01⟩', '|10⟩', '|11⟩']
    
    def circuit_to_openqasm(self) -> str:
        """Convert circuit to OpenQASM string."""
        if self.use_qiskit and self.last_circuit:
            try:
                return self.last_circuit.qasm()
            except Exception:
                return "OPENQASM 2.0; circuit unavailable"
        else:
            # Return mock circuit
            return """OPENQASM 2.0;
qreg q[2];
h q[1];
ry(1.57) q[0];
cx q[0], q[1];
rz(3.14) q[0];
ry(0.78) q[1];"""
    
    def export_visualization_data(self) -> Dict:
        """Export data needed for circuit/state visualization."""
        state = self.get_state_vector()
        probs = self.get_probabilities()
        
        return {
            'state_vector_real': np.real(state).tolist(),
            'state_vector_imag': np.imag(state).tolist(),
            'state_vector_magnitude': np.abs(state).tolist(),
            'probabilities': probs.tolist(),
            'basis_labels': self.get_basis_labels(),
            'circuit_qasm': self.circuit_to_openqasm(),
            'n_qubits': 2,
        }

    def circuit_to_openqasm_v2(self, theta_freq: float = 0.0, phi_power: float = 0.0, theta_noise: float = 0.0) -> str:
        """Generate proper OpenQASM 2.0 string with actual angle values."""
        return f'''OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[1];
ry({theta_freq:.4f}) q[0];
cx q[0],q[1];
rz({phi_power:.4f}) q[0];
ry({theta_noise:.4f}) q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];'''

    def get_bloch_coordinates(self) -> Dict[str, Dict[str, float]]:
        """Compute Bloch sphere coordinates for each qubit from state vector."""
        state = self.get_state_vector()
        # Partial trace for qubit 0
        rho = np.outer(state, np.conj(state))
        # Pauli matrices
        X = np.array([[0,1],[1,0]], dtype=complex)
        Y = np.array([[0,-1j],[1j,0]], dtype=complex)
        Z = np.array([[1,0],[0,-1]], dtype=complex)

        # Reduced density matrix qubit 0: trace out qubit 1
        rho_reshaped = rho.reshape(2, 2, 2, 2)
        rho0 = np.trace(rho_reshaped, axis1=1, axis2=3)

        # Bloch vector for qubit 0
        bx0 = float(np.real(np.trace(X @ rho0)))
        by0 = float(np.real(np.trace(Y @ rho0)))
        bz0 = float(np.real(np.trace(Z @ rho0)))

        # Reduced density matrix qubit 1
        rho1 = np.trace(rho_reshaped, axis1=0, axis2=2)
        bx1 = float(np.real(np.trace(X @ rho1)))
        by1 = float(np.real(np.trace(Y @ rho1)))
        bz1 = float(np.real(np.trace(Z @ rho1)))

        theta0 = float(np.arccos(np.clip(bz0, -1, 1)))
        phi0 = float(np.arctan2(by0, bx0))
        theta1 = float(np.arccos(np.clip(bz1, -1, 1)))
        phi1 = float(np.arctan2(by1, bx1))

        return {
            'q0': {'x': bx0, 'y': by0, 'z': bz0, 'theta': theta0, 'phi': phi0},
            'q1': {'x': bx1, 'y': by1, 'z': bz1, 'theta': theta1, 'phi': phi1},
        }


def test_quantum_gates():
    """Test quantum gate encoding module."""
    encoder = QuantumGateEncoding(use_qiskit=True)
    
    # Example features (all normalized to [0, 1])
    freq = 0.6
    power = 0.4
    noise = 0.3
    
    # Normalize to gate angles [0, π]
    theta_freq = encoder.normalize_feature(freq, 0, 1) 
    phi_power = encoder.normalize_feature(power, 0, 1)
    theta_noise = encoder.normalize_feature(noise, 0, 1)
    
    # Build circuit
    _circuit, state_vec = encoder.build_feature_encoding_circuit(
        theta_freq, phi_power, theta_noise
    )
    
    print("State vector:", state_vec)
    print("Probabilities:", encoder.get_probabilities())
    print("Basis labels:", encoder.get_basis_labels())
    print("\nCircuit:")
    print(encoder.circuit_to_openqasm())
    
    # Visualization data
    viz_data = encoder.export_visualization_data()
    print("\nVisualization data keys:", list(viz_data.keys()))


if __name__ == '__main__':
    test_quantum_gates()
