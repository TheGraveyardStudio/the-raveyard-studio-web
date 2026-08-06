// ==========================================================================
// THE GRAVEYARD STUDIO — Animated Graveyard Background
// Premium canvas-based atmospheric scene with crows, fog, wind & tombstones
// ==========================================================================

(function () {
    'use strict';

    // ── Canvas Setup ──────────────────────────────────────────────
    const canvas = document.createElement('canvas');
    canvas.id = 'graveyard-bg';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;pointer-events:none;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // ── Utility helpers ───────────────────────────────────────────
    const rand = (a, b) => Math.random() * (b - a) + a;
    const lerp = (a, b, t) => a + (b - a) * t;

    // ── Color palette ─────────────────────────────────────────────
    const PALETTE = {
        sky1: '#080911',
        sky2: '#0e0f1a',
        sky3: '#14142b',
        ground: '#0a0b12',
        tombstone: '#1a1c2e',
        tombstoneLight: '#252840',
        fog: 'rgba(90, 80, 120, 0.04)',
        moon: 'rgba(180, 170, 200, 0.12)',
        moonGlow: 'rgba(139, 92, 246, 0.06)',
    };

    // ── Moon ───────────────────────────────────────────────────────
    const moon = { x: 0, y: 0, r: 50 };
    function initMoon() {
        moon.x = W * 0.82;
        moon.y = H * 0.12;
        moon.r = Math.min(W, H) * 0.04;
    }

    function drawMoon() {
        // Outer glow
        const g1 = ctx.createRadialGradient(moon.x, moon.y, moon.r * 0.5, moon.x, moon.y, moon.r * 6);
        g1.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
        g1.addColorStop(0.5, 'rgba(100, 70, 160, 0.03)');
        g1.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.r * 6, 0, Math.PI * 2);
        ctx.fill();

        // Moon disc
        const g2 = ctx.createRadialGradient(moon.x - moon.r * 0.3, moon.y - moon.r * 0.3, 0, moon.x, moon.y, moon.r);
        g2.addColorStop(0, 'rgba(200, 190, 220, 0.25)');
        g2.addColorStop(1, 'rgba(140, 120, 180, 0.1)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // ── Stars ──────────────────────────────────────────────────────
    let stars = [];
    function initStars() {
        stars = [];
        const count = Math.floor(W * H / 8000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: rand(0, W),
                y: rand(0, H * 0.5),
                r: rand(0.3, 1.2),
                alpha: rand(0.1, 0.5),
                twinkleSpeed: rand(0.005, 0.02),
                twinkleOffset: rand(0, Math.PI * 2),
            });
        }
    }

    function drawStars(time) {
        for (const s of stars) {
            const alpha = s.alpha * (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset));
            ctx.fillStyle = `rgba(200, 195, 230, ${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ── Ground & Tombstones ───────────────────────────────────────
    let tombstones = [];
    const GROUND_Y_RATIO = 0.78;

    function groundY() { return H * GROUND_Y_RATIO; }

    function initTombstones() {
        tombstones = [];
        const count = Math.floor(W / 120);
        for (let i = 0; i < count; i++) {
            const x = rand(20, W - 20);
            const baseW = rand(22, 42);
            const baseH = rand(35, 70);
            const type = Math.random() < 0.3 ? 'cross' : 'rounded';
            const tilt = rand(-0.06, 0.06);
            const depth = rand(0, 1); // parallax depth
            tombstones.push({ x, baseW, baseH, type, tilt, depth });
        }
        // Sort by depth so farther ones draw first
        tombstones.sort((a, b) => a.depth - b.depth);
    }

    function drawTombstones(time) {
        const gy = groundY();
        for (const t of tombstones) {
            const scale = lerp(0.5, 1.1, t.depth);
            const yOff = lerp(-30, 10, t.depth);
            const w = t.baseW * scale;
            const h = t.baseH * scale;
            const x = t.x;
            const y = gy + yOff;
            const alpha = lerp(0.15, 0.5, t.depth);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(t.tilt);

            if (t.type === 'cross') {
                const armW = w * 0.18;
                const armSpan = w * 0.5;
                ctx.fillStyle = `rgba(28, 30, 52, ${alpha})`;
                // Vertical beam
                ctx.fillRect(-armW / 2, -h, armW, h);
                // Horizontal beam
                ctx.fillRect(-armSpan / 2, -h * 0.72, armSpan, armW);
            } else {
                ctx.fillStyle = `rgba(28, 30, 52, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(-w / 2, 0);
                ctx.lineTo(-w / 2, -h * 0.6);
                ctx.quadraticCurveTo(-w / 2, -h, 0, -h);
                ctx.quadraticCurveTo(w / 2, -h, w / 2, -h * 0.6);
                ctx.lineTo(w / 2, 0);
                ctx.closePath();
                ctx.fill();

                // Subtle crack / detail line
                ctx.strokeStyle = `rgba(50, 52, 80, ${alpha * 0.5})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(rand(-w * 0.2, w * 0.2), -h * 0.3);
                ctx.lineTo(rand(-w * 0.15, w * 0.15), -h * 0.6);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    function drawGround(time) {
        const gy = groundY();

        // Ground gradient
        const grad = ctx.createLinearGradient(0, gy - 30, 0, H);
        grad.addColorStop(0, '#0d0e1a');
        grad.addColorStop(0.3, '#0a0b14');
        grad.addColorStop(1, '#060710');
        ctx.fillStyle = grad;
        ctx.fillRect(0, gy - 5, W, H - gy + 5);

        // Bumpy grass silhouette
        ctx.fillStyle = '#0d0e1a';
        ctx.beginPath();
        ctx.moveTo(0, gy);
        for (let x = 0; x <= W; x += 3) {
            const grassH = Math.sin(x * 0.02 + time * 0.0008) * 4
                + Math.sin(x * 0.05 + time * 0.002) * 2
                + Math.sin(x * 0.1 + time * 0.003) * 1;
            ctx.lineTo(x, gy - 3 + grassH);
        }
        ctx.lineTo(W, gy + 20);
        ctx.lineTo(0, gy + 20);
        ctx.closePath();
        ctx.fill();
    }

    // ── Dead Trees ────────────────────────────────────────────────
    let trees = [];
    function initTrees() {
        trees = [];
        const count = Math.max(2, Math.floor(W / 400));
        for (let i = 0; i < count; i++) {
            trees.push({
                x: rand(50, W - 50),
                height: rand(120, 220),
                branches: Math.floor(rand(3, 6)),
                sway: rand(0.002, 0.005),
                phase: rand(0, Math.PI * 2),
            });
        }
    }

    function drawBranch(x, y, angle, length, thickness, depth) {
        if (depth <= 0 || length < 5) return;
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        ctx.strokeStyle = `rgba(20, 22, 38, ${0.3 + depth * 0.05})`;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        // Sub-branches
        if (depth > 1) {
            drawBranch(endX, endY, angle - rand(0.3, 0.7), length * rand(0.5, 0.75), thickness * 0.6, depth - 1);
            drawBranch(endX, endY, angle + rand(0.3, 0.7), length * rand(0.5, 0.75), thickness * 0.6, depth - 1);
        }
    }

    function drawTrees(time) {
        const gy = groundY();
        for (const t of trees) {
            const sway = Math.sin(time * t.sway + t.phase) * 0.03;
            ctx.save();
            ctx.translate(t.x, gy);
            ctx.rotate(sway);

            // Trunk
            ctx.strokeStyle = 'rgba(20, 22, 38, 0.45)';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(rand(-5, 5), -t.height * 0.5, 0, -t.height);
            ctx.stroke();

            // Branches from trunk
            for (let b = 0; b < t.branches; b++) {
                const branchY = -t.height * rand(0.3, 0.9);
                const angle = rand(-0.4, 0.4) + (b % 2 === 0 ? -1.2 : 1.2);
                drawBranch(0, branchY, angle, rand(30, 60), 2.5, 3);
            }

            ctx.restore();
        }
    }

    // ── Fog / Mist Particles ──────────────────────────────────────
    let fogParticles = [];
    function initFog() {
        fogParticles = [];
        const count = Math.floor(W / 40);
        for (let i = 0; i < count; i++) {
            fogParticles.push({
                x: rand(-200, W + 200),
                y: rand(groundY() - 80, groundY() + 40),
                r: rand(80, 200),
                alpha: rand(0.01, 0.04),
                speed: rand(0.15, 0.5),
                drift: rand(-0.1, 0.1),
            });
        }
    }

    function drawFog(time) {
        for (const f of fogParticles) {
            f.x += f.speed;
            f.y += Math.sin(time * 0.001 + f.x * 0.01) * f.drift;
            if (f.x - f.r > W + 100) f.x = -f.r - 100;

            const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
            g.addColorStop(0, `rgba(80, 70, 110, ${f.alpha})`);
            g.addColorStop(1, 'rgba(80, 70, 110, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ── Wind Streaks ──────────────────────────────────────────────
    let windStreaks = [];
    function initWind() {
        windStreaks = [];
        const count = Math.floor(W / 150);
        for (let i = 0; i < count; i++) {
            windStreaks.push({
                x: rand(0, W),
                y: rand(H * 0.3, groundY()),
                len: rand(40, 120),
                speed: rand(1.5, 4),
                alpha: rand(0.01, 0.03),
            });
        }
    }

    function drawWind(time) {
        for (const w of windStreaks) {
            w.x += w.speed;
            if (w.x > W + 50) {
                w.x = -w.len - 50;
                w.y = rand(H * 0.3, groundY());
            }
            ctx.strokeStyle = `rgba(150, 140, 180, ${w.alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(w.x, w.y);
            ctx.lineTo(w.x + w.len, w.y + Math.sin(time * 0.003 + w.x * 0.01) * 3);
            ctx.stroke();
        }
    }

    // ── Flying Crows ──────────────────────────────────────────────
    class FlyingCrow {
        constructor() {
            this.reset();
        }

        reset() {
            const fromLeft = Math.random() < 0.5;
            this.x = fromLeft ? rand(-100, -50) : rand(W + 50, W + 100);
            this.y = rand(H * 0.08, H * 0.5);
            this.vx = fromLeft ? rand(0.6, 1.8) : rand(-1.8, -0.6);
            this.vy = rand(-0.2, 0.2);
            this.size = rand(8, 16);
            this.wingPhase = rand(0, Math.PI * 2);
            this.wingSpeed = rand(0.06, 0.12);
            this.glideTimer = 0;
            this.isGliding = false;
            this.glideDuration = 0;
            this.soarAmplitude = rand(0.3, 1);
            this.soarFreq = rand(0.005, 0.015);
            this.alpha = rand(0.4, 0.8);
        }

        update(time) {
            this.x += this.vx;
            this.y += this.vy + Math.sin(time * this.soarFreq + this.x * 0.01) * this.soarAmplitude * 0.1;

            // Occasional glide
            this.glideTimer++;
            if (!this.isGliding && Math.random() < 0.002) {
                this.isGliding = true;
                this.glideDuration = rand(60, 150);
                this.glideTimer = 0;
            }
            if (this.isGliding && this.glideTimer > this.glideDuration) {
                this.isGliding = false;
            }

            if (!this.isGliding) {
                this.wingPhase += this.wingSpeed;
            }

            // Reset when off screen
            if (this.vx > 0 && this.x > W + 150) this.reset();
            if (this.vx < 0 && this.x < -150) this.reset();
        }

        draw(ctx) {
            const wingAngle = this.isGliding
                ? Math.sin(this.wingPhase) * 0.1 + 0.3
                : Math.sin(this.wingPhase) * 0.8;

            const s = this.size;
            const dir = this.vx > 0 ? 1 : -1;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(dir, 1);
            ctx.globalAlpha = this.alpha;

            // Body
            ctx.fillStyle = '#0a0b14';
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.5, s * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.beginPath();
            ctx.arc(s * 0.4, -s * 0.05, s * 0.14, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.beginPath();
            ctx.moveTo(s * 0.52, -s * 0.04);
            ctx.lineTo(s * 0.68, 0);
            ctx.lineTo(s * 0.52, s * 0.03);
            ctx.closePath();
            ctx.fill();

            // Wings
            ctx.fillStyle = '#0a0b14';
            // Left wing (top)
            ctx.save();
            ctx.translate(-s * 0.05, -s * 0.1);
            ctx.rotate(-wingAngle * 0.9);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-s * 0.3, -s * 0.6, -s * 0.8, -s * 0.2 * (1 + wingAngle * 0.3));
            ctx.quadraticCurveTo(-s * 0.5, -s * 0.05, 0, 0);
            ctx.fill();
            ctx.restore();

            // Right wing (bottom)
            ctx.save();
            ctx.translate(-s * 0.05, s * 0.1);
            ctx.rotate(wingAngle * 0.9);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-s * 0.3, s * 0.6, -s * 0.8, s * 0.2 * (1 + wingAngle * 0.3));
            ctx.quadraticCurveTo(-s * 0.5, s * 0.05, 0, 0);
            ctx.fill();
            ctx.restore();

            // Tail feathers
            ctx.beginPath();
            ctx.moveTo(-s * 0.45, 0);
            ctx.lineTo(-s * 0.7, -s * 0.08);
            ctx.lineTo(-s * 0.65, 0);
            ctx.lineTo(-s * 0.7, s * 0.08);
            ctx.closePath();
            ctx.fill();

            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    // ── Grounded (Pecking) Crows ──────────────────────────────────
    class GroundCrow {
        constructor(tombstone) {
            this.tombstone = tombstone;
            const gy = groundY();
            this.x = tombstone.x + rand(-30, 30);
            this.y = gy + lerp(-25, 5, tombstone.depth);
            this.size = rand(7, 12) * lerp(0.5, 1, tombstone.depth);
            this.alpha = lerp(0.2, 0.6, tombstone.depth);
            this.dir = Math.random() < 0.5 ? 1 : -1;
            this.peckPhase = rand(0, Math.PI * 2);
            this.peckSpeed = rand(0.03, 0.06);
            this.idleTimer = 0;
            this.isPecking = true;
            this.peckCycles = 0;
            this.headBob = 0;
        }

        update(time) {
            this.idleTimer++;

            if (this.isPecking) {
                this.peckPhase += this.peckSpeed;
                this.headBob = Math.abs(Math.sin(this.peckPhase)) * 0.4;

                if (this.peckPhase > this.peckCycles * Math.PI * 2 + Math.PI * 6) {
                    this.isPecking = false;
                    this.idleTimer = 0;
                    this.headBob = 0;
                }
            } else {
                // Idle - look around
                this.headBob = Math.sin(time * 0.002 + this.x) * 0.05;

                if (this.idleTimer > rand(120, 300)) {
                    this.isPecking = true;
                    this.peckCycles++;
                    this.peckPhase = this.peckCycles * Math.PI * 2;

                    // Occasionally flip direction
                    if (Math.random() < 0.3) this.dir *= -1;
                }
            }
        }

        draw(ctx) {
            const s = this.size;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.dir, 1);
            ctx.globalAlpha = this.alpha;

            const peckDip = this.isPecking ? this.headBob * s * 0.5 : 0;

            // Legs
            ctx.strokeStyle = '#1a1c2e';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-s * 0.1, 0);
            ctx.lineTo(-s * 0.15, s * 0.3);
            ctx.moveTo(s * 0.05, 0);
            ctx.lineTo(s * 0.1, s * 0.3);
            ctx.stroke();

            // Body
            ctx.fillStyle = '#0a0b14';
            ctx.beginPath();
            ctx.ellipse(0, -s * 0.1, s * 0.35, s * 0.2, 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Tail
            ctx.beginPath();
            ctx.moveTo(-s * 0.3, -s * 0.1);
            ctx.lineTo(-s * 0.55, -s * 0.2);
            ctx.lineTo(-s * 0.5, -s * 0.05);
            ctx.closePath();
            ctx.fill();

            // Head (dips when pecking)
            const headX = s * 0.3;
            const headY = -s * 0.2 + peckDip;
            ctx.beginPath();
            ctx.arc(headX, headY, s * 0.14, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.beginPath();
            ctx.moveTo(headX + s * 0.12, headY - s * 0.02);
            ctx.lineTo(headX + s * 0.25, headY + s * 0.02 + peckDip * 0.3);
            ctx.lineTo(headX + s * 0.12, headY + s * 0.04);
            ctx.closePath();
            ctx.fill();

            // Eye
            ctx.fillStyle = 'rgba(100, 90, 130, 0.6)';
            ctx.beginPath();
            ctx.arc(headX + s * 0.04, headY - s * 0.02, s * 0.025, 0, Math.PI * 2);
            ctx.fill();

            // Folded wing detail
            ctx.strokeStyle = 'rgba(30, 32, 55, 0.4)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(s * 0.1, -s * 0.2);
            ctx.quadraticCurveTo(-s * 0.1, -s * 0.3, -s * 0.25, -s * 0.15);
            ctx.stroke();

            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    // ── Falling Leaves (wind debris) ──────────────────────────────
    let leaves = [];
    function initLeaves() {
        leaves = [];
        const count = Math.floor(W / 200);
        for (let i = 0; i < count; i++) {
            leaves.push({
                x: rand(0, W),
                y: rand(0, H),
                size: rand(1.5, 3),
                speed: rand(0.5, 1.5),
                drift: rand(0.5, 2),
                wobble: rand(0.01, 0.03),
                phase: rand(0, Math.PI * 2),
                alpha: rand(0.1, 0.25),
                rotation: rand(0, Math.PI * 2),
                rotSpeed: rand(0.02, 0.05),
            });
        }
    }

    function drawLeaves(time) {
        for (const l of leaves) {
            l.x += l.drift;
            l.y += Math.sin(time * l.wobble + l.phase) * 0.5 + l.speed * 0.2;
            l.rotation += l.rotSpeed;

            if (l.x > W + 20) { l.x = -10; l.y = rand(0, H); }
            if (l.y > H + 20) { l.y = -10; l.x = rand(0, W); }

            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.rotation);
            ctx.fillStyle = `rgba(40, 35, 55, ${l.alpha})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, l.size, l.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ── Initialize all elements ───────────────────────────────────
    let flyingCrows = [];
    let groundCrows = [];

    function init() {
        initMoon();
        initStars();
        initTombstones();
        initTrees();
        initFog();
        initWind();
        initLeaves();

        // Flying crows — not too many (4-7)
        flyingCrows = [];
        const flyCount = Math.max(4, Math.min(7, Math.floor(W / 250)));
        for (let i = 0; i < flyCount; i++) {
            const crow = new FlyingCrow();
            crow.x = rand(0, W); // Start spread across screen
            flyingCrows.push(crow);
        }

        // Ground crows — pick a few tombstones
        groundCrows = [];
        const eligible = tombstones.filter(t => t.depth > 0.4 && t.type === 'rounded');
        const groundCount = Math.min(3, eligible.length);
        for (let i = 0; i < groundCount; i++) {
            groundCrows.push(new GroundCrow(eligible[i]));
        }
    }

    init();
    window.addEventListener('resize', () => { resize(); init(); });

    // ── Sky gradient ──────────────────────────────────────────────
    function drawSky() {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#050610');
        grad.addColorStop(0.4, '#0a0c1a');
        grad.addColorStop(0.7, '#0e1020');
        grad.addColorStop(1, '#0a0b14');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    // ── Main animation loop ───────────────────────────────────────
    function frame(time) {
        ctx.clearRect(0, 0, W, H);

        drawSky();
        drawStars(time);
        drawMoon();
        drawWind(time);
        drawTrees(time);
        drawTombstones(time);
        drawGround(time);
        drawFog(time);
        drawLeaves(time);

        // Flying crows
        for (const crow of flyingCrows) {
            crow.update(time);
            crow.draw(ctx);
        }

        // Ground crows
        for (const crow of groundCrows) {
            crow.update(time);
            crow.draw(ctx);
        }

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();
