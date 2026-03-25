#!/usr/bin/env python3
"""
QSVM-only training and signal evaluation utility.

Modes:
- train: trains QSVM-inspired detector, persists model to disk, prints JSON.
- evaluate: loads persisted model, predicts signal class, prints JSON.
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score

try:
    from qiskit import QuantumCircuit, ClassicalRegister
    from qiskit_aer import AerSimulator
except ImportError as exc:
    print(json.dumps({"success": False, "error": f"Qiskit import failed: {exc}"}))
    sys.exit(1)

MODEL_PATH = Path(__file__).with_name("qsvm_model.json")


class QuantumSVMDetector:
    """QSVM-inspired detector using quantum kernel similarity to class centroids."""

    def __init__(self, num_qubits: int = 4):
        self.num_qubits = num_qubits
        self.simulator = AerSimulator()
        self.scaler = StandardScaler()
        self.class_centroids = None
        self.training_metrics = {}

    def quantum_kernel(self, x1: np.ndarray, x2: np.ndarray) -> float:
        circuit = QuantumCircuit(self.num_qubits)

        for i in range(min(self.num_qubits, len(x1))):
            circuit.ry(float(x1[i]), i)

        for i in range(min(self.num_qubits, len(x2))):
            circuit.ry(float(-x2[i]), i)

        cr = ClassicalRegister(self.num_qubits, "c")
        circuit.add_register(cr)
        for i in range(self.num_qubits):
            circuit.measure(i, cr[i])

        job = self.simulator.run(circuit, shots=512)
        counts = job.result().get_counts()
        zero_state = "0" * self.num_qubits
        return counts.get(zero_state, 0) / 512.0

    def fit(self, x_train: np.ndarray, y_train: np.ndarray) -> dict:
        x_scaled = self.scaler.fit_transform(x_train)

        # Class labels: 1=jamming, 0=spoofing
        jamming = x_scaled[y_train == 1]
        spoofing = x_scaled[y_train == 0]

        jamming_centroid = np.mean(jamming, axis=0)
        spoofing_centroid = np.mean(spoofing, axis=0)
        self.class_centroids = {
            "jamming": jamming_centroid,
            "spoofing": spoofing_centroid,
        }

        preds = self.predict_batch(x_train)
        acc = accuracy_score(y_train, preds)
        f1 = f1_score(y_train, preds, average="binary", pos_label=1)

        self.training_metrics = {
            "accuracy": float(acc),
            "f1": float(f1),
            "train_samples": int(len(x_train)),
            "num_qubits": self.num_qubits,
        }
        return self.training_metrics

    def predict_proba(self, features: np.ndarray) -> dict:
        if self.class_centroids is None:
            raise ValueError("Model not trained")

        x_scaled = self.scaler.transform([features])[0]
        kj = self.quantum_kernel(x_scaled, self.class_centroids["jamming"])
        ks = self.quantum_kernel(x_scaled, self.class_centroids["spoofing"])

        denom = max(kj + ks, 1e-9)
        p_jamming = kj / denom
        p_spoofing = ks / denom
        return {
            "jamming": float(p_jamming),
            "spoofing": float(p_spoofing),
        }

    def predict_one(self, features: np.ndarray) -> dict:
        probs = self.predict_proba(features)
        pred = "jamming" if probs["jamming"] >= probs["spoofing"] else "spoofing"
        confidence = max(probs["jamming"], probs["spoofing"])

        # Threat score: both classes represent attacks in this project.
        threat_score = confidence
        establish_secure_connection = threat_score >= 0.55

        return {
            "prediction": pred,
            "confidence": float(confidence),
            "probabilities": probs,
            "threat_score": float(threat_score),
            "establish_secure_connection": establish_secure_connection,
        }

    def predict_batch(self, x: np.ndarray) -> np.ndarray:
        preds = []
        for row in x:
            out = self.predict_one(row)
            preds.append(1 if out["prediction"] == "jamming" else 0)
        return np.array(preds)

    def save(self, path: Path) -> None:
        if self.class_centroids is None:
            raise ValueError("No model state to save")

        payload = {
            "num_qubits": self.num_qubits,
            "scaler_mean": self.scaler.mean_.tolist(),
            "scaler_scale": self.scaler.scale_.tolist(),
            "class_centroids": {
                "jamming": self.class_centroids["jamming"].tolist(),
                "spoofing": self.class_centroids["spoofing"].tolist(),
            },
            "training_metrics": self.training_metrics,
            "timestamp": datetime.now().isoformat(),
        }
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    @classmethod
    def load(cls, path: Path) -> "QuantumSVMDetector":
        payload = json.loads(path.read_text(encoding="utf-8"))
        model = cls(num_qubits=int(payload.get("num_qubits", 4)))

        model.scaler.mean_ = np.array(payload["scaler_mean"], dtype=float)
        model.scaler.scale_ = np.array(payload["scaler_scale"], dtype=float)
        model.scaler.var_ = model.scaler.scale_ ** 2
        model.scaler.n_features_in_ = len(model.scaler.mean_)

        model.class_centroids = {
            "jamming": np.array(payload["class_centroids"]["jamming"], dtype=float),
            "spoofing": np.array(payload["class_centroids"]["spoofing"], dtype=float),
        }
        model.training_metrics = payload.get("training_metrics", {})
        return model


def generate_synthetic_data(num_samples: int = 2000):
    # Intentionally overlapping distributions to avoid unrealistically perfect scores.
    x_jamming = np.random.randn(num_samples, 4) * 0.55 + np.array([1.0, -0.2, -0.8, 0.6])
    x_spoofing = np.random.randn(num_samples, 4) * 0.55 + np.array([-1.0, 0.9, 0.6, -0.6])

    # Inject boundary-like samples that resemble real noisy RF conditions.
    boundary_count = max(1, int(0.15 * num_samples))
    x_jamming[:boundary_count] = np.random.randn(boundary_count, 4) * 0.65 + np.array([0.25, 0.15, -0.15, 0.1])
    x_spoofing[:boundary_count] = np.random.randn(boundary_count, 4) * 0.65 + np.array([-0.25, 0.45, 0.15, -0.1])

    x = np.vstack([x_jamming, x_spoofing])
    y = np.hstack([np.ones(num_samples), np.zeros(num_samples)])

    idx = np.random.permutation(len(x))
    return x[idx], y[idx]


def train_mode(samples_per_class: int, target_accuracy: float, max_attempts: int) -> int:
    best_val_acc = -1.0
    best_val_f1 = 0.0
    best_test_acc = 0.0
    best_test_f1 = 0.0
    best_train_size = 0
    best_val_size = 0
    best_test_size = 0
    best_attempt = 0
    best_model: QuantumSVMDetector | None = None

    for attempt in range(1, max_attempts + 1):
        np.random.seed(42 + attempt)
        x, y = generate_synthetic_data(num_samples=samples_per_class)
        x_train_val, x_test, y_train_val, y_test = train_test_split(
            x, y, test_size=0.2, random_state=42 + attempt, stratify=y
        )
        x_train, x_val, y_train, y_val = train_test_split(
            x_train_val,
            y_train_val,
            test_size=0.25,
            random_state=142 + attempt,
            stratify=y_train_val,
        )

        model = QuantumSVMDetector(num_qubits=4)
        model.fit(x_train, y_train)

        val_preds = model.predict_batch(x_val)
        val_acc = accuracy_score(y_val, val_preds)
        val_f1 = f1_score(y_val, val_preds, average="binary", pos_label=1)

        test_preds = model.predict_batch(x_test)
        test_acc = accuracy_score(y_test, test_preds)
        test_f1 = f1_score(y_test, test_preds, average="binary", pos_label=1)

        model.training_metrics.update(
            {
                "val_accuracy": float(val_acc),
                "val_f1": float(val_f1),
                "test_accuracy": float(test_acc),
                "test_f1": float(test_f1),
                "attempt": attempt,
            }
        )

        if (
            val_acc > best_val_acc
            or (np.isclose(val_acc, best_val_acc) and val_f1 > best_val_f1)
        ):
            best_val_acc = float(val_acc)
            best_val_f1 = float(val_f1)
            best_test_acc = float(test_acc)
            best_test_f1 = float(test_f1)
            best_train_size = int(len(x_train))
            best_val_size = int(len(x_val))
            best_test_size = int(len(x_test))
            best_attempt = attempt
            best_model = model

        if val_acc >= target_accuracy:
            break

    if best_model is None:
        print(json.dumps({"success": False, "error": "Training failed to produce a valid model"}))
        return 1

    best_model.save(MODEL_PATH)

    result = {
        "success": True,
        "active_model": "qsvm",
        "model_path": str(MODEL_PATH),
        "target_accuracy": float(target_accuracy),
        "selection_metric": "validation_accuracy",
        "model_accuracy": float(best_test_acc),
        "model_f1": float(best_test_f1),
        "dataset": {
            "samples_per_class": int(samples_per_class),
            "total_samples": int(samples_per_class * 2),
            "training_samples": int(best_train_size),
            "validation_samples": int(best_val_size),
            "test_samples": int(best_test_size),
        },
        "training_attempts": {
            "used": int(best_attempt),
            "max_attempts": int(max_attempts),
        },
        "validation_metrics": {
            "accuracy": float(best_val_acc),
            "f1": float(best_val_f1),
        },
        "models": {
            "qsvm": {
                "type": "qsvm",
                "accuracy": float(best_test_acc),
                "f1": float(best_test_f1),
                "num_qubits": 4,
                "training_samples": int(best_train_size),
                "validation_samples": int(best_val_size),
                "test_samples": int(best_test_size),
            }
        },
        "timestamp": datetime.now().isoformat(),
    }

    print(json.dumps(result, indent=2))
    return 0


def evaluate_mode(features: list[float]) -> int:
    if not MODEL_PATH.exists():
        print(json.dumps({
            "success": False,
            "error": "QSVM model not trained yet",
            "model_path": str(MODEL_PATH),
        }))
        return 2

    if len(features) != 4:
        print(json.dumps({
            "success": False,
            "error": "features must contain exactly 4 values",
        }))
        return 3

    model = QuantumSVMDetector.load(MODEL_PATH)
    output = model.predict_one(np.array(features, dtype=float))

    result = {
        "success": True,
        "active_model": "qsvm",
        "model_accuracy": float(model.training_metrics.get("test_accuracy", model.training_metrics.get("accuracy", 0.0))),
        "model_f1": float(model.training_metrics.get("test_f1", model.training_metrics.get("f1", 0.0))),
        **output,
        "timestamp": datetime.now().isoformat(),
    }

    print(json.dumps(result, indent=2))
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="QSVM trainer/evaluator")
    parser.add_argument("--mode", choices=["train", "evaluate"], default="train")
    parser.add_argument("--features", default="", help="comma-separated 4 signal features")
    parser.add_argument("--samples", type=int, default=2000, help="samples per class for training")
    parser.add_argument("--target-accuracy", type=float, default=0.90, help="target validation accuracy")
    parser.add_argument("--max-attempts", type=int, default=3, help="max retraining attempts")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.mode == "train":
        return train_mode(
            samples_per_class=args.samples,
            target_accuracy=args.target_accuracy,
            max_attempts=args.max_attempts,
        )

    feature_text = args.features.strip()
    if not feature_text:
        return evaluate_mode([1.0, 0.0, -1.0, 0.5])

    features = [float(x.strip()) for x in feature_text.split(",") if x.strip()]
    return evaluate_mode(features)


if __name__ == "__main__":
    sys.exit(main())
