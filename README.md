# 🐦 Boids Flocking Simulation

An interactive, immersive boids simulation where you can watch digital creatures flock together in mesmerizing patterns. Adjust three sliders in real-time to control behavior and discover the emergent magic of collective motion.

**No servers. No building. Just open and play.** 🎮✨

---

## What Are Boids?

Boids (short for "bird-oid objects") are simple agents that follow three basic behaviors:

### 1. **Separation** 🚫
Boids steer away from nearby flock mates to avoid crowding.
- *"Don't get too close to me!"*
- Creates personal space in the flock

### 2. **Alignment** 🧭
Boids steer towards the average direction of nearby flock mates.
- *"Where are my neighbors heading? I'll follow!"*
- Creates coordinated group heading

### 3. **Cohesion** 🎯
Boids steer toward the average location of nearby flock mates.
- *"Where is everyone? I should move toward the center."*
- Keeps the flock together

Even though each boid only follows these three simple rules, their collective behavior emerges as beautiful, lifelike flocking patterns. This is the power of **emergent behavior** from simple rules.

**Fun fact:** This algorithm was created by Craig Reynolds in 1986 and has been used in film, games, and art for decades!

---

## Getting Started

### Prerequisites
- A web browser (Chrome, Firefox, Safari, Edge, etc.)
- That's it! No npm, no build tools, no server needed.

### How to Run

**Option 1: Double-Click (Easiest)**
1. Navigate to the project folder
2. Double-click `index.html`
3. Your browser opens the simulation automatically

**Option 2: From Terminal**
```bash
cd path/to/boid-simulation
open index.html          # macOS
xdg-open index.html     # Linux
start index.html        # Windows
```

**Option 3: Local Server (if needed)**
```bash
cd path/to/boid-simulation
python3 -m http.server 8000
# Visit: http://localhost:8000
```

---

## How to Use It

Once the simulation is running:

1. **Watch the magic** - 200 boids will immediately start flocking together
   - Each boid has its own unique personality (subtle color and size variation)
   - Organic, hand-drawn shapes with soft curves (not geometric triangles)
   - Calm, meditative glow pulse that creates a "living" feel

2. **Adjust the sliders** below the canvas:
   - **Separation Force** (0-2) - How much they avoid each other
   - **Alignment Force** (0-2) - How much they match heading
   - **Cohesion Force** (0-2) - How much they stick together

3. **Observe the visual feedback**:
   - **High Separation**: Boids appear tenser/brighter and space out more
   - **High Alignment**: Colors harmonize and movement becomes coordinated
   - **High Cohesion**: Boids glow more intensely when clustered together
   - **Speed-based appearance**: Faster boids are brighter, slower ones are dimmer

### Creative Ideas to Try:
- **Extreme Separation** - Set cohesion/alignment to 0, only separation → See them repel like charged particles
- **Full Cohesion** - Set separation to 0, only cohesion → Dense ball of creatures
- **Alignment Only** - Set cohesion/separation to 0 → Lines of parallel motion
- **Balanced** - Set all three around 1.0 → Beautiful, natural-looking flocks
- **Watch the glow** - Observe how the calm pulse creates a meditative, living feeling
- **Notice the variety** - Each boid has subtle color and size differences - look for the unique personalities

---

## The Personality System

Each boid in the simulation is **unique** and **persistent**, not just a generic copy. Here's how:

### Visual Personality
- **Own color**: Each boid gets a unique hue and saturation within the purple/blue range
- **Own size**: Subtle size variation (15-20%) makes some boids larger, some smaller
- **Own shape**: Organic curves vary per boid - some rounder, some more pointed
- **Personality ID**: Generated once at creation, ensures consistency throughout

### Calm Animation
- **Soft glow pulse**: A gentle, meditative brightness pulsing (roughly 3-second cycle)
- **Speed-responsive**: Faster boids glow brighter, slower ones fade slightly
- **No fluttering**: Animation is minimal and smooth, creating a peaceful atmosphere
- **Staggered timing**: Each boid has its own animation phase, creating natural variation

### How It All Works
Every boid remembers its unique "personality ID" - a random number used to generate consistent properties via `noise()`. This means:
- The same boid always has the same color, size, and shape
- Boids feel organic, not mechanical or repetitive
- Visual differences are subtle but noticeable when you look closely
- The simulation feels alive thanks to individual personality

---

## Project Structure

```
boid-simulation/
├── index.html      # HTML structure & controls
├── sketch.js       # p5.js sketch with Boid class & flocking logic
├── style.css       # Dark & immersive styling
└── README.md       # This file
```

