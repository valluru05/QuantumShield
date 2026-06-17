import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import url from 'url';

interface Client {
  ws: WebSocket;
  id: string;
}

interface QuantumMLData {
  type?: 'QUANTUM_INFERENCE_COMPLETE' | 'QUANTUM_TRAINING_COMPLETE';
  status?: 'training_started' | 'training_complete' | 'training_failed';
  progress?: number;
  reason?: string;
  result?: QuantumResult;
  modelDetails?: ModelDetails;
  error?: string;
  details?: string;
  timestamp: string;
}

interface QuantumResult {
  final_result?: string;
  confidence?: number;
  attack_detected?: boolean;
  model_accuracy?: number;
  model_f1?: number;
  validation_metrics?: {
    accuracy?: number;
  };
  models?: {
    qsvm?: {
      accuracy?: number;
      f1?: number;
      validation_accuracy?: number;
    };
  };
  timestamp?: string;
}

interface ModelDetails {
  qsvm_accuracy?: number;
  qsvm_f1?: number;
  active_model: string;
  timestamp?: string;
}

interface StateMessage {
  type: 'MODE_CHANGE' | 'ATTACK_LAUNCHED' | 'STATE_UPDATE' | 'QUANTUM_ML_STATUS' | 'PING';
  attackType?: 'none' | 'jamming' | 'spoofing';
  systemStatus?: 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure';
  isProcessing?: boolean;
  mlConfidence?: number | null;
  mlThreatScore?: number | null;
  mlResponseTimeMs?: number | null;
  jammingAccuracy?: number | null;
  modelAccuracy?: number | null;
  modelF1?: number | null;
  modelValidationAccuracy?: number | null;
  clientId?: string;
  quantumMLData?: QuantumMLData;
}

interface QuantumMLState {
  isTraining: boolean;
  trainingProgress: number;
  lastTrainingResult: QuantumResult | null;
  modelAccuracy: number;
  modelF1: number;
  modelValidationAccuracy: number;
}

const PORT = process.env.PORT || 3001;
const clients: Map<string, Client> = new Map();

// Quantum ML state
let quantumMLState: QuantumMLState = {
  isTraining: false,
  trainingProgress: 0,
  lastTrainingResult: null,
  modelAccuracy: 0,
  modelF1: 0,
  modelValidationAccuracy: 0,
};

let currentTrainingProcess: ReturnType<typeof spawn> | null = null;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname;

  // NEW Quantum Pipeline Routes (using quantum_pipeline.py)
  if (pathname === '/api/quantum/infer' && req.method === 'POST') {
    handleQuantumPipelineInfer(req, res);
  } else if (pathname === '/api/quantum/train' && req.method === 'POST') {
    handleQuantumPipelineTrain(req, res);
  }
  // QuantumShield++ New Routes
  else if (pathname === '/api/qsdc/simulate' && req.method === 'POST') {
    handleQSDCSimulate(req, res);
  } else if (pathname === '/api/pqc/simulate' && req.method === 'POST') {
    handlePQCSimulate(req, res);
  } else if (pathname === '/api/quantum/walk' && req.method === 'POST') {
    handleQuantumWalk(req, res);
  } else if (pathname === '/api/ai/threat-intel' && req.method === 'GET') {
    handleAIThreatIntel(req, res);
  }
  // OLD Quantum ML Routes (using quantum_ml_trainer.py) - kept for backward compatibility
  else if (pathname === '/api/quantum-ml/train' && req.method === 'POST') {
    handleQuantumMLTrain(req, res);
  } else if (pathname === '/api/quantum-ml/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(quantumMLState));
  } else if (pathname === '/api/quantum-ml/evaluate' && req.method === 'POST') {
    handleQuantumMLEvaluate(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});
const wss = new WebSocketServer({ server });

let globalState = {
  attackType: 'none' as 'none' | 'jamming' | 'spoofing',
  systemStatus: 'normal' as 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure',
  isProcessing: false,
  mlConfidence: null as number | null,
  mlThreatScore: null as number | null,
  mlResponseTimeMs: null as number | null,
  jammingAccuracy: null as number | null,
  modelAccuracy: null as number | null,
  modelF1: null as number | null,
  modelValidationAccuracy: null as number | null,
};

