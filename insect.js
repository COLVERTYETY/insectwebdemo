// Singleton class to handle sprite loading and cutting
class SpriteManager {
    constructor() {
        if (!SpriteManager.instance) {
            this.spriteSheet = null;
            this.sprites = [];
            SpriteManager.instance = this;
        }
        return SpriteManager.instance;
    }

    // Load and process the sprite sheet
    loadSpriteSheet(path) {
        this.spriteSheet = loadImage(path, () => {
            this.cutSprites();
        });
    }

    // Cut the sprite sheet into individual sprites
    cutSprites() {
        const spriteWidth = 612 / 5;
        const spriteHeight = 367 / 3;

        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 5; x++) {
                const sprite = this.spriteSheet.get(
                    x * spriteWidth,
                    y * spriteHeight,
                    spriteWidth,
                    spriteHeight
                );
                this.sprites.push(sprite);
            }
        }
    }

    // Get a specific sprite by index
    getSprite(index) {
        return this.sprites[index];
    }
}

// Create a global instance of SpriteManager
const spriteManager = new SpriteManager();


class Insect {
    static scale = 1.0;

    constructor(index = Math.floor(Math.random() * 15)) {
        this.position = createVector(random(width), random(height));
        this.velocity = createVector(random(-20, 20), random(-20, 20));
        this.spriteIndex = index;
        this.last = [];
    }

    update() {
        this.velocity.limit(10);
        this.position.add(this.velocity);

        // Wrap around edges of the screen
        if (this.position.x > width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = width;
        if (this.position.y > height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = height;
    }

    draw() {
        const sprite = spriteManager.getSprite(this.spriteIndex);
        if (sprite) {
            push();
            translate(this.position.x, this.position.y);
            rotate(this.velocity.heading()+HALF_PI);
            imageMode(CENTER);
            image(
                sprite,
                0,
                0,
                sprite.width * Insect.scale,
                sprite.height * Insect.scale
            );
            pop();
        }
    }

    goto(attractors, resolution, memory) {
        const width_ = 16;
        const height_ = 16;
        const x = floor(this.position.x / resolution);
        const y = floor(this.position.y / resolution);
        let found = false;
        for(let x_ = x - width_; x_ < x + width_; x_+=2){
            for(let y_ = y - height_; y_ < y + height_; y_+=2){
                const index = x_ + y_ * floor(width/ resolution);
                if(attractors[index] && attractors[index] > 1 && !this.last.includes(index)){
                    this.last.push(index);
                    found = true;
                    const target = createVector(x_ * resolution, y_ * resolution);
                    const desired = p5.Vector.sub(target, this.position);
                    // desired.normalize();
                    desired.mult(attractors[index]**4);
                    // this.velocity.lerp(desired, 0.4);
                    this.velocity.add(desired);
                }
            }
        }
        while(this.last.length > width_*height_*memory) {
            this.last.shift();  
        }
    }

}
