import React, { useState, useEffect } from 'react';
import {api} from '../../service/api';
import './styles.css';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function GraficoTriagem() {
  const [pulseTrend, setPulseTrend] = useState([]);
  const [mmhgTrend, setMmhgTrend] = useState([]);
  const [spo2Trend, setSpo2Trend] = useState([]);
  const [respTrend, setRespTrend] = useState([]);
  const [tempTrend, setTempTrend] = useState([]);

  useEffect(() => {
    api.get('/api/vitais')
      .then(res => {
        const data = res.data;
        setPulseTrend(data.pulseTrend);
        setSpo2Trend(data.spo2Trend);
        setRespTrend(data.respTrend);
        setTempTrend(data.tempTrend);

        // Parse dos valores mmHg (ex: "120/80")
        const mmhgParsed = data.mmhgTrend.map(item => {
          const [sistolica, diastolica] = item.value.split('/').map(Number);
          return { time: item.time, sistolica, diastolica };
        });
        setMmhgTrend(mmhgParsed);
      })
      .catch(err => {
        // Trate erros conforme necessário
        console.error('Erro ao buscar dados:', err);
      });
  }, []);

  function VitalGraph({ data, color, dataKey = "value", extraLine, showLegend }) {
    const [activeTooltip, setActiveTooltip] = useState(false);

    return (
      <div
        style={{ width: 220, height: 50, marginBottom: 8 }}
        onClick={() => setActiveTooltip((prev) => !prev)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 6 }}
              name={extraLine ? "Sistólica" : undefined}
            />
            {extraLine && (
              <Line
                type="monotone"
                dataKey={extraLine.dataKey}
                stroke={extraLine.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 6 }}
                name="Diastólica"
              />
            )}
            <XAxis dataKey="time" hide />
            <YAxis domain={['dataMin-2', 'dataMax+2']} hide />
            {showLegend && <Legend verticalAlign="top" height={20} />}
            {activeTooltip && <Tooltip />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="monitor-container">
      <div className="monitor-graph">
        <VitalGraph data={pulseTrend} color="#00ffe7" />
        <VitalGraph
          data={mmhgTrend}
          color="#ffb300"
          dataKey="sistolica"
          extraLine={{ dataKey: "diastolica", color: "#ff6600" }}
          showLegend={true}
        />
        <VitalGraph data={spo2Trend} color="#00ff00" />
        <VitalGraph data={respTrend} color="#ff0077" />
        <VitalGraph data={tempTrend} color="#0077ff" />
      </div>
      <div className="monitor-info">
        <div className="vital">
          <span className="icon">❤️</span>
          <span className="label">PULSE</span>
          <span className="value">{pulseTrend[pulseTrend.length - 1]?.value}</span>
          <span className="unit">BPM</span>
        </div>
        <div className="vital">
          <span className="icon">🌡️</span>
          <span className="label">mmHg</span>
          <span className="value">
            {mmhgTrend.length > 0
              ? `${mmhgTrend[mmhgTrend.length - 1].sistolica}/${mmhgTrend[mmhgTrend.length - 1].diastolica}`
              : '--/--'}
          </span>
        </div>
        <div className="vital">
          <span className="icon">🩸</span>
          <span className="label">%SpO2</span>
          <span className="value">{spo2Trend[spo2Trend.length - 1]?.value}</span>
        </div>
        <div className="vital">
          <span className="icon">🫁</span>
          <span className="label">RESP</span>
          <span className="value">{respTrend[respTrend.length - 1]?.value}</span>
          <span className="unit">RPM</span>
        </div>
        <div className="vital">
          <span className="icon">🌡️</span>
          <span className="label">TEMP</span>
          <span className="value">{tempTrend[tempTrend.length - 1]?.value}</span>
          <span className="unit">°C</span>
        </div>
      </div>
    </div>
  );
}