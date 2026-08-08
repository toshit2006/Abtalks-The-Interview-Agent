import { useEffect, useRef } from "react";

export function LiveBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes for floating neural mesh
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1,
      color:
        Math.random() > 0.5
          ? "rgba(56, 189, 248, " // cyan
          : Math.random() > 0.5
            ? "rgba(168, 85, 247, " // violet
            : "rgba(99, 102, 241, ", // indigo
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Move & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "0.65)";
        ctx.fill();

        // Connect nearby particles with glowing light beams
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]!;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Animated Floating Light Orbs (Claude/Vercel AI style) */}
      <div className="absolute top-[-10%] left-[10%] size-[550px] rounded-full bg-gradient-to-br from-indigo-600/35 via-cyan-500/25 to-purple-600/35 blur-[120px] animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[10%] size-[600px] rounded-full bg-gradient-to-br from-purple-600/30 via-pink-500/25 to-indigo-600/30 blur-[140px] animate-float-reverse" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 size-[450px] rounded-full bg-cyan-500/20 blur-[130px] animate-pulse-slow" />

      {/* Neural Particle Beams Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-70" />
    </div>
  );
}
