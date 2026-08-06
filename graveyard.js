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
        moon.x = W * 0.8;
        moon.y = H * 0.13;
        moon.r = Math.min(W, H) * 0.07;
    }

    function drawMoon(time) {
        const mx = moon.x;
        const my = moon.y;
        const mr = moon.r;

        // Layer 1: Huge atmospheric sky lighting (moonlight casting across entire night sky)
        const skyGlow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, Math.max(W, H) * 0.95);
        skyGlow.addColorStop(0, 'rgba(215, 225, 245, 0.28)');
        skyGlow.addColorStop(0.25, 'rgba(165, 185, 215, 0.16)');
        skyGlow.addColorStop(0.55, 'rgba(110, 130, 165, 0.07)');
        skyGlow.addColorStop(0.85, 'rgba(60, 75, 105, 0.02)');
        skyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = skyGlow;
        ctx.fillRect(0, 0, W, H);

        // Layer 2: Volumetric Moonlight Light Rays / Shafts
        ctx.save();
        for (let i = 0; i < 5; i++) {
            const angle = (i - 2) * 0.18 + Math.sin(time * 0.0005 + i) * 0.02;
            const rayWidth = mr * (2.2 + i * 0.5);
            const rayGrad = ctx.createLinearGradient(mx, my, mx + Math.sin(angle) * H, my + Math.cos(angle) * H);
            rayGrad.addColorStop(0, 'rgba(225, 235, 255, 0.12)');
            rayGrad.addColorStop(0.4, 'rgba(185, 200, 230, 0.05)');
            rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx - rayWidth + Math.sin(angle) * H, H);
            ctx.lineTo(mx + rayWidth + Math.sin(angle) * H, H);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Layer 3: Medium intense halo glow
        const haloGlow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 4.5);
        haloGlow.addColorStop(0, 'rgba(235, 240, 255, 0.45)');
        haloGlow.addColorStop(0.3, 'rgba(195, 210, 235, 0.22)');
        haloGlow.addColorStop(0.7, 'rgba(145, 165, 195, 0.08)');
        haloGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGlow;
        ctx.beginPath();
        ctx.arc(mx, my, mr * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Layer 4: Tight bright corona
        const corona = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 1.8);
        corona.addColorStop(0, 'rgba(250, 252, 255, 0.7)');
        corona.addColorStop(0.5, 'rgba(220, 230, 250, 0.3)');
        corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(mx, my, mr * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Moon disc base — bright silvery full moon
        const discGrad = ctx.createRadialGradient(mx - mr * 0.25, my - mr * 0.2, mr * 0.05, mx, my, mr);
        discGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        discGrad.addColorStop(0.4, 'rgba(235, 240, 248, 0.92)');
        discGrad.addColorStop(0.75, 'rgba(205, 215, 230, 0.85)');
        discGrad.addColorStop(1, 'rgba(170, 185, 205, 0.75)');
        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();

        // Crater details (subtle grayish texture)
        const craters = [
            { cx: -0.2, cy: 0.15, cr: 0.18, a: 0.09 },
            { cx: 0.25, cy: -0.1, cr: 0.12, a: 0.07 },
            { cx: -0.05, cy: -0.3, cr: 0.1, a: 0.06 },
            { cx: 0.3, cy: 0.25, cr: 0.15, a: 0.08 },
            { cx: -0.35, cy: -0.1, cr: 0.08, a: 0.05 },
            { cx: 0.1, cy: 0.35, cr: 0.09, a: 0.06 },
        ];
        for (const c of craters) {
            const cGrad = ctx.createRadialGradient(
                mx + c.cx * mr, my + c.cy * mr, 0,
                mx + c.cx * mr, my + c.cy * mr, c.cr * mr
            );
            cGrad.addColorStop(0, `rgba(130, 140, 160, ${c.a})`);
            cGrad.addColorStop(1, 'rgba(130, 140, 160, 0)');
            ctx.fillStyle = cGrad;
            ctx.beginPath();
            ctx.arc(mx + c.cx * mr, my + c.cy * mr, c.cr * mr, 0, Math.PI * 2);
            ctx.fill();
        }

        // Crisp rim light highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mx, my, mr - 0.5, 0, Math.PI * 2);
        ctx.stroke();
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
                alpha: rand(0.2, 0.7),
                twinkleSpeed: rand(0.005, 0.02),
                twinkleOffset: rand(0, Math.PI * 2),
            });
        }
    }

    function drawStars(time) {
        for (const s of stars) {
            const alpha = s.alpha * (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset));
            ctx.fillStyle = `rgba(210, 205, 240, ${alpha})`;
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
        const minSpacing = 115; // Clean spacing between tombstones
        const margin = 120; // Keep clear of entrance gate pillars
        const usableWidth = W - margin * 2;
        const numSlots = Math.max(4, Math.floor(usableWidth / minSpacing));

        for (let i = 0; i < numSlots; i++) {
            const slotX = margin + (i + 0.5) * (usableWidth / numSlots);
            const x = slotX + rand(-15, 15);
            const baseW = rand(32, 48);
            const baseH = rand(50, 85);
            const type = i % 3 === 0 ? 'cross' : (i % 3 === 1 ? 'rounded' : 'stepped');
            const tilt = rand(-0.04, 0.04);
            const depth = rand(0.3, 1);
            tombstones.push({ x, baseW, baseH, type, tilt, depth });
        }
        tombstones.sort((a, b) => a.depth - b.depth);
    }

    function drawTombstones(time) {
        const gy = groundY();
        for (const t of tombstones) {
            const scale = lerp(0.65, 1.2, t.depth);
            const yOff = lerp(-25, 12, t.depth);
            const w = t.baseW * scale;
            const h = t.baseH * scale;
            const x = t.x;
            const y = gy + yOff;
            const alpha = lerp(0.6, 0.98, t.depth);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(t.tilt);
            ctx.globalAlpha = alpha;

            // 3D Shadow/Depth offset
            ctx.fillStyle = 'rgba(10, 12, 20, 0.6)';
            ctx.fillRect(-w / 2 + 4, -h + 4, w, h);

            // Main Stone Body Gradient (Moonlit Slate/Granite)
            const stoneGrad = ctx.createLinearGradient(-w / 2, -h, w / 2, 0);
            stoneGrad.addColorStop(0, '#424d66');
            stoneGrad.addColorStop(0.35, '#333b50');
            stoneGrad.addColorStop(1, '#1e2434');

            if (t.type === 'cross') {
                const armW = w * 0.22;
                const armSpan = w * 0.6;
                ctx.fillStyle = stoneGrad;

                // Vertical beam
                ctx.fillRect(-armW / 2, -h, armW, h);
                // Horizontal beam
                ctx.fillRect(-armSpan / 2, -h * 0.7, armSpan, armW);

                // Moonlit rim highlight (top & left edges)
                ctx.strokeStyle = 'rgba(215, 230, 255, 0.75)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                // Vertical top & left
                ctx.moveTo(-armW / 2, 0);
                ctx.lineTo(-armW / 2, -h);
                ctx.lineTo(armW / 2, -h);
                // Horizontal cross highlights
                ctx.moveTo(-armSpan / 2, -h * 0.7);
                ctx.lineTo(-armSpan / 2, -h * 0.7 + armW);
                ctx.lineTo(armSpan / 2, -h * 0.7);
                ctx.stroke();
            } else if (t.type === 'stepped') {
                ctx.fillStyle = stoneGrad;
                // Base step
                ctx.fillRect(-w * 0.55, -h * 0.2, w * 1.1, h * 0.2);
                // Pillar body
                ctx.fillRect(-w * 0.4, -h, w * 0.8, h * 0.8);

                // Top rim highlight
                ctx.strokeStyle = 'rgba(215, 230, 255, 0.75)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-w * 0.4, -h, w * 0.8, 2);

                // RIP Engraving
                ctx.fillStyle = 'rgba(15, 18, 28, 0.8)';
                ctx.font = `bold ${Math.max(9, Math.floor(w * 0.22))}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('R.I.P', 0, -h * 0.55);
            } else { // rounded
                ctx.fillStyle = stoneGrad;
                ctx.beginPath();
                ctx.moveTo(-w / 2, 0);
                ctx.lineTo(-w / 2, -h * 0.62);
                ctx.quadraticCurveTo(-w / 2, -h, 0, -h);
                ctx.quadraticCurveTo(w / 2, -h, w / 2, -h * 0.62);
                ctx.lineTo(w / 2, 0);
                ctx.closePath();
                ctx.fill();

                // Moonlit rim highlight along left and top arch
                ctx.strokeStyle = 'rgba(215, 230, 255, 0.8)';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-w / 2, 0);
                ctx.lineTo(-w / 2, -h * 0.62);
                ctx.quadraticCurveTo(-w / 2, -h, 0, -h);
                ctx.stroke();

                // Cross engraving
                ctx.fillStyle = 'rgba(15, 18, 28, 0.75)';
                const cW = w * 0.12;
                const cH = h * 0.25;
                ctx.fillRect(-cW / 2, -h * 0.72, cW, cH);
                ctx.fillRect(-cH * 0.35, -h * 0.66, cH * 0.7, cW);

                // Detail Crack
                ctx.strokeStyle = 'rgba(15, 18, 28, 0.8)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-w * 0.15, -h * 0.4);
                ctx.lineTo(-w * 0.05, -h * 0.25);
                ctx.lineTo(-w * 0.1, -h * 0.1);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    function drawGround(time) {
        const gy = groundY();

        // Natural Earthy Soil Ground Gradient (Rich dark dirt/soil, zero purple)
        const grad = ctx.createLinearGradient(0, gy - 20, 0, H);
        grad.addColorStop(0, '#1b1713');
        grad.addColorStop(0.25, '#14100c');
        grad.addColorStop(0.6, '#0d0a08');
        grad.addColorStop(1, '#060504');
        ctx.fillStyle = grad;
        ctx.fillRect(0, gy - 5, W, H - gy + 5);

        // Natural earthy soil mounds & bumpy grass edge
        ctx.fillStyle = '#1b1713';
        ctx.beginPath();
        ctx.moveTo(0, gy);
        for (let x = 0; x <= W; x += 4) {
            const soilBump = Math.sin(x * 0.015 + time * 0.0003) * 5
                + Math.sin(x * 0.04 + time * 0.001) * 2.5;
            ctx.lineTo(x, gy - 4 + soilBump);
        }
        ctx.lineTo(W, gy + 30);
        ctx.lineTo(0, gy + 30);
        ctx.closePath();
        ctx.fill();

        // Subtle moonlit rim highlight on ground edge
        ctx.strokeStyle = 'rgba(180, 200, 230, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, gy - 2);
        for (let x = 0; x <= W; x += 20) {
            ctx.lineTo(x, gy - 2 + Math.sin(x * 0.02) * 2);
        }
        ctx.stroke();
    }

    // ── Slow Swaying Thin Woody Twig Bushes (İnce Odunsu Çalılar) ──
    let bushes = [];
    function initBushes() {
        bushes = [];
        const count = Math.max(8, Math.floor(W / 110));
        for (let i = 0; i < count; i++) {
            const twigs = [];
            const twigCount = Math.floor(rand(5, 9));
            for (let t = 0; t < twigCount; t++) {
                twigs.push({
                    angle: rand(-0.6, 0.6),
                    length: rand(30, 65),
                    subAngle: rand(-0.4, 0.4),
                    subLength: rand(15, 30),
                });
            }
            bushes.push({
                x: rand(30, W - 30),
                twigs: twigs,
                phase: rand(0, Math.PI * 2),
            });
        }
    }

    function drawBushes(time) {
        const gy = groundY();
        for (const b of bushes) {
            // Extremely slow, smooth pendulum sway back and forth to left & right (8-10 sec cycle)
            const sway = Math.sin(time * 0.00018 + b.phase) * 0.045;
            ctx.save();
            ctx.translate(b.x, gy + 2);
            ctx.rotate(sway);

            ctx.strokeStyle = '#1d2332';
            ctx.lineCap = 'round';

            // Draw thin woody branches (brambles/twigs)
            for (const tw of b.twigs) {
                const endX = Math.sin(tw.angle) * tw.length;
                const endY = -Math.cos(tw.angle) * tw.length;

                // Main twig stem
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                // Moonlit highlight on twig
                ctx.strokeStyle = 'rgba(180, 205, 235, 0.35)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(endX * 0.9, endY * 0.9);
                ctx.stroke();
                ctx.strokeStyle = '#1d2332';

                // Sub-twig branch
                const subX = endX + Math.sin(tw.angle + tw.subAngle) * tw.subLength;
                const subY = endY - Math.cos(tw.angle + tw.subAngle) * tw.subLength;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(endX * 0.6, endY * 0.6);
                ctx.lineTo(subX, subY);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // ── 3D Graveyard Entrance Pillars & Wrought Iron Gate ──────────
    function drawEntrancePillars(time) {
        const gy = groundY();
        const pillarWidth = Math.min(65, W * 0.06);
        const pillarHeight = Math.min(260, H * 0.42);

        const leftX = W * 0.04;
        const rightX = W * 0.96;

        const drawPillar = (x, isLeft) => {
            ctx.save();
            ctx.translate(x, gy + 15);

            // Pillar 3D Base & Body (Moonlit Gothic Stone)
            const pGrad = ctx.createLinearGradient(-pillarWidth / 2, -pillarHeight, pillarWidth / 2, 0);
            pGrad.addColorStop(0, '#505b73');
            pGrad.addColorStop(0.3, '#3a4356');
            pGrad.addColorStop(0.8, '#242a38');
            pGrad.addColorStop(1, '#171a24');

            ctx.fillStyle = pGrad;

            // Main Stone Column
            ctx.fillRect(-pillarWidth / 2, -pillarHeight, pillarWidth, pillarHeight);

            // Pillar Capital / Cap (Top overhang stone)
            const capW = pillarWidth * 1.35;
            const capH = 18;
            ctx.fillRect(-capW / 2, -pillarHeight - capH, capW, capH);

            // Pillar Base Step
            const baseW = pillarWidth * 1.25;
            const baseH = 22;
            ctx.fillRect(-baseW / 2, -baseH, baseW, baseH);

            // Wrought Iron Spikes on top cap
            ctx.strokeStyle = '#181b26';
            ctx.lineWidth = 3;
            for (let i = -2; i <= 2; i++) {
                const sX = i * (capW / 6);
                ctx.beginPath();
                ctx.moveTo(sX, -pillarHeight - capH);
                ctx.lineTo(sX, -pillarHeight - capH - 24);
                ctx.lineTo(sX + (i < 0 ? -3 : 3), -pillarHeight - capH - 32);
                ctx.stroke();
            }

            // Moonlit Rim Highlights on Stone Edges
            ctx.strokeStyle = 'rgba(230, 240, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Top Cap Left & Top Line
            ctx.moveTo(-capW / 2, -pillarHeight - capH);
            ctx.lineTo(-capW / 2, -pillarHeight - capH);
            ctx.lineTo(capW / 2, -pillarHeight - capH);
            // Column Left Edge
            ctx.moveTo(-pillarWidth / 2, -pillarHeight);
            ctx.lineTo(-pillarWidth / 2, 0);
            ctx.stroke();

            // Gothic Iron Gate bars extending inward
            ctx.strokeStyle = 'rgba(25, 29, 42, 0.85)';
            ctx.lineWidth = 4;
            const dir = isLeft ? 1 : -1;
            for (let g = 0; g < 4; g++) {
                const gY = -pillarHeight * (0.2 + g * 0.2);
                ctx.beginPath();
                ctx.moveTo(0, gY);
                ctx.lineTo(dir * (pillarWidth * 1.8), gY);
                ctx.stroke();
            }

            // Soft glowing lantern on pillar cap
            const lanternY = -pillarHeight - capH - 12;
            const lanternGlow = ctx.createRadialGradient(0, lanternY, 2, 0, lanternY, 35);
            lanternGlow.addColorStop(0, 'rgba(255, 210, 140, 0.65)');
            lanternGlow.addColorStop(0.4, 'rgba(240, 180, 100, 0.2)');
            lanternGlow.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = lanternGlow;
            ctx.beginPath();
            ctx.arc(0, lanternY, 35, 0, Math.PI * 2);
            ctx.fill();

            // Lantern Glass Fixture
            ctx.fillStyle = '#ffe0aa';
            ctx.beginPath();
            ctx.arc(0, lanternY, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        drawPillar(leftX, true);
        drawPillar(rightX, false);
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
                alpha: rand(0.025, 0.07),
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
            g.addColorStop(0, `rgba(90, 80, 130, ${f.alpha})`);
            g.addColorStop(1, 'rgba(90, 80, 130, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // ── Soft Wind Streaks ──────────────────────────────────────────
    let windStreaks = [];
    function initWind() {
        windStreaks = [];
        const count = Math.floor(W / 180);
        for (let i = 0; i < count; i++) {
            windStreaks.push({
                x: rand(0, W),
                y: rand(H * 0.25, groundY()),
                len: rand(60, 160),
                speed: rand(0.7, 1.6),
                alpha: rand(0.008, 0.016),
            });
        }
    }

    function drawWind(time) {
        for (const w of windStreaks) {
            w.x += w.speed;
            if (w.x > W + 80) {
                w.x = -w.len - 80;
                w.y = rand(H * 0.25, groundY());
            }
            ctx.strokeStyle = `rgba(180, 200, 230, ${w.alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(w.x, w.y);
            ctx.quadraticCurveTo(
                w.x + w.len * 0.5,
                w.y + Math.sin(time * 0.0008 + w.x * 0.004) * 2.5,
                w.x + w.len,
                w.y
            );
            ctx.stroke();
        }
    }

    // ── Flying & Perching Crows ───────────────────────────────────
    class FlyingCrow {
        constructor() {
            this.reset();
        }

        reset() {
            const fromLeft = Math.random() < 0.5;
            this.x = fromLeft ? rand(-100, -50) : rand(W + 50, W + 100);
            this.y = rand(H * 0.08, H * 0.38);
            this.vx = fromLeft ? rand(0.8, 1.8) : rand(-1.8, -0.8);
            this.vy = rand(-0.15, 0.15);
            this.size = rand(9, 15);
            this.wingPhase = rand(0, Math.PI * 2);
            this.wingSpeed = rand(0.07, 0.13);
            this.glideTimer = 0;
            this.isGliding = false;
            this.glideDuration = 0;
            this.soarAmplitude = rand(0.3, 1);
            this.soarFreq = rand(0.005, 0.015);
            this.alpha = rand(0.65, 0.95);

            // Perch state machine
            this.state = 'FLYING'; // 'FLYING', 'LANDING', 'PERCHED', 'TAKING_OFF'
            this.targetTombstone = null;
            this.perchTimer = 0;
            this.perchDuration = 0;
            this.perchDir = 1;
            this.headTurnTimer = 0;
            this.willPerch = Math.random() < 0.7; // 70% chance to perch
        }

        update(time) {
            if (this.state === 'FLYING') {
                this.x += this.vx;
                this.y += this.vy + Math.sin(time * this.soarFreq + this.x * 0.01) * this.soarAmplitude * 0.1;

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

                // Check if approaching an un-occupied tombstone to land
                if (this.willPerch && !this.targetTombstone && tombstones.length > 0) {
                    const gy = groundY();
                    for (const t of tombstones) {
                        const scale = lerp(0.65, 1.2, t.depth);
                        const tombTopY = gy + lerp(-25, 12, t.depth) - (t.baseH * scale);
                        const dx = t.x - this.x;
                        const dy = tombTopY - this.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 190 && !t.isOccupiedByCrow && ((this.vx > 0 && dx > 0) || (this.vx < 0 && dx < 0))) {
                            this.targetTombstone = t;
                            t.isOccupiedByCrow = true;
                            this.state = 'LANDING';
                            break;
                        }
                    }
                }

                if (this.vx > 0 && this.x > W + 150) this.reset();
                if (this.vx < 0 && this.x < -150) this.reset();

            } else if (this.state === 'LANDING') {
                const gy = groundY();
                const scale = lerp(0.65, 1.2, this.targetTombstone.depth);
                const targetX = this.targetTombstone.x;
                const targetY = gy + lerp(-25, 12, this.targetTombstone.depth) - (this.targetTombstone.baseH * scale) - 2;

                const dx = targetX - this.x;
                const dy = targetY - this.y;

                this.x += dx * 0.06;
                this.y += dy * 0.06;
                this.wingPhase += this.wingSpeed * 1.5; // Rapid flapping when landing

                if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                    this.x = targetX;
                    this.y = targetY;
                    this.state = 'PERCHED';
                    this.perchTimer = 0;
                    this.perchDuration = rand(180, 420); // Perch for 3 to 7 seconds
                    this.perchDir = Math.random() < 0.5 ? 1 : -1;
                }

            } else if (this.state === 'PERCHED') {
                this.perchTimer++;
                this.headTurnTimer++;
                if (this.headTurnTimer > rand(50, 130)) {
                    this.perchDir *= -1;
                    this.headTurnTimer = 0;
                }

                // Ready to take off!
                if (this.perchTimer > this.perchDuration) {
                    this.state = 'TAKING_OFF';
                    if (this.targetTombstone) {
                        this.targetTombstone.isOccupiedByCrow = false;
                        this.targetTombstone = null;
                    }
                    this.vx = (Math.random() < 0.5 ? 1 : -1) * rand(1.2, 2.2);
                    this.vy = -rand(1.5, 2.5); // Fly upwards
                }

            } else if (this.state === 'TAKING_OFF') {
                this.x += this.vx;
                this.y += this.vy;
                this.wingPhase += this.wingSpeed * 1.8; // Fast wing flaps

                if (this.y < H * 0.35) {
                    this.state = 'FLYING';
                    this.willPerch = Math.random() < 0.5;
                    this.vy = rand(-0.15, 0.15);
                }
            }
        }

        draw(ctx) {
            const s = this.size;

            if (this.state === 'PERCHED') {
                // Perched Crow Silhouette on tombstone top
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.scale(this.perchDir, 1);
                ctx.globalAlpha = this.alpha;

                // Body
                ctx.fillStyle = '#090b14';
                ctx.beginPath();
                ctx.ellipse(0, -s * 0.3, s * 0.35, s * 0.22, -0.2, 0, Math.PI * 2);
                ctx.fill();

                // Tail
                ctx.beginPath();
                ctx.moveTo(-s * 0.25, -s * 0.15);
                ctx.lineTo(-s * 0.5, 0);
                ctx.lineTo(-s * 0.45, -s * 0.2);
                ctx.closePath();
                ctx.fill();

                // Head
                ctx.beginPath();
                ctx.arc(s * 0.3, -s * 0.45, s * 0.15, 0, Math.PI * 2);
                ctx.fill();

                // Beak
                ctx.beginPath();
                ctx.moveTo(s * 0.42, -s * 0.47);
                ctx.lineTo(s * 0.6, -s * 0.42);
                ctx.lineTo(s * 0.42, -s * 0.38);
                ctx.closePath();
                ctx.fill();

                // Folded wing outline
                ctx.strokeStyle = 'rgba(40, 45, 65, 0.6)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.arc(-s * 0.05, -s * 0.3, s * 0.22, 0.5, Math.PI * 1.5);
                ctx.stroke();

                ctx.restore();
                return;
            }

            // Normal Flying / Landing / Taking Off Crow
            const wingAngle = this.isGliding
                ? Math.sin(this.wingPhase) * 0.1 + 0.3
                : Math.sin(this.wingPhase) * 0.8;

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
            this.alpha = lerp(0.35, 0.8, tombstone.depth);
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
                alpha: rand(0.15, 0.35),
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

    // ── Mysterious Walking Silhouettes ────────────────────────────
    class WalkingSilhouette {
        constructor(x, speed, scale, hasLantern) {
            this.x = x;
            this.speed = speed; // positive = left to right, negative = right to left
            this.scale = scale;
            this.hasLantern = hasLantern;
            this.walkCycle = rand(0, Math.PI * 2);
        }

        update() {
            this.x += this.speed;
            this.walkCycle += 0.04;
            if (this.speed > 0 && this.x > W + 80) this.x = -80;
            if (this.speed < 0 && this.x < -80) this.x = W + 80;
        }

        draw(ctx) {
            const gy = groundY();
            const y = gy + lerp(-12, 18, this.scale);
            const height = 75 * this.scale;
            const dir = this.speed > 0 ? 1 : -1;
            const legAngle = Math.sin(this.walkCycle) * 0.35;
            const armAngle = Math.cos(this.walkCycle) * 0.28;

            ctx.save();
            ctx.translate(this.x, y);
            ctx.scale(dir, 1);
            ctx.globalAlpha = lerp(0.65, 0.95, this.scale);

            // Dark hooded silhouette fill
            ctx.fillStyle = '#090b14';
            ctx.strokeStyle = '#090b14';

            // Walking Legs
            ctx.lineWidth = 4 * this.scale;
            ctx.lineCap = 'round';

            // Back Leg
            ctx.beginPath();
            ctx.moveTo(0, -height * 0.35);
            ctx.lineTo(-Math.sin(legAngle) * height * 0.3, 0);
            ctx.stroke();

            // Front Leg
            ctx.beginPath();
            ctx.moveTo(0, -height * 0.35);
            ctx.lineTo(Math.sin(legAngle) * height * 0.3, 0);
            ctx.stroke();

            // Cloak/Robe Body
            ctx.beginPath();
            ctx.moveTo(-height * 0.16, -height * 0.35);
            ctx.lineTo(-height * 0.22, 0);
            ctx.lineTo(height * 0.22, 0);
            ctx.lineTo(height * 0.16, -height * 0.35);
            ctx.closePath();
            ctx.fill();

            // Upper Body & Hooded Head
            ctx.beginPath();
            ctx.arc(0, -height * 0.78, height * 0.15, Math.PI * 0.8, Math.PI * 2.2);
            ctx.lineTo(height * 0.14, -height * 0.35);
            ctx.lineTo(-height * 0.14, -height * 0.35);
            ctx.closePath();
            ctx.fill();

            // Hood Point / Peak
            ctx.beginPath();
            ctx.moveTo(-height * 0.12, -height * 0.82);
            ctx.lineTo(-height * 0.22, -height * 0.75);
            ctx.lineTo(-height * 0.05, -height * 0.93);
            ctx.closePath();
            ctx.fill();

            // Lantern (if carrying one)
            if (this.hasLantern) {
                const handX = height * 0.25 + Math.sin(armAngle) * 6;
                const handY = -height * 0.45 + Math.cos(armAngle) * 4;
                const lanternY = handY + 20 * this.scale;

                // Arm & Chain
                ctx.lineWidth = 1.8 * this.scale;
                ctx.beginPath();
                ctx.moveTo(0, -height * 0.62);
                ctx.lineTo(handX, handY);
                ctx.lineTo(handX, lanternY - 4 * this.scale);
                ctx.stroke();

                // Warm Glowing Light Cast
                const lGlow = ctx.createRadialGradient(handX, lanternY, 1, handX, lanternY, 45 * this.scale);
                lGlow.addColorStop(0, 'rgba(255, 200, 110, 0.75)');
                lGlow.addColorStop(0.3, 'rgba(240, 160, 60, 0.25)');
                lGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = lGlow;
                ctx.beginPath();
                ctx.arc(handX, lanternY, 45 * this.scale, 0, Math.PI * 2);
                ctx.fill();

                // Lantern Metal Housing
                ctx.fillStyle = '#ffcf77';
                ctx.fillRect(handX - 3.5 * this.scale, lanternY - 5 * this.scale, 7 * this.scale, 10 * this.scale);
            }

            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    // ── Initialize all elements ───────────────────────────────────
    let flyingCrows = [];
    let groundCrows = [];
    let walkingSilhouettes = [];

    function init() {
        initMoon();
        initStars();
        initTombstones();
        initBushes();
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

        // Walking mysterious silhouettes
        walkingSilhouettes = [
            new WalkingSilhouette(W * 0.2, 0.4, 0.85, true),  // Walking right with lantern
            new WalkingSilhouette(W * 0.75, -0.35, 0.65, false), // Walking left slowly
        ];
    }

    init();
    window.addEventListener('resize', () => { resize(); init(); });

    // ── Sky gradient ──────────────────────────────────────────────
    function drawSky() {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#090c14');
        grad.addColorStop(0.35, '#0e1422');
        grad.addColorStop(0.7, '#131b2e');
        grad.addColorStop(1, '#080b12');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    // ── Main animation loop ───────────────────────────────────────
    function frame(time) {
        ctx.clearRect(0, 0, W, H);

        drawSky();
        drawStars(time);
        drawMoon(time);
        drawWind(time);
        drawTombstones(time);
        drawBushes(time);
        drawGround(time);
        drawEntrancePillars(time);
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
