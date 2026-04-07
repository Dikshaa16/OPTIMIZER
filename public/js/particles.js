/* ═════════════════════════════════════════════════════════════
   3D PARTICLE BACKGROUND — WebGL Canvas Animation
   ═════════════════════════════════════════════════════════════ */

const ParticleBackground = {
    canvas: null,
    ctx: null,
    particles: [],
    particleCount: 150,
    animationId: null,

    init() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return; // fallback to existing background
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }

        this.animate();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createParticle() {
        const colors = ['#00f5ff', '#bf00ff', '#ff006e', '#00ff88'];
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            z: Math.random() * 1000,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            vz: Math.random() * 3 + 2,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            color: colors[Math.floor(Math.random() * 4)]
        };
    },

    animate() {
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach((p, idx) => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.z -= p.vz;

            // Reset if out of bounds
            if (p.z <= 0) {
                this.particles[idx] = this.createParticle();
                p = this.particles[idx];
            }
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Perspective projection
            const scale = 1000 / (p.z + 1000);
            const projX = (p.x - this.canvas.width / 2) * scale + this.canvas.width / 2;
            const projY = (p.y - this.canvas.height / 2) * scale + this.canvas.height / 2;
            const projSize = p.size * scale;

            // Draw particle with glow
            const gradient = this.ctx.createRadialGradient(projX, projY, 0, projX, projY, projSize * 2);
            gradient.addColorStop(0, p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, p.color + '00');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(projX, projY, projSize * 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw particle core
            this.ctx.fillStyle = p.color + Math.floor(p.opacity * 200).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Connection lines to nearby particles
            if (idx % 3 === 0) {
                for (let j = idx + 1; j < this.particles.length; j += 3) {
                    const p2 = this.particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 150) {
                        const scale2 = 1000 / (p2.z + 1000);
                        const projX2 = (p2.x - this.canvas.width / 2) * scale2 + this.canvas.width / 2;
                        const projY2 = (p2.y - this.canvas.height / 2) * scale2 + this.canvas.height / 2;

                        const lineColor = '#00f5ff';
                        this.ctx.strokeStyle = lineColor + Math.floor((1 - dist / 150) * 50).toString(16).padStart(2, '0');
                        this.ctx.lineWidth = 0.5;
                        this.ctx.beginPath();
                        this.ctx.moveTo(projX, projY);
                        this.ctx.lineTo(projX2, projY2);
                        this.ctx.stroke();
                    }
                }
            }
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
};

// Initialize on document ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ParticleBackground.init(), 100);
});