wss.on('connection', (ws: WebSocket) => {
  const clientId = Math.random().toString(36).substring(2, 11);
  console.log(`Client connected: ${clientId}`);

  clients.set(clientId, { ws, id: clientId });

  // Send current global state to the newly connected client
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    state: globalState,
    clientId,
  }));

  ws.on('message', (message: string) => {
    try {
      const data: StateMessage = JSON.parse(message);

      if (data.type === 'PING') {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
        return;
      }

      if (data.type === 'MODE_CHANGE') {
        // Update global state
        if (data.attackType !== undefined) {
          globalState.attackType = data.attackType;
        }
      } else if (data.type === 'STATE_UPDATE') {
        // Update any part of the global state
        if (data.systemStatus !== undefined) {
          globalState.systemStatus = data.systemStatus;
        }
        if (data.isProcessing !== undefined) {
          globalState.isProcessing = data.isProcessing;
        }
        if (data.attackType !== undefined) {
          globalState.attackType = data.attackType;
        }
        if (data.mlConfidence !== undefined) {
          globalState.mlConfidence = data.mlConfidence;
        }
        if (data.mlThreatScore !== undefined) {
          globalState.mlThreatScore = data.mlThreatScore;
        }
        if (data.mlResponseTimeMs !== undefined) {
          globalState.mlResponseTimeMs = data.mlResponseTimeMs;
        }
        if (data.jammingAccuracy !== undefined) {
          globalState.jammingAccuracy = data.jammingAccuracy;
        }
        if (data.modelAccuracy !== undefined) {
          globalState.modelAccuracy = data.modelAccuracy;
        }
        if (data.modelF1 !== undefined) {
          globalState.modelF1 = data.modelF1;
        }
        if (data.modelValidationAccuracy !== undefined) {
          globalState.modelValidationAccuracy = data.modelValidationAccuracy;
        }
      }

      // Broadcast the state change to all connected clients
      const broadcastMessage = JSON.stringify({
        type: data.type,
        state: globalState,
        fromClientId: clientId,
      });

      clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(broadcastMessage);
        }
      });

      console.log(`State updated by ${clientId}:`, globalState);
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  });

  ws.on('error', (err: Error) => {
    console.error(`WebSocket error for ${clientId}:`, err);
  });
});

// Handler for quantum ML training
function handleQuantumMLTrain(req: http.IncomingMessage, res: http.ServerResponse) {
  const started = startInternalQsvmTraining('api');

  // Send immediate response
  res.writeHead(started ? 202 : 409, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: started,
    message: started
      ? 'Internal QSVM training started'
      : 'Training already in progress',
  }));
}

// Handler for signal evaluation using trained model
function handleQuantumMLEvaluate(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  let body = '';
  req.on('data', (chunk: Buffer) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const evalStart = Date.now();
      const data = JSON.parse(body);
      const signalFeatures = data.features || [1, 0, -1, 0.5];

      if (!quantumMLState.lastTrainingResult) {
        const started = startInternalQsvmTraining('evaluate_fallback');
        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Model not trained yet. Internal QSVM training has been started.',
          trainingStarted: started,
        }));
        return;
      }

      const trainerPath = path.join(process.cwd(), 'quantum', 'quantum_ml_trainer.py');
      const featureArg = Array.isArray(signalFeatures)
        ? signalFeatures.join(',')
        : String(signalFeatures);
      const pythonProcess = spawn('python3', [
        trainerPath,
        '--mode',
        'evaluate',
        '--features',
        featureArg,
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });

      pythonProcess.stderr.on('data', (chunk: Buffer) => {
        errorOutput += chunk.toString();
      });

      pythonProcess.on('close', (code: number) => {
        if (code !== 0) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'QSVM evaluation failed',
            details: errorOutput,
          }));
          return;
        }

        const parsed = extractJsonPayload(output);
        if (!parsed || !parsed.success) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Could not parse QSVM evaluation output',
            raw_output: output,
          }));
          return;
        }

        const responseTimeMs = Date.now() - evalStart;
        globalState.mlConfidence = Math.max(
          0,
          Math.min(100, Number(parsed.confidence ?? 0) * 100)
        );
        globalState.mlThreatScore = Math.max(
          0,
          Math.min(100, Number(parsed.threat_score ?? 0) * 100)
        );
        globalState.mlResponseTimeMs = responseTimeMs;
        globalState.jammingAccuracy = Math.max(
          0,
          Math.min(100, Number(parsed.probabilities?.jamming ?? 0) * 100)
        );
        globalState.attackType =
          parsed.prediction === 'jamming' ? 'jamming'
          : parsed.prediction === 'spoofing' ? 'spoofing'
          : 'none';

        broadcastSystemState('STATE_UPDATE');

        if (parsed.establish_secure_connection === true) {
          establishSecureConnection(parsed.prediction);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          prediction: parsed.prediction,
          confidence: parsed.confidence,
          probabilities: parsed.probabilities,
          threatScore: parsed.threat_score,
          establishSecureConnection: parsed.establish_secure_connection,
          mlConfidence: globalState.mlConfidence,
          mlThreatScore: globalState.mlThreatScore,
          mlResponseTimeMs: globalState.mlResponseTimeMs,
          jammingAccuracy: globalState.jammingAccuracy,
          modelAccuracy: parsed.model_accuracy ?? quantumMLState.modelAccuracy,
          modelF1: parsed.model_f1 ?? quantumMLState.modelF1,
          modelValidationAccuracy:
            parsed.validation_metrics?.accuracy ?? quantumMLState.modelValidationAccuracy,
          timestamp: new Date().toISOString(),
        }));
      });
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Invalid request body',
      }));
    }
  });
}

