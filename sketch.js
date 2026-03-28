// ============================================================================
// BOIDS FLOCKING SIMULATION
// Based on Craig Reynolds' Boids algorithm
// Three crowd behavior rules: separation, alignment, and cohesion
// ============================================================================

// Global variables for the sketch
let flock = [];
let separationWeight = 1.5;
let alignmentWeight = 1.0;
let cohesionWeight = 1.0;
let boidCount = 200; // Now a variable, not a constant

// Constants
const MAX_SPEED = 4;
const MAX_FORCE = 0.15;
const SEPARATION_RADIUS = 25;
const ALIGNMENT_RADIUS = 75;
const COHESION_RADIUS = 100;

/**
 * ============================================================================
 * BOID CLASS
 * Represents a single boid in the flock with position, velocity, and
 * acceleration. Implements flocking behavior through separation, alignment,
 * and cohesion forces.
 * ============================================================================
 */
class Boid {
    constructor(x, y) {
        // Position, velocity, and acceleration vectors
        this.position = createVector(x, y);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.acceleration = createVector(0, 0);

        // ===== PERSONALITY: Each boid gets a unique identity =====
        // Random seed for this individual boid
        this.personality = random(10000);

        // Size variation: subtle spread around base size (15-20% variation)
        this.size = random(4.2, 5.8);

        // Color variation: hues within purple/blue range, subtle saturation shift
        // Base hue: 270-300 (purple to blue range)
        this.baseHue = 270 + noise(this.personality * 0.001) * 30;
        this.baseSaturation = 65 + noise(this.personality * 0.002) * 15;

        // Shape variation: affects how rounded vs pointed the boid is
        // Values 0-1, used to modulate curves in drawing
        this.shapeRoundness = noise(this.personality * 0.003);

        // Animation phase: each boid has its own glow pulse timing
        this.glowPhase = random(TWO_PI);
    }

    /**
     * Apply a force to the boid's acceleration
     * Force = mass * acceleration, assuming mass = 1
     */
    applyForce(force) {
        this.acceleration.add(force);
    }

