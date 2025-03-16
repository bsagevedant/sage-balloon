import React, { useState, useEffect, useRef } from 'react';
import { Target } from 'lucide-react';

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  points: number;
  pattern: 'solid' | 'striped' | 'dotted';
  direction: 'straight' | 'zigzag' | 'sine';
  amplitude?: number;
  frequency?: number;
  phase?: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  speed: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [combo, setCombo] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(Date.now());

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];
  const projectileSpeed = 10;
  const balloonSpawnRate = 1000;
  const maxBalloons = 15; // Increased for better continuous flow
  const comboTimeout = 2000; // 2 seconds to maintain combo

  const createBalloon = (yPos = window.innerHeight): Balloon => {
    const patterns: Balloon['pattern'][] = ['solid', 'striped', 'dotted'];
    const directions: Balloon['direction'][] = ['straight', 'zigzag', 'sine'];
    const size = 30 + Math.random() * 20;
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    // Smaller balloons are worth more points
    const points = Math.floor((50 - size) / 5) + 10;

    return {
      id: Date.now() + Math.random(),
      x: Math.random() * (window.innerWidth - 50),
      y: yPos,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 1 + Math.random() * 2,
      size,
      points,
      pattern,
      direction,
      amplitude: direction === 'sine' || direction === 'zigzag' ? 50 + Math.random() * 50 : 0,
      frequency: direction === 'sine' ? 0.005 + Math.random() * 0.01 : 0,
      phase: Math.random() * Math.PI * 2,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const savedHighScore = localStorage.getItem('balloonGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Initial balloon spawn
    const initialBalloons = Array.from({ length: maxBalloons }, () => 
      createBalloon(window.innerHeight + Math.random() * window.innerHeight)
    );
    setBalloons(initialBalloons);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawBalloon = (ctx: CanvasRenderingContext2D, balloon: Balloon) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(balloon.x, balloon.y, balloon.size, 0, Math.PI * 2);
    
    if (balloon.pattern === 'solid') {
      ctx.fillStyle = balloon.color;
      ctx.fill();
    } else if (balloon.pattern === 'striped') {
      const gradient = ctx.createLinearGradient(
        balloon.x - balloon.size,
        balloon.y - balloon.size,
        balloon.x + balloon.size,
        balloon.y + balloon.size
      );
      gradient.addColorStop(0, balloon.color);
      gradient.addColorStop(0.5, '#FFFFFF');
      gradient.addColorStop(1, balloon.color);
      ctx.fillStyle = gradient;
      ctx.fill();
    } else if (balloon.pattern === 'dotted') {
      ctx.fillStyle = balloon.color;
      ctx.fill();
      
      // Add dots
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const dotX = balloon.x + Math.cos(angle) * (balloon.size * 0.5);
        const dotY = balloon.y + Math.sin(angle) * (balloon.size * 0.5);
        ctx.beginPath();
        ctx.arc(dotX, dotY, balloon.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  };

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw balloons
      setBalloons(prev => prev.map(balloon => {
        let newX = balloon.x;
        
        if (balloon.direction === 'zigzag') {
          newX = balloon.x + Math.sin(balloon.y * 0.05) * 2;
        } else if (balloon.direction === 'sine' && balloon.amplitude && balloon.frequency) {
          newX = balloon.x + Math.sin(balloon.y * balloon.frequency + (balloon.phase || 0)) * balloon.amplitude;
        }

        // Keep balloons within screen bounds
        newX = Math.max(balloon.size, Math.min(canvas.width - balloon.size, newX));

        let newY = balloon.y - balloon.speed;
        
        // Reset balloon position when it goes off screen
        if (newY + balloon.size < 0) {
          return createBalloon();
        }

        return {
          ...balloon,
          x: newX,
          y: newY,
        };
      }));

      // Update and draw projectiles
      setProjectiles(prev => prev
        .map(projectile => ({
          ...projectile,
          y: projectile.y - projectileSpeed,
        }))
        .filter(projectile => projectile.y > 0)
      );

      // Draw balloons
      balloons.forEach(balloon => drawBalloon(ctx, balloon));

      // Draw projectiles
      projectiles.forEach(projectile => {
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
        ctx.closePath();
      });

      // Draw crosshair
      ctx.beginPath();
      ctx.arc(mousePosition.x, mousePosition.y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // Check collisions
      projectiles.forEach(projectile => {
        balloons.forEach(balloon => {
          const dx = projectile.x - balloon.x;
          const dy = projectile.y - balloon.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < balloon.size + 5) {
            setBalloons(prev => [
              ...prev.filter(b => b.id !== balloon.id),
              createBalloon() // Spawn a new balloon immediately
            ]);
            setProjectiles(prev => prev.filter(p => p.id !== projectile.id));
            
            const now = Date.now();
            if (now - lastHitTime < comboTimeout) {
              setCombo(prev => prev + 1);
              setScore(prev => prev + (balloon.points * (combo + 1)));
            } else {
              setCombo(0);
              setScore(prev => prev + balloon.points);
            }
            setLastHitTime(now);

            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('balloonGameHighScore', score.toString());
            }
          }
        });
      });
    };

    const animationFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, [balloons, projectiles, mousePosition, gameOver, score, highScore, combo, lastHitTime]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (gameOver) {
      setGameOver(false);
      setScore(0);
      setCombo(0);
      setBalloons([]);
      setProjectiles([]);
      return;
    }

    const newProjectile: Projectile = {
      id: Date.now(),
      x: e.clientX,
      y: window.innerHeight - 20,
      speed: projectileSpeed,
    };

    setProjectiles(prev => [...prev, newProjectile]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900" onMouseMove={handleMouseMove} onClick={handleClick}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 text-white">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="text-xl">Combo: x{combo + 1}</div>
      </div>
      
      <div className="absolute top-4 right-4 text-white text-2xl font-bold">
        High Score: {highScore}
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <p className="text-xl mb-6">High Score: {highScore}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
              onClick={() => {}}
            >
              <Target className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;