function startInternalQsvmTraining(reason: 'startup' | 'api' | 'evaluate_fallback'): boolean {
  if (quantumMLState.isTraining || currentTrainingProcess) {
    return false;
  }

  quantumMLState.isTraining = true;
  quantumMLState.trainingProgress = 0;
  console.log(`🚀 Starting internal QSVM training (${reason})...`);

  broadcastToClients({
    type: 'QUANTUM_ML_STATUS',
    quantumMLData: {
      status: 'training_started',
      progress: 0,
      reason,
      timestamp: new Date().toISOString(),
    },
  });

  const trainerPath = path.join(process.cwd(), 'quantum', 'quantum_ml_trainer.py');
  const proc = spawn('python3', [trainerPath, '--mode', 'train']);
  currentTrainingProcess = proc;

  let output = '';
  let errorOutput = '';

  proc.stdout.on('data', (data: Buffer) => {
    const line = data.toString();
    output += line;
    if (line.trim().startsWith('{')) {
      quantumMLState.trainingProgress = 100;
    }
  });

  proc.stderr.on('data', (data: Buffer) => {
    const line = data.toString();
    errorOutput += line;
    console.error('QML Error:', line.trim());
  });

  proc.on('close', (code: number) => {
    currentTrainingProcess = null;
    quantumMLState.isTraining = false;

    if (code !== 0) {
      console.error('Quantum ML Training failed:', errorOutput);
      broadcastToClients({
        type: 'QUANTUM_ML_STATUS',
        quantumMLData: {
          status: 'training_failed',
          progress: quantumMLState.trainingProgress,
          error: 'Training process failed',
          details: errorOutput,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const parsed = extractJsonPayload(output);
    if (!parsed) {
      console.error('Error parsing training result');
      broadcastToClients({
        type: 'QUANTUM_ML_STATUS',
        quantumMLData: {
          status: 'training_failed',
          progress: quantumMLState.trainingProgress,
          error: 'Failed to parse training result',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    quantumMLState.lastTrainingResult = parsed;
    quantumMLState.modelAccuracy =
      parsed.model_accuracy ?? parsed.models?.qsvm?.accuracy ?? 0;
    quantumMLState.modelF1 = parsed.model_f1 ?? parsed.models?.qsvm?.f1 ?? 0;
    quantumMLState.modelValidationAccuracy =
      parsed.validation_metrics?.accuracy ?? parsed.models?.qsvm?.validation_accuracy ?? 0;
    globalState.modelAccuracy = quantumMLState.modelAccuracy;
    globalState.modelF1 = quantumMLState.modelF1;
    globalState.modelValidationAccuracy = quantumMLState.modelValidationAccuracy;

    const modelDetails = {
      qsvm_accuracy: parsed.models?.qsvm?.accuracy,
      qsvm_f1: parsed.models?.qsvm?.f1,
      active_model: 'qsvm',
      timestamp: parsed.timestamp,
    };

    broadcastToClients({
      type: 'QUANTUM_ML_STATUS',
      quantumMLData: {
        status: 'training_complete',
        progress: 100,
        reason,
        result: parsed,
        modelDetails,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return true;
}

function extractJsonPayload(raw: string): QuantumResult | null {
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as QuantumResult;
  } catch {
    return null;
  }
}

function establishSecureConnection(prediction: 'jamming' | 'spoofing') {
  globalState.attackType = prediction;
  globalState.systemStatus = 'detected';
  globalState.isProcessing = true;
  broadcastSystemState('STATE_UPDATE');

  setTimeout(() => {
    globalState.systemStatus = 'switching';
    broadcastSystemState('STATE_UPDATE');
  }, 1200);

  setTimeout(() => {
    globalState.systemStatus = 'secure';
    globalState.attackType = 'none';
    globalState.isProcessing = false;
    broadcastSystemState('STATE_UPDATE');
  }, 2600);
}

function broadcastSystemState(type: 'MODE_CHANGE' | 'STATE_UPDATE') {
  const broadcastMessage = JSON.stringify({
    type,
    state: globalState,
    fromClientId: 'server-qsvm',
  });

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(broadcastMessage);
    }
  });
}

// Utility to broadcast to all connected WebSocket clients
function broadcastToClients(message: StateMessage) {
  const broadcastMessage = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(broadcastMessage);
    }
  });
}

// ============== NEW QUANTUM PIPELINE HANDLERS ==============

/**
 * Handler for quantum pipeline inference
 * Uses quantum_pipeline.py for full quantum ML inference
 */
function handleQuantumPipelineInfer(req: http.IncomingMessage, res: http.ServerResponse) {
  let body = '';

  req.on('data', (chunk: Buffer) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const { signal, attack_type = 'normal', return_full_pipeline = true } = data;
      // Explicitly coerce to boolean to prevent truthy/falsy issues
      const visualization_only = data.visualization_only === true;

      // Spawn Python process for quantum inference
      const pythonProc = spawn('python3', [
        path.join(process.cwd(), 'quantum', 'quantum_pipeline.py'),
        '--mode', 'infer',
        '--attack_type', attack_type
        // Removed --debug to get clean JSON output
      ]);

      let output = '';
      let errorOutput = '';

      pythonProc.stdout.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });

      pythonProc.stderr.on('data', (chunk: Buffer) => {
        const errLine = chunk.toString();
        errorOutput += errLine;
        // Only log actual errors, not debug output
        if (errLine.includes('Error:') || errLine.includes('Failed')) {
          console.error('Quantum inference stderr:', errLine.trim());
        }
      });

      pythonProc.on('close', (code: number) => {
        if (code !== 0) {
          console.error('Quantum inference error:', errorOutput);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Quantum inference failed',
            details: errorOutput
          }));
          return;
        }

        // Extract JSON from output
        const firstBrace = output.indexOf('{');
        const lastBrace = output.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
          console.error('Failed to parse quantum result:', output);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Failed to parse quantum result',
            raw_output: output
          }));
          return;
        }

        try {
          const jsonStr = output.slice(firstBrace, lastBrace + 1);
          let result;

          try {
            result = JSON.parse(jsonStr);
          } catch (firstErr) {
            // Python output single-quoted repr, attempt a safer replacement
            const cleaned = jsonStr
              .replace(/(^|[{}[\]:, ]|")'|'([{}()[\]:, ]|$)/g, '$1"$2')
              .replace(/True/g, 'true')
              .replace(/False/g, 'false')
              .replace(/None/g, 'null');
            try {
              result = JSON.parse(cleaned);
            } catch (secondErr) {
              // Final fallback
              const simpleCleaned = jsonStr
                .replace(/'/g, '"')
                .replace(/True/g, 'true')
                .replace(/False/g, 'false')
                .replace(/None/g, 'null');
              try {
                result = JSON.parse(simpleCleaned);
              } catch (thirdErr) {
                console.error('All JSON parsing attempts failed:', thirdErr);
                result = {};
              }
            }
          }

          // Only broadcast and update state if NOT visualization_only
          if (!visualization_only) {
            // Broadcast to WebSocket clients for multi-device sync
            broadcastToClients({
              type: 'QUANTUM_ML_STATUS',
              quantumMLData: {
                type: 'QUANTUM_INFERENCE_COMPLETE',
                result: result,
                timestamp: new Date().toISOString(),
              },
            });

            // Update global state with quantum ML results
            if (result.confidence !== undefined) {
              globalState.mlConfidence = Math.round(result.confidence * 100);
            }
            if (result.final_result) {
              if (result.final_result === 'jamming') {
                globalState.attackType = 'jamming';
              } else if (result.final_result === 'spoofing') {
                globalState.attackType = 'spoofing';
              } else {
                globalState.attackType = 'none';
              }
            }
            if (result.metadata?.execution_times_ms?.total) {
              globalState.mlResponseTimeMs = result.metadata.execution_times_ms.total;
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            ...result
          }));
        } catch (parseErr) {
          console.error('JSON parse error:', parseErr);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Failed to parse result JSON',
            raw: output.slice(firstBrace, lastBrace + 1)
          }));
        }
      });

    } catch (err) {
      console.error('Request parsing error:', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
}

/**
 * Handler for quantum pipeline training
 * Trains the QSVM using quantum_pipeline.py
 */
function handleQuantumPipelineTrain(req: http.IncomingMessage, res: http.ServerResponse) {
  console.log('Starting quantum pipeline training...');

  const pythonProc = spawn('python3', [
    path.join(process.cwd(), 'quantum', 'quantum_pipeline.py'),
    '--mode', 'train'
    // Removed --debug to get clean JSON output
  ]);

  let output = '';
  let errorOutput = '';

  pythonProc.stdout.on('data', (chunk: Buffer) => {
    const line = chunk.toString();
    output += line;
    console.log('Training:', line.trim());
  });

  pythonProc.stderr.on('data', (chunk: Buffer) => {
    errorOutput += chunk.toString();
  });

  pythonProc.on('close', (code: number) => {
    if (code !== 0) {
      console.error('Quantum training failed:', errorOutput);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Quantum pipeline training failed',
        details: errorOutput
      }));
      return;
    }

    const firstBrace = output.indexOf('{');
    const lastBrace = output.lastIndexOf('}');

    let result: any = null;
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        result = JSON.parse(output.slice(firstBrace, lastBrace + 1));
      } catch (e) {
        console.warn('Could not parse training result JSON');
      }
    }

    // Broadcast training completion
    broadcastToClients({
      type: 'QUANTUM_ML_STATUS',
      quantumMLData: {
        type: 'QUANTUM_TRAINING_COMPLETE',
        result: result,
        timestamp: new Date().toISOString(),
      },
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      training_complete: true,
      result: result,
      message: 'Quantum pipeline training complete'
    }));
  });
}

