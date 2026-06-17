import { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity } from 'lucide-react';

type AttackType = 'none' | 'jamming' | 'spoofing';
type SystemStatus = 'normal' | 'under-attack' | 'processing' | 'detected' | 'switching' | 'secure';

interface SignalChartProps {
  attackType: AttackType;
  systemStatus: SystemStatus;
}

export function SignalChart({ attackType, systemStatus }: SignalChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const generateData = () => {
      const points = 100;
      const newData = [];

      for (let i = 0; i < points; i++) {
        const x = i;
        let y;

        if (attackType === 'jamming') {
          // Noisy, distorted signal
          y = Math.sin(i * 0.2) * 30 + Math.random() * 40 - 20;
        } else if (attackType === 'spoofing') {
          // Altered frequency
          y = Math.sin(i * 0.4) * 35 + Math.cos(i * 0.15) * 20;
        } else {
          // Normal sine wave
          y = Math.sin(i * 0.2) * 30;
        }

        newData.push({ x, y, y2: y + (Math.random() * 5 - 2.5) });
      }

      setData(newData);
    };

    generateData();
    const interval = setInterval(generateData, 500);

    return () => clearInterval(interval);
  }, [attackType]);

  const getSignalColor = () => {
    if (attackType === 'jamming') return '#ff0040';
    if (attackType === 'spoofing') return '#ffd700';
    if (systemStatus === 'secure') return '#00d4ff';
    return '#00ff41';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold text-gray-300">Signal Monitoring</h2>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSignalColor() }}></div>
            <span className="text-gray-400">
              {attackType === 'jamming' && 'Jamming Interference'}
              {attackType === 'spoofing' && 'Spoofing Pattern'}
              {attackType === 'none' && systemStatus === 'secure' && 'Quantum Encrypted'}
              {attackType === 'none' && systemStatus !== 'secure' && 'Normal Signal'}
            </span>
          </div>
          <span className="text-gray-500 font-mono">
            {attackType === 'none' ? '2.4 GHz' : attackType === 'spoofing' ? '2.6 GHz' : 'INTERFERENCE'}
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Grid background effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getSignalColor()} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={getSignalColor()} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="x" 
              stroke="#666" 
              tick={{ fill: '#666', fontSize: 12 }}
              label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5, fill: '#999', fontSize: 12 }}
            />
            <YAxis 
              stroke="#666" 
              tick={{ fill: '#666', fontSize: 12 }}
              label={{ value: 'Signal Amplitude', angle: -90, position: 'insideLeft', fill: '#999', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="y"
              stroke={getSignalColor()}
              strokeWidth={2}
              fill="url(#signalGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Attack overlay warning */}
        {attackType !== 'none' && (
          <div className="absolute top-4 right-4 px-4 py-2 bg-red-500/20 border border-red-500 rounded text-red-500 text-sm font-semibold animate-pulse">
            ⚠️ ANOMALY DETECTED
          </div>
        )}
      </div>

      {/* Signal metrics */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Signal Strength</p>
          <p className="text-lg font-bold" style={{ color: getSignalColor() }}>
            {attackType === 'jamming' ? '34%' : attackType === 'spoofing' ? '78%' : '95%'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Noise Ratio</p>
          <p className="text-lg font-bold" style={{ color: getSignalColor() }}>
            {attackType === 'jamming' ? '72%' : attackType === 'spoofing' ? '45%' : '8%'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Latency</p>
          <p className="text-lg font-bold" style={{ color: getSignalColor() }}>
            {systemStatus === 'secure' ? '12ms' : attackType !== 'none' ? '156ms' : '24ms'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Packet Loss</p>
          <p className="text-lg font-bold" style={{ color: getSignalColor() }}>
            {attackType === 'jamming' ? '38%' : attackType === 'spoofing' ? '15%' : '0%'}
          </p>
        </div>
      </div>
    </div>
  );
}