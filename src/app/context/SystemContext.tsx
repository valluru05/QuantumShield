import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AttackType = 'none' | 'jamming' | 'spoofing';
type SystemStatus = 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure';

interface SystemContextType {
  attackType: AttackType;
  systemStatus: SystemStatus;
  isProcessing: boolean;
  mlConfidence: number | null;
  mlThreatScore: number | null;
  mlResponseTimeMs: number | null;
  jammingAccuracy: number | null;
  modelAccuracy: number | null;
  modelF1: number | null;
  modelValidationAccuracy: number | null;
  isConnected: boolean;
  clientId: string | null;
  launchAttack: (type: 'jamming' | 'spoofing') => void;
  activateSecureChannel: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

// Determine WebSocket URL based on hostname
const getWSUrl = (): string => {
  const hostname = window.location.hostname;
  
  // If accessing from localhost or 127.0.0.1, use localhost (same machine)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'ws://localhost:3001';
  }
  
  // If accessing from a different IP (multi-laptop setup), use that IP
  return `ws://${hostname}:3001`;
};

const WS_URL = getWSUrl();

const getApiBase = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return `http://${hostname}:3001`;
};

const API_BASE = getApiBase();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function SystemProvider({ children }: { children: ReactNode }) {
  const [attackType, setAttackType] = useState<AttackType>('none');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('normal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mlConfidence, setMlConfidence] = useState<number | null>(0);
  const [mlThreatScore, setMlThreatScore] = useState<number | null>(null);
  const [mlResponseTimeMs, setMlResponseTimeMs] = useState<number | null>(0);
  const [jammingAccuracy, setJammingAccuracy] = useState<number | null>(null);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [modelF1, setModelF1] = useState<number | null>(null);
  const [modelValidationAccuracy, setModelValidationAccuracy] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const applyModelMetricsFromTraining = (trainingPayload: any) => {
    if (!trainingPayload) {
      return;
    }

    const accuracy =
      trainingPayload.model_accuracy ??
      trainingPayload.models?.qsvm?.accuracy ??
      trainingPayload.result?.model_accuracy ??
      trainingPayload.result?.models?.qsvm?.accuracy;
    const f1 =
      trainingPayload.model_f1 ??
      trainingPayload.models?.qsvm?.f1 ??
      trainingPayload.result?.model_f1 ??
      trainingPayload.result?.models?.qsvm?.f1;
    const validationAccuracy =
      trainingPayload.validation_metrics?.accuracy ??
      trainingPayload.models?.qsvm?.validation_accuracy ??
      trainingPayload.result?.validation_metrics?.accuracy ??
      trainingPayload.result?.models?.qsvm?.validation_accuracy;

    if (accuracy !== undefined && accuracy !== null) {
      setModelAccuracy(Number(accuracy));
    }
    if (f1 !== undefined && f1 !== null) {
      setModelF1(Number(f1));
    }
    if (validationAccuracy !== undefined && validationAccuracy !== null) {
      setModelValidationAccuracy(Number(validationAccuracy));
    }
  };

  useEffect(() => {
    const syncMetricsFromStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/quantum-ml/status`);
        if (!response.ok) {
          return;
        }
        const status = await response.json();
        applyModelMetricsFromTraining(status.lastTrainingResult ?? status);
      } catch (err) {
        console.error('Failed to sync trained model metrics:', err);
      }
    };

    syncMetricsFromStatus();
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket(WS_URL);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'INITIAL_STATE') {
          // First connection - set client ID and current state
          setClientId(data.clientId);
          setAttackType(data.state.attackType);
          setSystemStatus(data.state.systemStatus);
          setIsProcessing(data.state.isProcessing);
          setMlConfidence(data.state.mlConfidence ?? 0);
          setMlThreatScore(data.state.mlThreatScore ?? null);
          setMlResponseTimeMs(data.state.mlResponseTimeMs ?? 0);
          setJammingAccuracy(data.state.jammingAccuracy ?? null);
          setModelAccuracy(data.state.modelAccuracy ?? null);
          setModelF1(data.state.modelF1 ?? null);
          setModelValidationAccuracy(data.state.modelValidationAccuracy ?? null);
          console.log('Received initial state:', data.state);
        } else if (data.type === 'MODE_CHANGE' || data.type === 'STATE_UPDATE') {
          // State changed by another client or this client
          setAttackType(data.state.attackType);
          setSystemStatus(data.state.systemStatus);
          setIsProcessing(data.state.isProcessing);
          setMlConfidence(data.state.mlConfidence ?? 0);
          setMlThreatScore(data.state.mlThreatScore ?? null);
          setMlResponseTimeMs(data.state.mlResponseTimeMs ?? 0);
          setJammingAccuracy(data.state.jammingAccuracy ?? null);
          setModelAccuracy(data.state.modelAccuracy ?? null);
          setModelF1(data.state.modelF1 ?? null);
          setModelValidationAccuracy(data.state.modelValidationAccuracy ?? null);
          console.log('State synced from server:', data.state);
        } else if (
          data.type === 'QUANTUM_ML_STATUS' &&
          data.quantumMLData?.status === 'training_complete'
        ) {
          applyModelMetricsFromTraining(data.quantumMLData);
        } else if (
          data.type === 'QUANTUM_ML_STATUS' &&
          data.quantumMLData?.type === 'QUANTUM_INFERENCE_COMPLETE'
        ) {
          // Handle quantum pipeline inference results
          const qData = data.quantumMLData.result;

          if (qData) {
            // Update ML metrics from quantum pipeline
            if (qData.confidence !== undefined) {
              setMlConfidence(Math.round(qData.confidence * 100));
            }

            if (qData.final_result) {
              if (qData.final_result === 'jamming') {
                setAttackType('jamming');
              } else if (qData.final_result === 'spoofing') {
                setAttackType('spoofing');
              }
            }

            if (qData.metadata?.execution_times_ms?.total) {
              setMlResponseTimeMs(qData.metadata.execution_times_ms.total);
            }

            // Calculate threat score based on confidence and attack type
            if (qData.attack_detected) {
              setMlThreatScore(Math.round(qData.confidence * 100));
            }

            console.log('Quantum inference result:', qData);
          }
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
      }, 3000);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendState = (state: {
    attackType?: AttackType;
    systemStatus?: SystemStatus;
    isProcessing?: boolean;
    mlConfidence?: number | null;
    mlThreatScore?: number | null;
    mlResponseTimeMs?: number | null;
    jammingAccuracy?: number | null;
    modelAccuracy?: number | null;
    modelF1?: number | null;
    modelValidationAccuracy?: number | null;
    type: 'MODE_CHANGE' | 'STATE_UPDATE';
  }) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(state));
    }
  };

  const launchAttack = async (type: 'jamming' | 'spoofing') => {
    const newState = {
      attackType: type,
      systemStatus: 'under-attack' as SystemStatus,
      isProcessing: true,
      type: 'STATE_UPDATE' as const,
    };

    setAttackType(type);
    setSystemStatus('under-attack');
    setIsProcessing(true);
    setMlConfidence(0);
    setMlThreatScore(null);
    setMlResponseTimeMs(0);
    setJammingAccuracy(null);
    sendState(newState);

    const processingState = {
      systemStatus: 'processing' as SystemStatus,
      type: 'STATE_UPDATE' as const,
    };
    setSystemStatus('processing');
    sendState(processingState);

    const features =
      type === 'jamming'
        ? [1.5 + Math.random() * 0.3, -0.3 + Math.random() * 0.2, -1.2 + Math.random() * 0.2, 0.8 + Math.random() * 0.2]
        : [-1.4 + Math.random() * 0.2, 1.1 + Math.random() * 0.2, 0.8 + Math.random() * 0.2, -0.7 + Math.random() * 0.2];

    try {
      const evaluateOnce = async () => {
        const response = await fetch(`${API_BASE}/api/quantum-ml/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features }),
        });
        const result = await response.json();
        return { response, result };
      };

      let { response, result } = await evaluateOnce();

      // If backend is still training, wait until model becomes ready and retry once.
      if (response.status === 202 && result?.trainingStarted) {
        for (let i = 0; i < 20; i += 1) {
          await sleep(1000);
          const statusResponse = await fetch(`${API_BASE}/api/quantum-ml/status`);
          if (!statusResponse.ok) {
            continue;
          }
          const status = await statusResponse.json();
          if (!status.isTraining && status.lastTrainingResult) {
            ({ response, result } = await evaluateOnce());
            break;
          }
        }
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Model evaluation failed');
      }

      const confidence = Number(result.mlConfidence ?? (result.confidence ?? 0) * 100);
      const threatScore = Number(result.mlThreatScore ?? (result.threatScore ?? 0) * 100);
      const responseTimeMs = Number(result.mlResponseTimeMs ?? null);

      setMlConfidence(confidence);
      setMlThreatScore(threatScore);
      setMlResponseTimeMs(responseTimeMs);
      if (result.jammingAccuracy !== undefined) {
        setJammingAccuracy(Number(result.jammingAccuracy));
      }
      if (result.modelAccuracy !== undefined) {
        setModelAccuracy(Number(result.modelAccuracy));
      }
      if (result.modelF1 !== undefined) {
        setModelF1(Number(result.modelF1));
      }
      if (result.modelValidationAccuracy !== undefined) {
        setModelValidationAccuracy(Number(result.modelValidationAccuracy));
      }

      const detectedState = {
        attackType: (result.prediction === 'jamming' ? 'jamming' : 'spoofing') as AttackType,
        systemStatus: 'detected' as SystemStatus,
        isProcessing: false,
        mlConfidence: confidence,
        mlThreatScore: threatScore,
        mlResponseTimeMs: responseTimeMs,
        jammingAccuracy:
          result.jammingAccuracy !== undefined ? Number(result.jammingAccuracy) : null,
        modelAccuracy: result.modelAccuracy !== undefined ? Number(result.modelAccuracy) : null,
        modelF1: result.modelF1 !== undefined ? Number(result.modelF1) : null,
        modelValidationAccuracy:
          result.modelValidationAccuracy !== undefined
            ? Number(result.modelValidationAccuracy)
            : null,
        type: 'STATE_UPDATE' as const,
      };

      if (!result.establishSecureConnection) {
        setAttackType(detectedState.attackType);
        setSystemStatus('detected');
        setIsProcessing(false);
        sendState(detectedState);
      }
    } catch (err) {
      console.error('QSVM evaluation failed:', err);
      const fallbackState = {
        systemStatus: 'detected' as SystemStatus,
        isProcessing: false,
        type: 'STATE_UPDATE' as const,
      };
      setSystemStatus('detected');
      setIsProcessing(false);
      sendState(fallbackState);
    }
  };

  const activateSecureChannel = () => {
    const switchingState = {
      systemStatus: 'switching' as SystemStatus,
      type: 'STATE_UPDATE' as const,
    };
    setSystemStatus('switching');
    sendState(switchingState);

    // Show secure channel activation (after 2 seconds)
    setTimeout(() => {
      const secureState = {
        systemStatus: 'secure' as SystemStatus,
        type: 'STATE_UPDATE' as const,
      };
      setSystemStatus('secure');
      sendState(secureState);
    }, 2000);

    // Return to normal (after 5 seconds)
    setTimeout(() => {
      const normalState = {
        attackType: 'none' as AttackType,
        systemStatus: 'normal' as SystemStatus,
        type: 'STATE_UPDATE' as const,
      };
      setAttackType('none');
      setSystemStatus('normal');
      sendState(normalState);
    }, 5000);
  };

  return (
    <SystemContext.Provider
      value={{
        attackType,
        systemStatus,
        isProcessing,
        mlConfidence,
        mlThreatScore,
        mlResponseTimeMs,
        jammingAccuracy,
        modelAccuracy,
        modelF1,
        modelValidationAccuracy,
        isConnected,
        clientId,
        launchAttack,
        activateSecureChannel,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