### Files Explained

**index.html**
- Simple HTML with a canvas container
- Three sliders for real-time control
- Loads p5.js from CDN
- No build tools needed!

**sketch.js**
- `Boid` class with position, velocity, acceleration
- Three core methods: `separate()`, `align()`, `cohere()`
- `flock()` method combines all three with weighted forces
- Responsive canvas that displays all boids
- Event listeners for slider controls

**style.css**
- Dark, immersive aesthetic with purple accents
- Responsive design (works on mobile too)
- Glowing effects and smooth animations
- Readable sliders with hover effects

---

## The Algorithm Deep Dive

### Physics Foundation
Each boid has three vector properties:

```javascript
position     // Where the boid is right now
velocity     // How fast and in what direction it's moving
acceleration // How much its direction/speed should change
```

### How It Works Each Frame:

1. **Calculate three forces**
   - `separate()` - Avoidance force
   - `align()` - Heading coordination force
   - `cohere()` - Attraction force toward center

2. **Weight and apply forces**
   ```javascript
   let separate = boid.separate(flock) * separationWeight
   let align = boid.align(flock) * alignmentWeight
   let cohere = boid.cohere(flock) * cohesionWeight

   boid.applyForce(separate + align + cohere)
   ```

3. **Update physics**
   ```
   velocity = velocity + acceleration
   position = position + velocity
   acceleration = 0 (reset for next frame)
   ```

4. **Display** - Draw boid as triangle pointing in velocity direction

### Detection Radius
Each behavior searches for neighbors within a certain range:
- **Separation**: 25px radius
- **Alignment**: 75px radius
- **Cohesion**: 100px radius

Only nearby boids influence each other, keeping computation efficient!

---

## Code Quality Features

✨ **Beginner-Friendly**
- Well-commented code explaining each step
- Clear variable names (not `x`, `y` but `position`, `velocity`)
- Separated concerns (Boid class, flocking logic, p5.js setup)

✨ **No Dependencies**
- Pure p5.js loaded via CDN
- No npm packages to install
- Works offline once loaded

✨ **Easy to Customize**
- Change `BOID_COUNT` for more/fewer creatures
- Adjust `MAX_SPEED` and `MAX_FORCE` for different dynamics
- Modify detection radii for different interaction ranges
- Update colors in the Boid class

---

## Customization Ideas

### Make It Your Own!

**Add More Boids**
```javascript
// In sketch.js, change:
const BOID_COUNT = 200;  // Try 500 for dense flocks!
```

**Change Boid Speed**
```javascript
const MAX_SPEED = 4;      // Try 6 or 2
const MAX_FORCE = 0.15;   // Controls acceleration
```

**Customize Colors**
```javascript
// In Boid class:
this.color = color(255, 100, 200);  // Pink boids!
```

**Add Predator Behavior**
- Add a special "predator" boid that chases others
- Boids flee from it with high separation weight
- Watch hunting behavior emerge!

**Add Obstacles**
- Draw walls or circles on the canvas
- Check if boids are near obstacles
- Apply repulsion force just like separation
- Create maze-like flocking patterns

**Add Food**
- Scatter "food" particles around
- Boids seek out and gather around food
- See if they change behavior with motivation!

---

## Browser Compatibility

Works on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Notes

- **200 boids** - Smooth 60fps on most systems
- **500+ boids** - May slow down on older devices
- **Canvas size** - Currently 800x500px (adjust in `setup()`)

If performance is slow:
1. Reduce `BOID_COUNT`
2. Increase detection radius to reduce neighbor checks
3. Lower screen resolution

---

## Learn More

- **Craig Reynolds' Original Boids Paper**: [Flocks, Herds, and Schools: A Distributed Behavioral Model](https://www.red3d.com/cwr/boids/)
- **p5.js Documentation**: [p5js.org](https://p5js.org)
- **Vector Math**: Understanding `createVector()` and vector operations
- **Emergent Systems**: How complex behavior arises from simple rules

---

## Credits

Built with:
- **p5.js** - Creative coding library
- **Craig Reynolds' Boids Algorithm** - The core concept
- Plain HTML, CSS, and JavaScript - Just the essentials

---

## Have Fun! 🎨🐦

The beauty of boids is in the experimentation. Try wild slider combinations. See what happens. Break things and rebuild. That's where the creativity comes in.

Got ideas for improvements? Want to add features? Modify the code freely—it's your creation now!

**Happy flocking!** ✨

---

*Last updated: March 28, 2026*
