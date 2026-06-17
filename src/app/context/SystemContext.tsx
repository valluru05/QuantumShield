import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';

type AttackType = 'none' | 'jamming' | 'spoofing';
type SystemStatus = 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure';

// ===================== New types for QuantumShield++ =====================

interface QuantumEngineState {
  walkEngine: 'online' | 'offline';
  gateEncoder: 'online' | 'offline';
  clustering: 'online' | 'offline';
  qsvm: 'trained' | 'untrained' | 'offline';
  qsdc: 'active' | 'standby' | 'offline';
  pqc: 'active' | 'offline';
  aiThreatIntel: 'active' | 'offline';
}

interface ThreatForecast {
  attackType: string;
  probability: number;
  timeHorizonMin: number;
}

interface SystemContextType {
  // ---- Existing fields ----
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

  // ---- New QuantumShield++ fields ----
  quantumEngines: QuantumEngineState;
  threatForecast: ThreatForecast[];
  threatLevel: number;             // 0–100
  totalAlertsToday: number;
  lastEventTime: Date | null;
  sessionId: string | null;
  quantumKeyActive: boolean;
  pqcAlgorithm: string;
  wsLatencyMs: number;
  resetToNormal: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

// ===================== URL helpers =====================

const getWSUrl = (): string => {
  const { protocol, hostname, host } = window.location;
  // Local dev — backend runs on a separate port (3001)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'ws://localhost:3001';
  }
  // Production — frontend is served from the same origin as the backend
  // Use wss:// when the page is served over HTTPS
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${host}`;
};

const getApiBase = (): string => {
  const { protocol, hostname, host } = window.location;
  // Local dev — backend runs on a separate port (3001)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  // Production — same origin as the frontend
  return `${protocol}//${host}`;
};

const WS_URL = getWSUrl();
const API_BASE = getApiBase();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ===================== Default engine state =====================

const DEFAULT_ENGINES: QuantumEngineState = {
  walkEngine: 'online',
  gateEncoder: 'online',
  clustering: 'online',
  qsvm: 'trained',
  qsdc: 'standby',
  pqc: 'active',
  aiThreatIntel: 'active',
};

// ===================== Provider =====================

