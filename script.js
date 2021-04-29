// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
var canvas = document.getElementById("user-image");
var ctx = canvas.getContext('2d');
var img_input = document.getElementById("image-input");
var form = document.getElementById("generate-meme");

// submit button doesn't have an ID for some reason so we gotta do this
var buttons = document.getElementsByTagName("button");

// when file is changed, load file into img
img_input.addEventListener('change', () =>{
  //load in selected image into img's src attribute
  //console.log(img_input.value);
  const img_url = URL.createObjectURL(img_input.files[0]); // create DOMString with URL representing the file we uploaded
  img.src = img_url; // put that file as the image's src
  //set the image alt attribute by extracting the image file name from the file path
  //console.log(img_input.files[0].name);
  img.alt = img_input.files[0].name;
})

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  /* on load:
      clear canvas context
      toggle submit/clear/read buttons by disabling/enabling as needed
      fill canvas with black (to add borders on non-square images)
      draw uploaded image onto canvas with correct width/height, leftmost coordinate, topmost coordinate using generated dimensions from getDimensions()
  */
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions['startX'], dimensions['startY'], dimensions['width'], dimensions['height']);
});

form.addEventListener('submit', (event) => {
  /* form: submit
on submit, generate your meme by grabbing the text in the two inputs with ids text-top and text-bottom, and adding the relevant text to the canvas (note: you should still be able to add text to the canvas without an image uploaded)
toggle relevant buttons*/
  let top = document.getElementById("text-top");
  let bottom = document.getElementById("text-bottom");
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.font = '48px impact';
  ctx.fillText(top.value.toUpperCase(), canvas.width/2, 50);
  ctx.strokeText(top.value.toUpperCase(), canvas.width/2, 50);
  ctx.fillText(bottom.value.toUpperCase(), canvas.width/2, 380);
  ctx.strokeText(bottom.value.toUpperCase(), canvas.width/2, 380);
  buttons[0].disabled = true;
  event.preventDefault();
})

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