    /**
     * FLOCKING BEHAVIOR 1: SEPARATION
     * Steer to avoid crowding local flockmates.
     * If another boid is too close, steer away from it.
     */
    separate(boids) {
        let steerForce = createVector(0, 0);
        let count = 0;

        for (let other of boids) {
            // Don't compare with self
            if (other === this) continue;

            let distance = dist(this.position.x, this.position.y,
                               other.position.x, other.position.y);

            // If the distance is within the separation radius
            if (distance < SEPARATION_RADIUS) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.position, other.position);
                diff.normalize();
                diff.mult(1 / distance); // Weight by distance
                steerForce.add(diff);
                count++;
            }
        }

        // Average
        if (count > 0) {
            steerForce.div(count);
            steerForce.setMag(MAX_SPEED);
            steerForce.sub(this.velocity);
            steerForce.limit(MAX_FORCE);
        }

        return steerForce;
    }

    /**
     * FLOCKING BEHAVIOR 2: ALIGNMENT
     * Steer towards the average heading of local flockmates.
     * Look at the steering velocity of boids nearby and average it.
     */
    align(boids) {
        let sum = createVector(0, 0);
        let count = 0;

        for (let other of boids) {
            // Don't compare with self
            if (other === this) continue;

            let distance = dist(this.position.x, this.position.y,
                               other.position.x, other.position.y);

            // If the distance is within the alignment radius
            if (distance < ALIGNMENT_RADIUS) {
                sum.add(other.velocity);
                count++;
            }
        }

        // Average the velocities
        if (count > 0) {
            sum.div(count);
            sum.setMag(MAX_SPEED);
            sum.sub(this.velocity);
            sum.limit(MAX_FORCE);
            return sum;
        }

        return createVector(0, 0);
    }

    /**
     * FLOCKING BEHAVIOR 3: COHESION
     * Steer to move toward the average location of local flockmates.
     * This simulates the boids trying to move toward the center of the flock.
     */
    cohere(boids) {
        let sum = createVector(0, 0);
        let count = 0;

        for (let other of boids) {
            // Don't compare with self
            if (other === this) continue;

            let distance = dist(this.position.x, this.position.y,
                               other.position.x, other.position.y);

            // If the distance is within the cohesion radius
            if (distance < COHESION_RADIUS) {
                sum.add(other.position);
                count++;
            }
        }

        // Average location
        if (count > 0) {
            sum.div(count);
            // Steer towards the location
            return this.steer(sum);
        }

        return createVector(0, 0);
    }

    /**
     * A method that calculates a steering force towards a target
     * (used by cohesion)
     */
    steer(target) {
        let desired = p5.Vector.sub(target, this.position);
        desired.setMag(MAX_SPEED);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(MAX_FORCE);
        return steer;
    }

    /**
     * Update position based on velocity and acceleration
     * Implements basic physics: F = ma
     * Then applies boundary wrapping
     */
    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(MAX_SPEED);
        this.position.add(this.velocity);
        this.acceleration.mult(0); // Reset acceleration each cycle

        // Wrap around screen edges
        this.wraparound();
    }

    /**
     * Wraparound: move boid to opposite side of screen if it leaves
     */
    wraparound() {
        if (this.position.x > width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = width;
        if (this.position.y > height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = height;
    }

    /**
     * Apply flocking rules and update position
     */
    flock(boids) {
        // Apply flocking rules with weighted forces
        let separate = this.separate(boids);
        let align = this.align(boids);
        let cohere = this.cohere(boids);

        separate.mult(separationWeight);
        align.mult(alignmentWeight);
        cohere.mult(cohesionWeight);

        // Apply forces
        this.applyForce(separate);
        this.applyForce(align);
        this.applyForce(cohere);

        // Update position
        this.update();
    }

    /**
     * Get the current glow intensity for this boid
     * Creates a calm, subtle pulse effect using sine wave
     * Varies between 0.7 (dim) and 1.0 (full brightness)
     */
    getGlowIntensity() {
        // Slow, calm pulse: roughly 3 second cycle
        let pulseValue = sin(frameCount * 0.02 + this.glowPhase) * 0.15 + 0.85;
        return constrain(pulseValue, 0.7, 1.0);
    }

    /**
     * Get the color for this boid with personality
     * Returns RGB color based on personality and current speed/state
     */
    getColorWithPersonality() {
        // Base personality hue: map personality to purple/blue range (180-300 in hue)
        // We'll use simple RGB mixing to create color variation
        let personalityHue = 200 + (this.baseHue - 270) * 1.5; // Map to visible hue range

        // Create base color in purple/blue range
        let r = 160 + this.baseSaturation * 0.5;  // Reds: 160-175
        let g = 100 + (this.shapeRoundness * 30); // Greens: 100-130 for variety
        let b = 220 + (this.baseHue - 270) * 1.5; // Blues: 220-250 for purple/blue

        // Speed-responsive brightness: faster = brighter, slower = dimmer
        let speedFactor = this.velocity.mag() / MAX_SPEED; // 0 to 1
        let speedMultiplier = 0.7 + speedFactor * 0.3; // 0.7 to 1.0

        // Apply glow intensity modulation
        let glowIntensity = this.getGlowIntensity();

        // Combine all effects
        let finalR = r * speedMultiplier * glowIntensity;
        let finalG = g * speedMultiplier * glowIntensity;
        let finalB = b * speedMultiplier * glowIntensity;

        return color(finalR, finalG, finalB);
    }

    /**
     * Draw an organic, soft shape for this boid
     * Uses curves to create a hand-drawn, illustrative appearance
     * Shape tapers from broader body to pointed tip
     */
    drawOrganicShape() {
        // Vary shape based on personality: more rounded or more pointed
        let roundness = 1 + this.shapeRoundness * 0.3; // 1.0 to 1.3 multiplier

        // Define the boid shape using curves for organic feel
        beginShape();

        // Tip (front of boid, pointing in velocity direction)
        vertex(this.size * 1.2, 0);

        // Top back curve
        bezierVertex(
            this.size * 0.6, -this.size * 0.5 * roundness,  // Control point 1
            -this.size * 0.3, -this.size * 0.7 * roundness, // Control point 2
            -this.size * 0.9, -this.size * 0.5              // End point (top rear)
        );

        // Bottom back curve (mirror of top)
        bezierVertex(
            -this.size * 0.3, this.size * 0.7 * roundness,  // Control point 1
            this.size * 0.6, this.size * 0.5 * roundness,   // Control point 2
            this.size * 1.2, 0                              // Back to tip
        );

        endShape(CLOSE);
    }

    /**
     * Count how many neighbors are nearby (for visual feedback)
     * Used to modulate appearance based on separation/cohesion behaviors
     */
    countNearbyNeighbors(boids) {
        let count = 0;
        let averageDistance = 0;

        for (let other of boids) {
            if (other === this) continue;

            let distance = dist(this.position.x, this.position.y,
                              other.position.x, other.position.y);

            // Check if within any of the three behavior radii
            if (distance < COHESION_RADIUS) {
                count++;
                averageDistance += distance;
            }
        }

        return {
            count: count,
            avgDistance: count > 0 ? averageDistance / count : COHESION_RADIUS
        };
    }

    /**
     * Draw the boid with organic personality and visual feedback
     * Combines calm glow animation with behavior-responsive coloring
     */
    display() {
        // Calculate angle based on velocity direction
        let angle = atan2(this.velocity.y, this.velocity.x);

        // Get dynamic color based on personality, speed, and glow
        let boidColor = this.getColorWithPersonality();

        push();
        fill(boidColor);
        noStroke();

        // Translate to position and rotate to velocity direction
        translate(this.position.x, this.position.y);
        rotate(angle);

        // Draw the organic, curved shape
        this.drawOrganicShape();

        pop();
    }
}

// ============================================================================
// P5.JS SKETCH SETUP AND DRAW FUNCTIONS
// ============================================================================

/**
 * Setup: Initialize the canvas and create the initial flock
 */
function setup() {
    // Create full-screen canvas
    let container = document.getElementById('canvas-container');
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');

    // Create initial flock with random positions
    for (let i = 0; i < boidCount; i++) {
        flock.push(new Boid(random(width), random(height)));
    }

    // Setup slider event listeners
    setupSliderListeners();

    // Log to console that personality system is running
    console.log('✅ Cosmic Boids simulation loaded!');
    console.log(`🐦 Created ${boidCount} unique boids with individual colors and shapes`);
}

/**
 * Draw: Main animation loop
 * Update and display all boids
 */
function draw() {
    // Clear background with cosmic darkness
    background(10, 5, 20);

    // Update and display each boid
    for (let boid of flock) {
        boid.flock(flock);
        boid.display();
    }

    // Optional: Draw FPS counter in top-right for performance monitoring
    fill(150);
    textSize(12);
    textAlign(RIGHT);
    text(`FPS: ${Math.round(frameRate())}`, width - 20, 30);
}

/**
 * Setup slider event listeners for real-time control
 */
function setupSliderListeners() {
    // Boid count slider
    document.getElementById('boidCountSlider').addEventListener('input', (e) => {
        let newCount = parseInt(e.target.value);
        document.getElementById('boidCountValue').textContent = newCount;

        // Add or remove boids
        if (newCount > boidCount) {
            // Add boids
            for (let i = boidCount; i < newCount; i++) {
                flock.push(new Boid(random(width), random(height)));
            }
        } else if (newCount < boidCount) {
            // Remove boids
            flock = flock.slice(0, newCount);
        }
        boidCount = newCount;
    });

    // Separation slider
    document.getElementById('separationSlider').addEventListener('input', (e) => {
        separationWeight = parseFloat(e.target.value);
        document.getElementById('separationValue').textContent = separationWeight.toFixed(2);
    });

    // Alignment slider
    document.getElementById('alignmentSlider').addEventListener('input', (e) => {
        alignmentWeight = parseFloat(e.target.value);
        document.getElementById('alignmentValue').textContent = alignmentWeight.toFixed(2);
    });

    // Cohesion slider
    document.getElementById('cohesionSlider').addEventListener('input', (e) => {
        cohesionWeight = parseFloat(e.target.value);
        document.getElementById('cohesionValue').textContent = cohesionWeight.toFixed(2);
    });
}

/**
 * Handle window resize to make canvas fully responsive
 */
function windowResized() {
    if (typeof windowWidth !== 'undefined' && typeof windowHeight !== 'undefined') {
        resizeCanvas(windowWidth, windowHeight);
    }
}