import os from 'os';

// ============== QUANTUMSHIELD++ NEW HANDLERS ==============

/**
 * Handler for QSDC (Quantum Secure Direct Communication) simulation
 */
function handleQSDCSimulate(req: http.IncomingMessage, res: http.ServerResponse) {
  let body = '';
  req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      const simulate_attack = data.simulate_attack === true;

      const pythonProc = spawn('python3', [
        path.join(process.cwd(), 'quantum', 'quantum_qsdc.py'),
        '--mode', simulate_attack ? 'attack' : 'establish',
      ]);

      let output = '';
      let errorOutput = '';

      pythonProc.stdout.on('data', (chunk: Buffer) => { output += chunk.toString(); });
      pythonProc.stderr.on('data', (chunk: Buffer) => { errorOutput += chunk.toString(); });

      pythonProc.on('close', (code: number) => {
        if (code !== 0) {
          // Return simulated result if Python fails
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            simulated: true,
            session_id: `QS-${Date.now()}`,
            is_established: !simulate_attack,
            qkd_result: {
              is_secure: !simulate_attack,
              eavesdrop_detected: simulate_attack,
              qber: simulate_attack ? 0.18 : 0.02,
              final_key_length: 256,
              key_hex: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            },
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        try {
          const result = JSON.parse(output);

          // Broadcast QSDC status via WebSocket
          broadcastToClients({
            type: 'QUANTUM_ML_STATUS',
            quantumMLData: {
              type: 'QUANTUM_INFERENCE_COMPLETE',
              result: { qsdc_status: result.success ? 'secure' : 'failed', ...result },
              timestamp: new Date().toISOString(),
            },
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to parse QSDC result', raw: output }));
        }
      });
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
}

/**
 * Handler for PQC (Post-Quantum Cryptography) simulation
 */
function handlePQCSimulate(req: http.IncomingMessage, res: http.ServerResponse) {
  let body = '';
  req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      const kyber_level = data.kyber_level || 768;

      const pythonProc = spawn('python3', [
        path.join(process.cwd(), 'quantum', 'quantum_pqc.py'),
        '--mode', 'exchange',
        '--kyber-level', String(kyber_level),
      ]);

      let output = '';

      pythonProc.stdout.on('data', (chunk: Buffer) => { output += chunk.toString(); });
      pythonProc.stderr.on('data', () => {});

      pythonProc.on('close', (code: number) => {
        if (code !== 0) {
          // Return simulated result
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            simulated: true,
            security: {
              classical_security_bits: 192,
              quantum_security_bits: 128,
              shor_resistant: true,
              grover_resistant: true,
              nist_pqc_standardized: true,
              attack_resistance_percent: 98.7,
            },
            kem: { algorithm: `CRYSTALS-Kyber-${kyber_level}` },
            dsa: { algorithm: 'CRYSTALS-Dilithium3' },
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        try {
          const result = JSON.parse(output);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to parse PQC result' }));
        }
      });
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
}

/**
 * Handler for standalone Quantum Walk simulation
 */
function handleQuantumWalk(req: http.IncomingMessage, res: http.ServerResponse) {
  let body = '';
  req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      const attack_type = data.attack_type || 'normal';

      const pythonProc = spawn('python3', [
        path.join(process.cwd(), 'quantum', 'quantum_pipeline.py'),
        '--mode', 'infer',
        '--attack_type', attack_type,
      ]);

      let output = '';
      pythonProc.stdout.on('data', (chunk: Buffer) => { output += chunk.toString(); });
      pythonProc.stderr.on('data', () => {});

      pythonProc.on('close', (code: number) => {
        if (code !== 0) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Quantum walk failed' }));
          return;
        }

        const firstBrace = output.indexOf('{');
        const lastBrace = output.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No JSON output from quantum walk' }));
          return;
        }

        try {
          const result = JSON.parse(output.slice(firstBrace, lastBrace + 1));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, ...result }));
        } catch {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Parse failed' }));
        }
      });
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
  });
}

