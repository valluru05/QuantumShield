"""
quantum_qsdc.py - Quantum Secure Direct Communication Simulation

Simulates BB84-based QSDC protocol for secure key exchange and
communication channel establishment.

Used by the QuantumShield++ QSDC Panel for visualization.
"""

import numpy as np
import json
import time
from typing import Dict, List, Tuple, Any


class BB84Protocol:
    """
    Simulates the BB84 Quantum Key Distribution protocol.
    
    Protocol steps:
    1. Alice prepares qubits in random bases
    2. Bob measures in random bases
    3. Sifting: keep bits where bases match
    4. Error estimation (eavesdrop detection)
    5. Privacy amplification
    6. Secure key established
    """
    
    def __init__(self, n_qubits: int = 256, noise_level: float = 0.0):
        """
        Initialize BB84 protocol simulation.
        
        Args:
            n_qubits: Number of qubits to transmit
            noise_level: Channel noise / eavesdropping probability (0–1)
        """
        self.n_qubits = n_qubits
        self.noise_level = noise_level
        
        # Protocol state
        self.alice_bits = None
        self.alice_bases = None
        self.bob_bases = None
        self.bob_measurements = None
        self.sifted_key = None
        self.final_key = None
        self.qber = None  # Quantum Bit Error Rate
        
    def run_protocol(self) -> Dict[str, Any]:
        """
        Run complete BB84 protocol simulation.
        
        Returns:
            Dict with protocol results and visualization data
        """
        start_time = time.time()
        
        # Step 1: Alice prepares random bits and bases
        self.alice_bits = np.random.randint(0, 2, self.n_qubits)
        self.alice_bases = np.random.randint(0, 2, self.n_qubits)  # 0=Z, 1=X
        
        # Step 2: Bob chooses random measurement bases
        self.bob_bases = np.random.randint(0, 2, self.n_qubits)
        
        # Step 3: Bob measures (with possible eavesdrop noise)
        self.bob_measurements = np.zeros(self.n_qubits, dtype=int)
        for i in range(self.n_qubits):
            if self.alice_bases[i] == self.bob_bases[i]:
                # Same basis — perfect measurement (unless noise)
                if np.random.random() < self.noise_level:
                    self.bob_measurements[i] = 1 - self.alice_bits[i]  # Bit flip
                else:
                    self.bob_measurements[i] = self.alice_bits[i]
            else:
                # Different basis — random result
                self.bob_measurements[i] = np.random.randint(0, 2)
        
        # Step 4: Sifting (keep only matching bases)
        matching_bases = self.alice_bases == self.bob_bases
        self.sifted_key = self.alice_bits[matching_bases]
        bob_sifted = self.bob_measurements[matching_bases]
        
        sifted_length = len(self.sifted_key)
        
        # Step 5: QBER estimation (sample 25% of sifted key)
        sample_size = max(1, sifted_length // 4)
        sample_indices = np.random.choice(sifted_length, sample_size, replace=False)
        errors = np.sum(self.sifted_key[sample_indices] != bob_sifted[sample_indices])
        self.qber = errors / sample_size if sample_size > 0 else 0.0
        
        # Step 6: Security check (QBER < 11% is secure for BB84)
        is_secure = self.qber < 0.11
        
        # Step 7: Final key (remaining bits after removing sample)
        remaining_mask = np.ones(sifted_length, dtype=bool)
        remaining_mask[sample_indices] = False
        raw_key = self.sifted_key[remaining_mask]
        
        # Privacy amplification (simple hash shortening)
        key_length = max(0, len(raw_key) - int(self.qber * len(raw_key) * 2))
        self.final_key = raw_key[:key_length]
        
        elapsed_ms = (time.time() - start_time) * 1000
        
        return {
            'success': True,
            'protocol': 'BB84',
            'n_qubits_transmitted': self.n_qubits,
            'sifted_key_length': sifted_length,
            'final_key_length': len(self.final_key),
            'qber': float(self.qber),
            'is_secure': bool(is_secure),
            'eavesdrop_detected': bool(self.qber >= 0.11),
            'key_bits': self.final_key[:32].tolist() if len(self.final_key) >= 32 else self.final_key.tolist(),
            'key_hex': ''.join(f'{int(b):01x}' for b in self.final_key[:64]),
            'channel_efficiency': float(sifted_length / self.n_qubits),
            'execution_time_ms': float(elapsed_ms),
            'security_level': 'SECURE' if is_secure else 'COMPROMISED',
            'visualization': self._generate_viz_data(),
        }
    
    def _generate_viz_data(self) -> Dict[str, Any]:
        """Generate visualization data for the UI."""
        if self.alice_bits is None:
            return {}
        
        n_sample = min(20, self.n_qubits)
        
        return {
            'alice_bits': self.alice_bits[:n_sample].tolist(),
            'alice_bases': ['Z' if b == 0 else 'X' for b in self.alice_bases[:n_sample]],
            'bob_bases': ['Z' if b == 0 else 'X' for b in self.bob_bases[:n_sample]],
            'bob_measurements': self.bob_measurements[:n_sample].tolist() if self.bob_measurements is not None else [],
            'base_matches': (self.alice_bases[:n_sample] == self.bob_bases[:n_sample]).tolist(),
            'qber_percentage': float(self.qber * 100) if self.qber is not None else 0.0,
        }


class QuantumChannel:
    """
    Simulates a quantum communication channel with various noise models.
    """
    
    def __init__(self, channel_type: str = 'fiber', length_km: float = 100.0):
        """
        Args:
            channel_type: 'fiber', 'free_space', or 'satellite'
            length_km: Channel length in km
        """
        self.channel_type = channel_type
        self.length_km = length_km
        
        # Attenuation coefficients
        self.attenuation = {
            'fiber': 0.2,      # dB/km
            'free_space': 0.0,  # No attenuation (free space)
            'satellite': 0.05,  # dB/km effective
        }.get(channel_type, 0.2)
    
    def get_channel_stats(self) -> Dict[str, Any]:
        """Get channel performance statistics."""
        # Transmission probability
        total_loss_db = self.attenuation * self.length_km
        transmission = 10 ** (-total_loss_db / 10)
        
        # Effective noise level
        noise = min(0.5, total_loss_db * 0.002)
        
        return {
            'channel_type': self.channel_type,
            'length_km': self.length_km,
            'total_loss_db': float(total_loss_db),
            'transmission_probability': float(transmission),
            'effective_noise': float(noise),
            'max_secure_rate_bps': float(max(0, transmission * 1e6 * (1 - 2 * noise))),
        }


class QSDCSystem:
    """
    Complete Quantum Secure Direct Communication system.
    Combines BB84 key distribution with quantum-safe message transmission.
    """
    
    def __init__(self):
        self.channel = QuantumChannel('fiber', 50.0)
        self.session_key = None
        self.is_established = False
        self.session_id = None
    
    def establish_channel(self, simulate_attack: bool = False) -> Dict[str, Any]:
        """
        Establish a secure quantum communication channel.
        
        Args:
            simulate_attack: If True, simulates an eavesdropping attack
        
        Returns:
            Channel establishment results
        """
        noise = 0.15 if simulate_attack else 0.02
        bb84 = BB84Protocol(n_qubits=512, noise_level=noise)
        result = bb84.run_protocol()
        
        channel_stats = self.channel.get_channel_stats()
        
        if result['is_secure']:
            self.session_key = result['key_hex']
            self.is_established = True
            self.session_id = f"QS-{int(time.time())}"
        
        return {
            'success': result['is_secure'],
            'session_id': self.session_id,
            'is_established': self.is_established,
            'qkd_result': result,
            'channel_stats': channel_stats,
            'attack_detected': result['eavesdrop_detected'],
            'encryption_key_length': len(result['key_hex']) * 4,  # bits
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current QSDC system status."""
        return {
            'is_established': self.is_established,
            'session_id': self.session_id,
            'channel_type': self.channel.channel_type,
            'channel_length_km': self.channel.length_km,
            'channel_stats': self.channel.get_channel_stats(),
            'protocol': 'BB84',
            'encryption': 'OTP + AES-256',
            'pqc_layer': 'CRYSTALS-Kyber-1024',
        }


def main():
    """CLI interface for QSDC simulation."""
    import argparse
    
    parser = argparse.ArgumentParser(description='QSDC Simulation')
    parser.add_argument('--mode', choices=['establish', 'status', 'attack'], default='establish')
    parser.add_argument('--attack', action='store_true', help='Simulate eavesdropping attack')
    
    args = parser.parse_args()
    
    system = QSDCSystem()
    
    if args.mode == 'establish' or args.mode == 'attack':
        result = system.establish_channel(simulate_attack=(args.mode == 'attack' or args.attack))
        print(json.dumps(result, indent=2, default=str))
    elif args.mode == 'status':
        print(json.dumps(system.get_status(), indent=2, default=str))


if __name__ == '__main__':
    main()
