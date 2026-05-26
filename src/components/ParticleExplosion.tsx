import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'circle' | 'star' | 'spark';
}

interface ParticleExplosionProps {
  active: boolean;
  x?: number;
  y?: number;
  count?: number;
  colors?: string[];
  onComplete?: () => void;
}

export default function ParticleExplosion({
  active,
  x = 50,
  y = 50,
  count = 30,
  colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9a3c'],
  onComplete,
}: ParticleExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    if (activeRef.current) return;
    activeRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cx = (x / 100) * canvas.width;
    const cy = (y / 100) * canvas.height;

    particlesRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      const types: Particle['type'][] = ['circle', 'star', 'spark'];
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        maxLife: 40 + Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 6,
        type: types[Math.floor(Math.random() * types.length)],
      };
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particlesRef.current.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.vx *= 0.98;
        const alpha = 1 - p.life / p.maxLife;

        if (p.life < p.maxLife) {
          alive = true;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;

          if (p.type === 'circle') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'star') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.life * 0.2);
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
              const r = p.size * alpha;
              if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
              else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * 0.5 * alpha;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;

      if (alive) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        activeRef.current = false;
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      activeRef.current = false;
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 100 }}
    />
  );
}