/**
 * Handler for AI Threat Intelligence
 */
function handleAIThreatIntel(req: http.IncomingMessage, res: http.ServerResponse) {
  const threatLevel = globalState.attackType !== 'none' ? 75 : 12;
  const prediction = globalState.attackType !== 'none' ? globalState.attackType : 'normal';

  const intel = {
    threat_level: threatLevel,
    prediction,
    confidence: globalState.mlConfidence ?? 0,
    forecast: Array.from({ length: 6 }, (_, i) => ({
      time: `+${i}m`,
      threat_probability: Math.max(0, Math.min(100, threatLevel + (Math.random() - 0.5) * 20)),
    })),
    recommendations: prediction === 'jamming'
      ? ['Activate frequency hopping', 'Increase transmission power', 'Switch to DSSS']
      : prediction === 'spoofing'
      ? ['Enable multi-layer auth', 'Run signal fingerprinting', 'Verify channel identity']
      : ['Maintain standard posture', 'Continue monitoring', 'Run diagnostics'],
    attack_signature: globalState.attackType !== 'none'
      ? `Detected ${globalState.attackType} pattern with ${Math.round(globalState.mlConfidence ?? 0)}% confidence`
      : 'No anomalies detected',
    system_status: globalState.systemStatus,
    timestamp: new Date().toISOString(),
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(intel));
}



const PORT_NUM = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

server.listen(PORT_NUM, '0.0.0.0', () => {
  const localIP = os.networkInterfaces();
  let ip = '0.0.0.0';
  
  // Try to find a local IP address
  for (const [name, addrs] of Object.entries(localIP)) {
    for (const addr of addrs as any[]) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ip = addr.address;
        break;
      }
    }
  }
  
  console.log(`WebSocket server is running on ws://${ip}:${PORT_NUM}`);
  console.log(`Local access: ws://localhost:${PORT_NUM}`);

  // Train QSVM automatically on server startup.
  startInternalQsvmTraining('startup');
});
