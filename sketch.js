let insects = [];
let atrractors;
let video;
let fieldScale = 10; // Size of each flow cell
let showFlowField = false; // Boolean to toggle flow field display


const creature_count_slider = document.getElementById("count");
const update_slider = document.getElementById("updateRate");
const memory_slider = document.getElementById("memory");
const blur1_slider = document.getElementById("blur1");
const blur2_slider = document.getElementById("blur2");
const checkbox = document.getElementById("motionField");
const fieldScale_slider = document.getElementById("fieldscale");

checkbox.addEventListener("change", (event) => {
    showFlowField = event.target.checked;
} );

function preload() {
    spriteManager.loadSpriteSheet("sprites.png");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO);
    video.size(width / fieldScale, height / fieldScale);
    video.hide();
    console.log(video.width, video.height);

    // Initialize flow field as a grid of vectors
    atrractors = Array(floor(width / fieldScale) * floor(height / fieldScale))
        .fill()
        .map(() => 0);

    Insect.scale = 0.5; // Set scale for all insects
    for (let i = 0; i < 1600; i++) {
        insects.push(new Insect());
    }
}
let fc=0;
function draw() {

    const creature_count = creature_count_slider.value;
    const updateRate = update_slider.value;
    const memory = memory_slider.value;
    const newscale = fieldScale_slider.value;
    if (fieldScale != newscale){
        fieldScale = newscale;
        video.size(width / fieldScale, height / fieldScale);
        atrractors = Array(floor(width / fieldScale) * floor(height / fieldScale))
        .fill()
        .map(() => 0);
    }
    if (insects.length > creature_count) {
        insects = insects.slice(0, creature_count);
    }
    if (insects.length < creature_count) {
        for (let i = insects.length; i < creature_count; i++) {
            insects.push(new Insect());
        }
    }
    background(220);

    // Update the flow field based on edge detection
    updateFlowField();

    // Optionally display the flow field if enabled
    if (showFlowField) {
        displayFlowField();
    }

    // Update and draw each insect based on the flow field
    fc+=1;
    for (let i = 0; i < insects.length; i++) {
        let insect = insects[i];
        if( (i+fc)%updateRate == 0){
            insect.goto(atrractors, resolution = fieldScale, memory);
        }
        insect.update();
        insect.draw();
    }
}

function updateFlowField() {
    // Capture the current camera frame as an image
    video.loadPixels();

    // Create two temporary graphics objects for the blurs
    let blurSmall = createGraphics(video.width, video.height);
    let blurLarge = createGraphics(video.width, video.height);

    // Draw the video onto both graphics objects
    blurSmall.image(video, 0, 0, video.width, video.height);
    blurLarge.image(video, 0, 0, video.width, video.height);

    // Apply different levels of blur to each image
    blurSmall.filter(BLUR, blur1_slider.value); // Smaller blur
    blurLarge.filter(BLUR, blur2_slider.value); // Larger blur

    // Calculate the Difference of Gaussians by subtracting pixels
    blurSmall.loadPixels();
    blurLarge.loadPixels();
    // console.log(blurSmall.pixels.length, blurLarge.pixels.length);

    for (let y = 0; y < video.height; y++) {
        for (let x = 0; x < video.width; x++) {
            const index = (x + y * video.width) * 4;

            // Compute the difference between the two blurred images
            const diffR = abs(blurSmall.pixels[index] - blurLarge.pixels[index]);
            const diffG = abs(blurSmall.pixels[index + 1] - blurLarge.pixels[index + 1]);
            const diffB = abs(blurSmall.pixels[index + 2] - blurLarge.pixels[index + 2]);

            // Use the average of the RGB differences for edge strength
            const brightness = (1.80*diffR + 0.2*diffG + 1*diffB) / 3;
            if(brightness>2){
                // atrractors.push({ x, y, brightness });
                const flowIndex = x + y * floor(width / fieldScale);
                atrractors[flowIndex] = brightness;
            } else {
                const flowIndex = x + y * floor(width / fieldScale);
                atrractors[flowIndex] = 0;
            }
        }
    }
    //  negative energy from teh mouse
    if(mouseX > 0 && mouseX < width && mouseY > 0 && pmouseY < height){
        for( let i = -10; i < 10; i++){
            for (let j = -10; j < 10; j++){
            const x = floor(mouseX / fieldScale)+i;
            const y = floor(mouseY / fieldScale)+j;
            const index = x + y * floor(width / fieldScale);
            atrractors[index] -= 200;
            console.log(atrractors[index]);
            }
        }
    }
}


// Display the flow field
function displayFlowField() {
    fill(100, 65, 65, 65);
    noStroke();
    for (let y = 0; y < video.height; y++) {
        for (let x = 0; x < video.width; x++) {
            const flowIndex = x + y * floor(width / fieldScale);
            const vector = atrractors[flowIndex];

            if(vector>0){
                ellipse(x*fieldScale, y*fieldScale, vector, vector);
            }
        }
    }
}

// Toggle flow field display when Enter key is pressed
function keyPressed() {
    if (keyCode === ENTER) {
        showFlowField = !showFlowField;
    }
}
