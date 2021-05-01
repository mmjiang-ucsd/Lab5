// script.js

//===================VARIABLES=======================
//----------------CANVAS VARIABLES----------------
const img = new Image(); // used to load image from <input> and draw to canvas
var canvas = document.getElementById("user-image"); // canvas element
var ctx = canvas.getContext('2d'); // draws on canvas in 2d
var img_input = document.getElementById("image-input"); // image input element
var form = document.getElementById("generate-meme"); // form element

//----------------TEXT VARIABLES-----------------
var top = document.getElementById("text-top"); // top text
var bottom = document.getElementById("text-bottom"); // bottom text

//--------------BUTTONS VARIABLE---------------
// generate button doesn't have an ID for some reason so we gotta do this
var buttons = document.getElementsByTagName("button");

//---------VOICE SYNTHESIS VARIABLES-----------
var voice_selection = document.getElementById("voice-selection");
var voices = []; // list of voices
var synth = window.speechSynthesis; // thing that does the speaking

//------------VOLUME VARIABLES----------
var volume_group = document.getElementById("volume-group");
var volume = 1;

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
/* on load:
    clear canvas context
    toggle submit/clear/read buttons by disabling/enabling as needed
    fill canvas with black (to add borders on non-square images)
    draw uploaded image onto canvas with correct width/height, leftmost coordinate, topmost coordinate using generated dimensions from getDimensions()
*/
img.addEventListener('load', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions['startX'], dimensions['startY'], dimensions['width'], dimensions['height']);
  buttons[0].disabled = false;  //enable generate button
  //disable text buttons
  buttons[1].disabled = true;
  buttons[2].disabled = true;
});

// "GENERATE" BUTTON
  /* form: submit
on submit, generate your meme by grabbing the text in the two inputs with ids text-top and text-bottom, and adding the relevant text to the canvas (note: you should still be able to add text to the canvas without an image uploaded)
toggle relevant buttons*/
form.addEventListener('submit', (event) => {
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.font = '48px impact';
  ctx.fillText(top.value.toUpperCase(), canvas.width/2, 50);
  ctx.strokeText(top.value.toUpperCase(), canvas.width/2, 50);
  ctx.fillText(bottom.value.toUpperCase(), canvas.width/2, 380);
  ctx.strokeText(bottom.value.toUpperCase(), canvas.width/2, 380);
  buttons[0].disabled = true;  // disable generate button
  // enable clear and read button
  buttons[1].disabled = false;
  buttons[2].disabled = false;
  event.preventDefault();  // prevent form from submitting
})

// "CLEAR" BUTTON
  /* button: clear
  on click, clear the image and/or text present
  toggle relevant buttons*/
buttons[1].addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  buttons[0].disabled = false;  // enable generate button
  // disable clear and read button
  buttons[1].disabled = true;
  buttons[2].disabled = true;
})

// populate dropdown list with speech synthesis voices
function populateVoices() {
  voice_selection.disabled = false;
  voice_selection.removeChild(voice_selection.children[0]); // remove default missing message
  voices = speechSynthesis.getVoices();
  //console.log(voices);

  // for each voice, create a new option, add it to the list
  for (let i = 0; i < voices.length; i++){
    var option = document.createElement('option');
    option.textContent = `${voices[i].name} (${voices[i].lang})`;  // "VoiceName (Language)"
    // current option is the default option
    if (voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }
    // assign proper language attributes
    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voice_selection.appendChild(option); // add to list
  }
}
// make sure that voices load. not sure why this doesn't work without using "voiceschanged" listener
speechSynthesis.addEventListener("voiceschanged", populateVoices);

// "READ TEXT" BUTTON
buttons[2].addEventListener("click", () => {
  var utter = new SpeechSynthesisUtterance(top.value + " " + bottom.value); // assign text to read
  //console.log(utter);
  var selected_voice = voice_selection.selectedOptions[0].getAttribute('data-name');
  //console.log(voice_selection.selectedOptions[0].getAttribute('data-name'));
  // find voice info in list and assign it to utter
  for(let i = 0; i < voices.length; i++) {
    if(voices[i].name === selected_voice) {
      utter.voice = voices[i];
      //console.log(voices[i].name);
    }
  }
  utter.volume = volume;
  synth.speak(utter);
})

/*
div: volume-group (volume slider)
update the volume value to increase or decrease the volume at which the text is read if the read text button is clicked
change the volume icons depending on the following volume ranges: (note: you can find these icons in the icons directory)
volume-level-3: 67-100
volume-level-2: 34-66
volume-level-1: 1-33
volume-level-0: 0
on any input into the slider
*/
volume_group.children[1].addEventListener("input", () => {
  //update icon
  if (volume_group.children[1].value <= 100 && volume_group.children[1].value >= 67){
    volume_group.children[0].src = "icons/volume-level-3.svg";
  }
  else if (volume_group.children[1].value <= 66 && volume_group.children[1].value >= 34){
    volume_group.children[0].src = "icons/volume-level-2.svg";
  }
  else if (volume_group.children[1].value <= 33 && volume_group.children[1].value >= 1){
    volume_group.children[0].src = "icons/volume-level-1.svg";
  }
  else {
    volume_group.children[0].src = "icons/volume-level-0.svg";
  }
  volume = volume_group.children[1].value / 100; // volume is 0-1 but value is 0-100
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
