class Star {
    constructor(canvas, ctx, speedFactor) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.speedFactor = speedFactor;
        this.trail = [];
        this.maxTrail = 5;
        this.reset();
    }

    reset() {
        // Start stars from center
        this.x = 0;
        this.y = 0;
        this.z = Math.random() * this.canvas.width;
        
        // Random angle for direction
        this.angle = Math.random() * Math.PI * 2;
        
        // Speed varies for depth perception
        this.speed = (Math.random() * 5 + 2) * this.speedFactor;
        
        // Size varies for depth perception
        this.size = Math.random() * 2 + 0.5;
        
        // Calculate direction vector
        this.dx = Math.cos(this.angle);
        this.dy = Math.sin(this.angle);
        
        // Clear trail when resetting
        this.trail = [];
    }

    update(trailFactor) {
        // Store current position for trail effect
        if (trailFactor > 0) {
            this.trail.push({x: this.x, y: this.y, z: this.z});
            
            // Limit trail length based on trail factor
            const maxTrailLength = Math.floor(trailFactor / 10) + 1;
            while (this.trail.length > maxTrailLength) {
                this.trail.shift();
            }
        } else {
            this.trail = [];
        }
        
        // Move star outward from center
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        
        // Reset star if it goes off screen
        const maxDist = Math.sqrt(
            Math.pow(this.canvas.width / 2, 2) + 
            Math.pow(this.canvas.height / 2, 2)
        );
        
        const dist = Math.sqrt(
            Math.pow(this.x, 2) + 
            Math.pow(this.y, 2)
        );
        
        if (dist > maxDist) {
            this.reset();
        }
    }

    draw(color, trailFactor, glowFactor) {
        // Calculate screen position (center of screen + offset)
        const screenX = this.canvas.width / 2 + this.x;
        const screenY = this.canvas.height / 2 + this.y;
        
        // Calculate size based on z position for depth effect
        const scaleFactor = (this.canvas.width - this.z) / this.canvas.width;
        const size = this.size * scaleFactor * 2;
        
        // Draw trail if enabled
        if (trailFactor > 0 && this.trail.length > 0) {
            this.ctx.save();
            
            // Draw trail segments
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const trailX = this.canvas.width / 2 + t.x;
                const trailY = this.canvas.height / 2 + t.y;
                const trailScaleFactor = (this.canvas.width - t.z) / this.canvas.width;
                const trailSize = this.size * trailScaleFactor * 1.5;
                
                // Calculate opacity based on position in trail
                const opacity = (i / this.trail.length) * 0.7;
                
                // Parse the color to get RGB components
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                
                // Draw trail segment
                this.ctx.beginPath();
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                this.ctx.arc(trailX, trailY, trailSize * (i / this.trail.length), 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
        
        // Draw star with glow effect
        if (glowFactor > 0) {
            // Create radial gradient for glow effect
            const glow = this.ctx.createRadialGradient(
                screenX, screenY, 0,
                screenX, screenY, size * (1 + glowFactor / 5)
            );
            
            // Parse the color to get RGB components
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            glow.addColorStop(0, color);
            glow.addColorStop(0.1, `rgba(${r}, ${g}, ${b}, 0.8)`);
            glow.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.2)`);
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = glow;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, size * (1 + glowFactor / 5), 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw the main star
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

class StarfieldSimulation {
    constructor() {
        this.canvas = document.getElementById('starfield');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.starCount = 500;
        this.speedFactor = 0.5;
        this.starColor = '#ffffff';
        this.trailFactor = 80;
        this.glowFactor = 5;
        this.lastTime = 0;
        
        // Initialize controls
        this.speedControl = document.getElementById('speed');
        this.colorControl = document.getElementById('color');
        this.densityControl = document.getElementById('density');
        this.trailControl = document.getElementById('trail');
        this.glowControl = document.getElementById('glow');
        
        // Initialize value displays
        this.valueDisplays = document.querySelectorAll('.value-display');
        
        this.init();
    }
    
    init() {
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Create stars
        this.createStars();
        
        // Set up event listeners for controls
        this.setupControls();
        
        // Start animation loop
        requestAnimationFrame(this.animate.bind(this));
        
        // Add intro animation
        this.addIntroAnimation();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push(new Star(this.canvas, this.ctx, this.speedFactor));
        }
    }
    
    setupControls() {
        // Speed control
        this.speedControl.addEventListener('input', (e) => {
            this.speedFactor = e.target.value / 5;
            this.stars.forEach(star => star.speedFactor = this.speedFactor);
            this.updateValueDisplay(0, e.target.value);
        });
        
        // Color control
        this.colorControl.addEventListener('input', (e) => {
            this.starColor = e.target.value;
        });
        
        // Density control
        this.densityControl.addEventListener('input', (e) => {
            this.starCount = parseInt(e.target.value);
            this.createStars();
            this.updateValueDisplay(2, e.target.value);
        });
        
        // Trail control
        this.trailControl.addEventListener('input', (e) => {
            this.trailFactor = parseInt(e.target.value);
            this.updateValueDisplay(3, e.target.value + '%');
        });
        
        // Glow control
        this.glowControl.addEventListener('input', (e) => {
            this.glowFactor = parseInt(e.target.value);
            this.updateValueDisplay(4, e.target.value);
        });
    }
    
    updateValueDisplay(index, value) {
        if (this.valueDisplays[index]) {
            this.valueDisplays[index].textContent = value;
        }
    }
    
    addIntroAnimation() {
        // Animate title
        const title = document.querySelector('.title');
        const subtitle = document.querySelector('.subtitle');
        const controls = document.querySelector('.controls');
        
        if (title && subtitle && controls) {
            title.style.opacity = '0';
            subtitle.style.opacity = '0';
            controls.style.opacity = '0';
            controls.style.transform = 'translateX(-50%) translateY(50px)';
            
            // Fade in title
            setTimeout(() => {
                title.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
                title.style.opacity = '1';
            }, 500);
            
            // Fade in subtitle
            setTimeout(() => {
                subtitle.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
                subtitle.style.opacity = '1';
            }, 1500);
            
            // Fade in controls
            setTimeout(() => {
                controls.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
                controls.style.opacity = '1';
                controls.style.transform = 'translateX(-50%) translateY(0)';
            }, 2500);
        }
    }
    
    animate(timestamp) {
        // Calculate delta time for smooth animation
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Clear canvas with trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw stars
        this.stars.forEach(star => {
            star.update(this.trailFactor);
            star.draw(this.starColor, this.trailFactor, this.glowFactor);
        });
        
        // Continue animation loop
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Initialize simulation when page loads
window.addEventListener('DOMContentLoaded', () => {
    new StarfieldSimulation();
});