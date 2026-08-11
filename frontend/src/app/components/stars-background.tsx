'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

interface VoteStreak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  history: { x: number; y: number }[];
  life: number;
  maxLife: number;
}

interface StarsBackgroundProps {
  starColor?: string; // Not strictly used since color is mixed, but kept for compatibility
  speed?: number;
  factor?: number;
  pointerEvents?: boolean;
}

export function StarsBackground({
  speed = 150,
  factor = 0.08,
  pointerEvents = true
}: StarsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streaksRef = useRef<VoteStreak[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize 3D Stars
    const maxDepth = 1000;
    const numStars = Math.floor(width * height * factor * 0.008);
    const stars: Star[] = [];

    // Colors
    const colors = [
      '#ffffff', // 80% white
      '#8B5CF6', // 10% violet
      '#06B6D4', // 10% cyan
    ];

    const getRandomColor = () => {
      const rand = Math.random();
      if (rand < 0.8) return colors[0];
      if (rand < 0.9) return colors[1];
      return colors[2];
    };

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * maxDepth,
        size: Math.random() * 1.5 + 0.5,
        color: getRandomColor(),
      });
    }

    const resizeCanvas = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);

    // Custom Event Listener for Vote Streaks
    const handleVoteStreak = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; type: 'yes' | 'no' }>;
      const { x, y, type } = customEvent.detail;

      // Create a streak shooting upwards/outwards
      const angle = (Math.random() * 60 - 30) - 90; // Shoot upwards, random angle between -60 and -120 deg
      const rad = (angle * Math.PI) / 180;
      const velocityMagnitude = Math.random() * 15 + 25; // 25-40px/frame speed

      const streakColor = type === 'yes' ? '#06B6D4' : '#8B5CF6';

      streaksRef.current.push({
        x,
        y,
        vx: Math.cos(rad) * velocityMagnitude,
        vy: Math.sin(rad) * velocityMagnitude,
        color: streakColor,
        history: [],
        life: 0,
        maxLife: Math.random() * 20 + 30, // lives for 30-50 frames
      });
    };

    window.addEventListener('vote-streak', handleVoteStreak);

    // Animation loop
    const animate = () => {
      // Clear with slight alpha to create motion blur trails on stars
      ctx.fillStyle = 'rgba(3, 3, 3, 0.4)';
      ctx.fillRect(0, 0, width, height);

      const focalLength = width * 0.8;
      const step = speed * 0.05; // speed scale

      // Draw & Update 3D Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Save previous depth for trails
        const prevZ = star.z;
        
        star.z -= step;

        // Reset star if it passes the camera or goes too close
        if (star.z <= 0) {
          star.z = maxDepth;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          continue;
        }

        // Project current coordinates
        const px = (star.x / star.z) * focalLength + width / 2;
        const py = (star.y / star.z) * focalLength + height / 2;

        // Project previous coordinates for trail
        const ppx = (star.x / prevZ) * focalLength + width / 2;
        const ppy = (star.y / prevZ) * focalLength + height / 2;

        // Check if star is off-screen
        if (px < 0 || px > width || py < 0 || py > height) {
          continue;
        }

        const size = (1 - star.z / maxDepth) * star.size * 2;
        
        // Draw star trail line
        ctx.beginPath();
        ctx.strokeStyle = star.color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.moveTo(ppx, ppy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // Draw & Update Vote Streaks (Interaction shooting stars)
      const activeStreaks = streaksRef.current;
      for (let i = activeStreaks.length - 1; i >= 0; i--) {
        const streak = activeStreaks[i];
        
        // Add to history
        streak.history.push({ x: streak.x, y: streak.y });
        if (streak.history.length > 12) {
          streak.history.shift();
        }

        // Move particle
        streak.x += streak.vx;
        streak.y += streak.vy;
        streak.life++;

        // Draw trail
        if (streak.history.length > 1) {
          ctx.beginPath();
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          
          const gradient = ctx.createLinearGradient(
            streak.history[0].x,
            streak.history[0].y,
            streak.x,
            streak.y
          );
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(1, streak.color);
          
          ctx.strokeStyle = gradient;
          ctx.moveTo(streak.history[0].x, streak.history[0].y);
          for (let j = 1; j < streak.history.length; j++) {
            ctx.lineTo(streak.history[j].x, streak.history[j].y);
          }
          ctx.stroke();
        }

        // Draw glowing head
        ctx.beginPath();
        ctx.arc(streak.x, streak.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = streak.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Check if streak is dead
        if (
          streak.life >= streak.maxLife || 
          streak.x < -100 || 
          streak.x > width + 100 || 
          streak.y < -100 || 
          streak.y > height + 100
        ) {
          activeStreaks.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('vote-streak', handleVoteStreak);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, factor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: -1,
        background: '#030303',
        pointerEvents: pointerEvents ? 'auto' : 'none'
      }}
    />
  );
}