export function SystemProvider({ children }: { children: ReactNode }) {
  // ---- Existing state ----
  const [attackType, setAttackType] = useState<AttackType>('none');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('normal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mlConfidence, setMlConfidence] = useState<number | null>(0);
  const [mlThreatScore, setMlThreatScore] = useState<number | null>(null);
  const [mlResponseTimeMs, setMlResponseTimeMs] = useState<number | null>(null);
  const [jammingAccuracy, setJammingAccuracy] = useState<number | null>(null);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [modelF1, setModelF1] = useState<number | null>(null);
  const [modelValidationAccuracy, setModelValidationAccuracy] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  // ---- New QuantumShield++ state ----
  const [quantumEngines, setQuantumEngines] = useState<QuantumEngineState>(DEFAULT_ENGINES);
  const [threatForecast, setThreatForecast] = useState<ThreatForecast[]>([
    { attackType: 'jamming', probability: 23, timeHorizonMin: 5 },
    { attackType: 'spoofing', probability: 15, timeHorizonMin: 5 },
    { attackType: 'hybrid', probability: 8, timeHorizonMin: 10 },
  ]);
  const [threatLevel, setThreatLevel] = useState<number>(5);
  const [totalAlertsToday, setTotalAlertsToday] = useState<number>(0);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quantumKeyActive, setQuantumKeyActive] = useState<boolean>(false);
  const [pqcAlgorithm, setPqcAlgorithm] = useState<string>('CRYSTALS-Kyber-768');
  const [wsLatencyMs, setWsLatencyMs] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const secureTimeout1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secureTimeout2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (secureTimeout1Ref.current) clearTimeout(secureTimeout1Ref.current);
      if (secureTimeout2Ref.current) clearTimeout(secureTimeout2Ref.current);
    };
  }, []);

  // ===================== Helpers =====================

  const applyModelMetricsFromTraining = useCallback((trainingPayload: any) => {
    if (!trainingPayload) return;

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

    if (accuracy !== undefined && accuracy !== null) setModelAccuracy(Number(accuracy));
    if (f1 !== undefined && f1 !== null) setModelF1(Number(f1));
    if (validationAccuracy !== undefined && validationAccuracy !== null)
      setModelValidationAccuracy(Number(validationAccuracy));
  }, []);

  // Compute threat level from attack + confidence
  const updateThreatLevel = useCallback((type: AttackType, confidence: number | null) => {
    if (type === 'none') {
      setThreatLevel(Math.max(2, Math.round(Math.random() * 8)));
    } else {
      const base = type === 'jamming' ? 65 : 50;
      setThreatLevel(Math.min(100, base + Math.round((confidence ?? 0) * 0.35)));
    }
  }, []);

  // Update threat forecast dynamically
  const refreshThreatForecast = useCallback((currentAttack: AttackType) => {
    setThreatForecast([
      {
        attackType: 'jamming',
        probability: currentAttack === 'jamming' ? 75 + Math.round(Math.random() * 15) : 15 + Math.round(Math.random() * 15),
        timeHorizonMin: 5,
      },
      {
        attackType: 'spoofing',
        probability: currentAttack === 'spoofing' ? 70 + Math.round(Math.random() * 15) : 10 + Math.round(Math.random() * 12),
        timeHorizonMin: 5,
      },
      {
        attackType: 'hybrid',
        probability: currentAttack !== 'none' ? 20 + Math.round(Math.random() * 20) : 5 + Math.round(Math.random() * 8),
        timeHorizonMin: 10,
      },
    ]);
  }, []);

  // ===================== Init: sync model metrics =====================

  useEffect(() => {
    const syncMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/quantum-ml/status`);
        if (!response.ok) return;
        const status = await response.json();
        applyModelMetricsFromTraining(status.lastTrainingResult ?? status);
      } catch (err) {
        console.error('Failed to sync model metrics:', err);
      }
    };
    syncMetrics();

    // Generate a session ID
    setSessionId(`QS-${Date.now().toString(36).toUpperCase()}`);
  }, [applyModelMetricsFromTraining]);

  // ===================== WebSocket =====================

  useEffect(() => {
    const connect = () => {
      const websocket = new WebSocket(WS_URL);
      wsRef.current = websocket;

      websocket.onopen = () => {
        setIsConnected(true);
        // Start latency ping
        pingTimerRef.current = setInterval(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            pingTimeRef.current = Date.now();
            websocket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 5000);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Pong — measure latency
          if (data.type === 'PONG') {
            setWsLatencyMs(Date.now() - pingTimeRef.current);
            return;
          }

          if (data.type === 'INITIAL_STATE') {
            setClientId(data.clientId);
            setAttackType(data.state.attackType);
            setSystemStatus(data.state.systemStatus);
            setIsProcessing(data.state.isProcessing);
            setMlConfidence(data.state.mlConfidence ?? 0);
            setMlThreatScore(data.state.mlThreatScore ?? null);
            setMlResponseTimeMs(data.state.mlResponseTimeMs ?? null);
            setJammingAccuracy(data.state.jammingAccuracy ?? null);
            setModelAccuracy(data.state.modelAccuracy ?? null);
            setModelF1(data.state.modelF1 ?? null);
            setModelValidationAccuracy(data.state.modelValidationAccuracy ?? null);
            updateThreatLevel(data.state.attackType, data.state.mlConfidence);

          } else if (data.type === 'MODE_CHANGE' || data.type === 'STATE_UPDATE') {
            setAttackType(data.state.attackType);
            setSystemStatus(data.state.systemStatus);
            setIsProcessing(data.state.isProcessing);
            setMlConfidence(data.state.mlConfidence ?? 0);
            setMlThreatScore(data.state.mlThreatScore ?? null);
            setMlResponseTimeMs(data.state.mlResponseTimeMs ?? null);
            setJammingAccuracy(data.state.jammingAccuracy ?? null);
            setModelAccuracy(data.state.modelAccuracy ?? null);
            setModelF1(data.state.modelF1 ?? null);
            setModelValidationAccuracy(data.state.modelValidationAccuracy ?? null);
            updateThreatLevel(data.state.attackType, data.state.mlConfidence);
            refreshThreatForecast(data.state.attackType);

            // Track alert count
            if (data.state.attackType !== 'none') {
              setTotalAlertsToday((prev) => prev + 1);
              setLastEventTime(new Date());
            }

          } else if (
            data.type === 'QUANTUM_ML_STATUS' &&
            data.quantumMLData?.status === 'training_complete'
          ) {
            applyModelMetricsFromTraining(data.quantumMLData);
            // Mark QSVM as trained
            setQuantumEngines((prev) => ({ ...prev, qsvm: 'trained' }));

          } else if (
            data.type === 'QUANTUM_ML_STATUS' &&
            data.quantumMLData?.type === 'QUANTUM_INFERENCE_COMPLETE'
          ) {
            const qData = data.quantumMLData.result;
            if (qData) {
              if (qData.confidence !== undefined) {
                setMlConfidence(Math.round(qData.confidence * 100));
              }
              if (qData.final_result) {
                if (qData.final_result === 'jamming') setAttackType('jamming');
                else if (qData.final_result === 'spoofing') setAttackType('spoofing');
              }
              if (qData.metadata?.execution_times_ms?.total) {
                setMlResponseTimeMs(qData.metadata.execution_times_ms.total);
              }
              if (qData.attack_detected) {
                setMlThreatScore(Math.round(qData.confidence * 100));
              }
              // Update QSDC status
              if (qData.qsdc_status === 'secure') {
                setQuantumEngines((prev) => ({ ...prev, qsdc: 'active' }));
                setQuantumKeyActive(true);
              }
            }
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };

      websocket.onerror = () => {
        setIsConnected(false);
      };

      websocket.onclose = () => {
        setIsConnected(false);
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        // Auto-reconnect after 3 seconds
        if (isMountedRef.current) {
          setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    };
  }, [applyModelMetricsFromTraining, updateThreatLevel, refreshThreatForecast]);

  // ===================== Send state helper =====================

  const sendState = useCallback((state: {
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
    const socket = wsRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(state));
    }
  }, []);

  // ===================== launchAttack =====================

  const launchAttack = useCallback(async (type: 'jamming' | 'spoofing') => {
    setAttackType(type);
    setSystemStatus('under-attack');
    setIsProcessing(true);
    setMlConfidence(0);
    setMlThreatScore(null);
    setMlResponseTimeMs(0);
    setJammingAccuracy(null);
    setLastEventTime(new Date());
    setTotalAlertsToday((prev) => prev + 1);
    updateThreatLevel(type, null);
    refreshThreatForecast(type);

    sendState({
      attackType: type,
      systemStatus: 'under-attack',
      isProcessing: true,
      type: 'STATE_UPDATE',
    });

    setSystemStatus('processing');
    sendState({ systemStatus: 'processing', type: 'STATE_UPDATE' });

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

      if (response.status === 202 && result?.trainingStarted) {
        for (let i = 0; i < 20; i++) {
          await sleep(1000);
          const statusResponse = await fetch(`${API_BASE}/api/quantum-ml/status`);
          if (!statusResponse.ok) continue;
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
      const responseTimeMs = result.mlResponseTimeMs != null ? Number(result.mlResponseTimeMs) : null;

      setMlConfidence(confidence);
      setMlThreatScore(threatScore);
      setMlResponseTimeMs(responseTimeMs);
      updateThreatLevel(type, confidence);

      if (result.jammingAccuracy !== undefined) setJammingAccuracy(Number(result.jammingAccuracy));
      if (result.modelAccuracy !== undefined) setModelAccuracy(Number(result.modelAccuracy));
      if (result.modelF1 !== undefined) setModelF1(Number(result.modelF1));
      if (result.modelValidationAccuracy !== undefined) setModelValidationAccuracy(Number(result.modelValidationAccuracy));

      const detectedAttackType: AttackType =
        result.prediction === 'jamming' ? 'jamming'
        : result.prediction === 'spoofing' ? 'spoofing'
        : type; // fall back to the attack type that was launched

      setAttackType(detectedAttackType);
      setSystemStatus('detected');
      setIsProcessing(false);

      sendState({
        attackType: detectedAttackType,
        systemStatus: 'detected',
        isProcessing: false,
        mlConfidence: confidence,
        mlThreatScore: threatScore,
        mlResponseTimeMs: responseTimeMs,
        jammingAccuracy: result.jammingAccuracy !== undefined ? Number(result.jammingAccuracy) : null,
        modelAccuracy: result.modelAccuracy !== undefined ? Number(result.modelAccuracy) : null,
        modelF1: result.modelF1 !== undefined ? Number(result.modelF1) : null,
        modelValidationAccuracy: result.modelValidationAccuracy !== undefined ? Number(result.modelValidationAccuracy) : null,
        type: 'STATE_UPDATE',
      });

    } catch (err) {
      console.error('QSVM evaluation failed:', err);
      setSystemStatus('detected');
      setIsProcessing(false);
      sendState({ systemStatus: 'detected', isProcessing: false, type: 'STATE_UPDATE' });
    }
  }, [sendState, updateThreatLevel, refreshThreatForecast]);

  // ===================== activateSecureChannel =====================

  const activateSecureChannel = useCallback(() => {
    setSystemStatus('switching');
    setQuantumEngines((prev) => ({ ...prev, qsdc: 'standby' }));
    sendState({ systemStatus: 'switching', type: 'STATE_UPDATE' });

    if (secureTimeout1Ref.current) clearTimeout(secureTimeout1Ref.current);
    if (secureTimeout2Ref.current) clearTimeout(secureTimeout2Ref.current);

    secureTimeout1Ref.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setSystemStatus('secure');
      setQuantumEngines((prev) => ({ ...prev, qsdc: 'active' }));
      setQuantumKeyActive(true);
      setPqcAlgorithm('CRYSTALS-Kyber-768');
      sendState({ systemStatus: 'secure', type: 'STATE_UPDATE' });
    }, 2000);

    secureTimeout2Ref.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setAttackType('none');
      setSystemStatus('normal');
      setQuantumEngines((prev) => ({ ...prev, qsdc: 'standby' }));
      setQuantumKeyActive(false);
      setThreatLevel(5);
      refreshThreatForecast('none');
      sendState({ attackType: 'none', systemStatus: 'normal', type: 'STATE_UPDATE' });
    }, 5000);
  }, [sendState, refreshThreatForecast]);

  // ===================== resetToNormal (new) =====================

  const resetToNormal = useCallback(() => {
    setAttackType('none');
    setSystemStatus('normal');
    setIsProcessing(false);
    setMlConfidence(0);
    setMlThreatScore(null);
    setThreatLevel(5);
    setQuantumKeyActive(false);
    setQuantumEngines((prev) => ({ ...prev, qsdc: 'standby' }));
    refreshThreatForecast('none');
    sendState({ attackType: 'none', systemStatus: 'normal', isProcessing: false, type: 'STATE_UPDATE' });
  }, [sendState, refreshThreatForecast]);

  // ===================== Provider value =====================

  return (
    <SystemContext.Provider
      value={{
        // Existing
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

        // New QuantumShield++
        quantumEngines,
        threatForecast,
        threatLevel,
        totalAlertsToday,
        lastEventTime,
        sessionId,
        quantumKeyActive,
        pqcAlgorithm,
        wsLatencyMs,
        resetToNormal,
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
