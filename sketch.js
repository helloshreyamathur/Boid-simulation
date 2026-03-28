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

// Constants
const BOID_COUNT = 200;
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

        // Size and appearance
        this.size = 5;
        this.color = color(200, 100, 255);
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
     * Draw the boid as a small triangle pointing in the direction of velocity
     */
    display() {
        // Calculate angle based on velocity direction
        let angle = atan2(this.velocity.y, this.velocity.x);

        push();
        fill(this.color);
        noStroke();

        // Translate to position and rotate to velocity direction
        translate(this.position.x, this.position.y);
        rotate(angle);

        // Draw a triangle
        triangle(
            this.size, 0,           // Tip (front)
            -this.size, -this.size, // Bottom left (back)
            -this.size, this.size   // Bottom right (back)
        );

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
    // Create canvas (responsive to window size)
    let container = document.getElementById('canvas-container');
    let canvasWidth = min(800, windowWidth - 20);
    let canvasHeight = 500;
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');

    // Create initial flock with random positions
    for (let i = 0; i < BOID_COUNT; i++) {
        flock.push(new Boid(random(width), random(height)));
    }

    // Update boid count display
    document.getElementById('boidCount').textContent = BOID_COUNT;

    // Setup slider event listeners
    setupSliderListeners();
}

/**
 * Draw: Main animation loop
 * Update and display all boids
 */
function draw() {
    // Clear background with a slight transparency for motion blur effect
    background(245, 245, 250);

    // Update and display each boid
    for (let boid of flock) {
        boid.flock(flock);
        boid.display();
    }

    // Optional: Draw info text
    fill(100);
    textSize(12);
    textAlign(LEFT);
    text(`FPS: ${Math.round(frameRate())}`, 10, 20);
}

/**
 * Setup slider event listeners for real-time control
 */
function setupSliderListeners() {
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
 * Handle window resize to make canvas responsive
 */
function windowResized() {
    // Optional: uncomment to make canvas responsive to window resize
    // let container = document.getElementById('canvas-container');
    // let canvasWidth = min(800, windowWidth - 20);
    // resizeCanvas(canvasWidth, 500);
}
