import React, { useRef, useEffect, useState } from 'react';
import { useATC } from '../context/ATCContext';

const RADAR_CONFIG = {
  WIDTH: 1200,
  HEIGHT: 800,
  CENTER_X: 600,
  CENTER_Y: 400,
  RANGE: 500,
  GRID_SIZE: 50,
};

const Radar = ({ showPredictions = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const sweepAngle = useRef(0);
  const { state } = useATC();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, aircraft: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const drawRadarGrid = () => { 
      // Background
      ctx.fillStyle = '#0a1a2e';
      ctx.fillRect(0, 0, RADAR_CONFIG.WIDTH, RADAR_CONFIG.HEIGHT);
      
      // Draw concentric circles
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.3)';
      ctx.lineWidth = 1;
      for (let r = 100; r <= RADAR_CONFIG.RANGE; r += 100) {
        ctx.beginPath();
        ctx.arc(RADAR_CONFIG.CENTER_X, RADAR_CONFIG.CENTER_Y, r, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add range labels
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillStyle = 'rgba(0, 255, 157, 0.5)';
        ctx.fillText(`${r}`, RADAR_CONFIG.CENTER_X + r - 10, RADAR_CONFIG.CENTER_Y - 5);
      }
      
      // Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(RADAR_CONFIG.CENTER_X - RADAR_CONFIG.RANGE, RADAR_CONFIG.CENTER_Y);
      ctx.lineTo(RADAR_CONFIG.CENTER_X + RADAR_CONFIG.RANGE, RADAR_CONFIG.CENTER_Y);
      ctx.moveTo(RADAR_CONFIG.CENTER_X, RADAR_CONFIG.CENTER_Y - RADAR_CONFIG.RANGE);
      ctx.lineTo(RADAR_CONFIG.CENTER_X, RADAR_CONFIG.CENTER_Y + RADAR_CONFIG.RANGE);
      ctx.stroke();
      
      // Draw grid lines
      ctx.fillStyle = 'rgba(0, 255, 157, 0.4)';
      ctx.font = '9px "JetBrains Mono"';
      
      for (let x = RADAR_CONFIG.CENTER_X - RADAR_CONFIG.RANGE; x <= RADAR_CONFIG.CENTER_X + RADAR_CONFIG.RANGE; x += RADAR_CONFIG.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, RADAR_CONFIG.CENTER_Y - RADAR_CONFIG.RANGE);
        ctx.lineTo(x, RADAR_CONFIG.CENTER_Y + RADAR_CONFIG.RANGE);
        ctx.stroke();
        if (Math.abs(x - RADAR_CONFIG.CENTER_X) > 50) {
          ctx.fillText(`${Math.round((x - RADAR_CONFIG.CENTER_X))}`, x, RADAR_CONFIG.CENTER_Y + 15);
        }
      }
      
      for (let y = RADAR_CONFIG.CENTER_Y - RADAR_CONFIG.RANGE; y <= RADAR_CONFIG.CENTER_Y + RADAR_CONFIG.RANGE; y += RADAR_CONFIG.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(RADAR_CONFIG.CENTER_X - RADAR_CONFIG.RANGE, y);
        ctx.lineTo(RADAR_CONFIG.CENTER_X + RADAR_CONFIG.RANGE, y);
        ctx.stroke();
        if (Math.abs(y - RADAR_CONFIG.CENTER_Y) > 50) {
          ctx.fillText(`${Math.round((RADAR_CONFIG.CENTER_Y - y))}`, RADAR_CONFIG.CENTER_X + 10, y);
        }
      }
      
      // Animated radar sweep
      sweepAngle.current = (sweepAngle.current + 0.02) % (2 * Math.PI);
      ctx.beginPath();
      ctx.moveTo(RADAR_CONFIG.CENTER_X, RADAR_CONFIG.CENTER_Y);
      ctx.lineTo(
        RADAR_CONFIG.CENTER_X + RADAR_CONFIG.RANGE * Math.cos(sweepAngle.current),
        RADAR_CONFIG.CENTER_Y + RADAR_CONFIG.RANGE * Math.sin(sweepAngle.current)
      );
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    
    const drawPredictions = () => {
      if (!showPredictions) return;
      
      state.aircraft.forEach(aircraft => {
        if (!aircraft) return;
        
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(0, 255, 157, 0.4)';
        ctx.lineWidth = 1.5;
        
        let prevX = aircraft.x;
        let prevY = aircraft.y;
        
        // Predict next 10 positions (20 seconds into future)
        for (let i = 1; i <= 10; i++) {
          const time = i * 2;
          const speedInUnits = aircraft.speed / 3600;
          const distance = speedInUnits * time;
          const newX = aircraft.x + distance * Math.cos(aircraft.heading * Math.PI / 180);
          const newY = aircraft.y + distance * Math.sin(aircraft.heading * Math.PI / 180);
          
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(newX, newY);
          ctx.stroke();
          
          // Draw small dot at predicted position
          ctx.beginPath();
          ctx.arc(newX, newY, 2, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(0, 255, 157, 0.5)';
          ctx.fill();
          
          prevX = newX;
          prevY = newY;
        }
        
        ctx.setLineDash([]);
      });
    };
    
    const drawAircraft = () => {
      if (!state.aircraft || state.aircraft.length === 0) {
        return;
      }
      
      state.aircraft.forEach(aircraft => {
        if (!aircraft) return;
        
        // Only draw if within radar bounds
        if (aircraft.x < 0 || aircraft.x > RADAR_CONFIG.WIDTH || 
            aircraft.y < 0 || aircraft.y > RADAR_CONFIG.HEIGHT) {
          return;
        }
        
        // Check if aircraft is in conflict
        const isInConflict = state.conflicts && state.conflicts.some(conflict =>
          conflict && (conflict.aircraft1 === aircraft.id || conflict.aircraft2 === aircraft.id)
        );
        
        let color = '#00ff9d';
        if (isInConflict) color = '#ff3366';
        
        ctx.save();
        ctx.translate(aircraft.x, aircraft.y);
        ctx.rotate((aircraft.heading * Math.PI) / 180);
        
        // Draw aircraft triangle
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;
        
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw heading line
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(16, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw labels
        ctx.shadowBlur = 0;
        ctx.font = 'bold 11px "JetBrains Mono"';
        ctx.fillStyle = color;
        ctx.fillText(aircraft.id, 14, -5);
        
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`${Math.floor(aircraft.altitude)}ft`, 14, 6);
        ctx.fillText(`${Math.floor(aircraft.speed)}kts`, 14, 16);
        
        ctx.restore();
      });
    };
    
    const drawConflictZones = () => {
      if (!state.conflicts || state.conflicts.length === 0) return;
      
      state.conflicts.forEach(conflict => {
        if (!conflict) return;
        
        const aircraft1 = state.aircraft.find(a => a && a.id === conflict.aircraft1);
        const aircraft2 = state.aircraft.find(a => a && a.id === conflict.aircraft2);
        
        if (aircraft1 && aircraft2) {
          // Draw line between conflicting aircraft
          ctx.beginPath();
          ctx.moveTo(aircraft1.x, aircraft1.y);
          ctx.lineTo(aircraft2.x, aircraft2.y);
          ctx.strokeStyle = `rgba(255, 51, 102, 0.6)`;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw pulsing circle at midpoint
          const midX = (aircraft1.x + aircraft2.x) / 2;
          const midY = (aircraft1.y + aircraft2.y) / 2;
          const pulseRadius = 20 + Math.sin(Date.now() / 200) * 5;
          
          ctx.beginPath();
          ctx.arc(midX, midY, pulseRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = '#ff3366';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(midX, midY, pulseRadius - 8, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    };
    
    const animate = () => {
      drawRadarGrid();
      drawConflictZones();
      drawPredictions();
      drawAircraft();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.aircraft, state.conflicts, showPredictions]);
  
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const hovered = state.aircraft.find(aircraft => {
      if (!aircraft) return false;
      const dx = aircraft.x - mouseX;
      const dy = aircraft.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });
    
    if (hovered) {
      setTooltip({
        show: true,
        x: e.clientX + 10,
        y: e.clientY - 30,
        aircraft: hovered,
      });
    } else {
      setTooltip({ show: false, x: 0, y: 0, aircraft: null });
    }
  };
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={RADAR_CONFIG.WIDTH}
        height={RADAR_CONFIG.HEIGHT}
        className="border-2 border-atc-green/30 rounded-lg shadow-2xl cursor-crosshair"
        style={{ width: '100%', height: 'auto', background: '#0a1a2e' }}
        onMouseMove={handleMouseMove}
      />
      
      {tooltip.show && tooltip.aircraft && (
        <div
          className="fixed bg-black/90 border border-atc-green rounded-lg p-2 text-xs z-50 pointer-events-none shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="text-atc-green font-bold">{tooltip.aircraft.id}</div>
          <div className="text-gray-300">Alt: {Math.floor(tooltip.aircraft.altitude)} ft</div>
          <div className="text-gray-300">Speed: {Math.floor(tooltip.aircraft.speed)} kts</div>
          <div className="text-gray-300">Heading: {Math.floor(tooltip.aircraft.heading)}°</div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-xs text-atc-green/60 font-mono bg-black/50 px-2 py-1 rounded">
        RANGE: {RADAR_CONFIG.RANGE} NM | AIRCRAFT: {state.aircraft.length} | MODE: {state.isSimulating ? 'AUTO' : 'MANUAL'}
        {showPredictions && <span className="ml-2 text-yellow-400"> | PREDICTIONS ON</span>}
      </div>
    </div>
  );
};

export default Radar;