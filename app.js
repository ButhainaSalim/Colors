class Colors {
  constructor() {
    //selectors
    this.colorDivs = document.querySelectorAll(".color");
    this.hexes = document.querySelectorAll(".color h2");
    this.copyContainer = document.querySelector(".copy-container");
    this.sliderCross = document.querySelectorAll(".adjust button");
    this.adjustButtons = document.querySelectorAll(".controls .adjust-button");
    this.lockButtons = document.querySelectorAll(".controls .lock-button");
    this.slidersContainer = document.querySelectorAll(".adjust");
    this.sliders = document.querySelectorAll(".sliders input");
    this.generateButton = document.querySelector(".generate");
    this.saveButton = document.querySelector(".save");
    this.saveCross = document.querySelector(".save-cross");
    this.saveContainer = document.querySelector(".save-container");
    this.submitButton = document.querySelector(".save-button");
    this.saveInput = document.querySelector(".save-popup input");
    this.libraryButton = document.querySelector(".library");
    this.libraryCross = document.querySelector(".library-cross");
    this.libraryContainer = document.querySelector(".library-container");
    this.libraryPopup = document.querySelector(".library-popup");
    this.initalColors;
    this.savePalettes = [];

  }
  // generate a random color from chroma
  generateColor() {
    const random = chroma.random();
    return random;
  }

  // applying the color and the hex code to the divs
  randomColor() {
    this.initalColors = [];
    this.colorDivs.forEach((div, index) => {
      const hexCode = div.children[0];
      const color = this.generateColor();
      const icons = div.querySelectorAll(".controls button");


      //locking the color 
      if (div.classList.contains("locked")) {
        this.initalColors.push(hexCode.innerText);

        return;
      } else {
        this.initalColors.push(color.hex());
      }


      hexCode.innerText = color;
      div.style.background = color;

      const sliders = div.querySelectorAll(".sliders input");
      const hue = sliders[0];
      const brightness = sliders[1];
      const saturation = sliders[2];

      this.colorizeSliders(color, hue, brightness, saturation)
      this.checkContast(color, hexCode, icons);

    });

    this.resetSliders();
  }

  //Copy clipBoard
  copyHexCode(hex) {
    const textArea = document.createElement("textarea");
    textArea.value = hex.innerText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    this.copyContainer.classList.add("active");

  }

  //add color to sliders inputs(range)
  colorizeSliders(color, hue, brightness, saturation) {
    const noSat = chroma(color).set("hsl.s", 0);
    const fullSat = chroma(color).set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    saturation.style.background = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;

    const midBright = chroma(color).set("hsl.l", .5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);
    brightness.style.background = `linear-gradient(to right,  ${scaleBright(0)}, ${scaleBright(.5)},${scaleBright(1)})`;

    hue.style.background = "linear-gradient(to right, rgb(204,75,75), rgb(204,204,70), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75)";
  }

  //check the contranst for the backgroung and the hex
  checkContast(color, hex, icons) {
    const luminance = chroma(color).luminance();
    if (luminance > .5) {
      hex.style.color = "black";
      icons[0].style.color = "black";
      icons[1].style.color = "black";


    } else {
      icons[0].style.color = "white";
      icons[1].style.color = "white";
      hex.style.color = "white";

    }
  }

  hslContrast(slider) {
    const index = slider.getAttribute("data-hue") || slider.getAttribute("data-bright") || slider.getAttribute("data-sat");
    const div = this.colorDivs[index];

    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const bright = sliders[1];
    const sat = sliders[2];
    const bgColor = this.initalColors[index];



    let color = chroma(bgColor).set("hsl.h", hue.value).set("hsl.s", sat.value).set("hsl.l", bright.value);

    div.style.background = color;
    this.colorizeSliders(color, hue, bright, sat);

  }

  updateTextUI(div, index) {
    const color = chroma(div.style.background);
    const hex = div.querySelector("h2");
    hex.innerText = color.hex();
  }

  resetSliders() {
    this.sliders.forEach((slider) => {
      if (slider.name === "hue-slider") {

        const hueColor = this.initalColors[slider.getAttribute("data-hue")];
        const hueValue = chroma(hueColor).hsl()[0];
        slider.value = hueValue;

      }
      if (slider.name === "brightness-slider") {
        const brightColor = this.initalColors[slider.getAttribute("data-bright")];
        const brightValue = chroma(brightColor).hsl()[2];
        slider.value = brightValue;
      }
      if (slider.name === "sat-slider") {
        const satColor = this.initalColors[slider.getAttribute("data-sat")];
        const satValue = chroma(satColor).hsl()[1];
        slider.value = satValue;
      }

    })
  }

  lockColor(lockButton, index) {
    const div = this.colorDivs[index];
    div.classList.toggle("locked");

    if (div.classList.contains("locked")) {
      lockButton.innerHTML = `<i class="fas fa-lock"></i>`;

    } else {
      lockButton.innerHTML = `<i class="fas fa-lock-open"></i>`;
    }
  }

  submitColor() {

    const name = this.saveInput.value;
    const colors = [];

    this.hexes.forEach((hex) => {
      colors.push(hex.innerText);
    })

    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem("palette"));
    if(paletteObjects){
      paletteNr = paletteObjects.length;
    }else{
      paletteNr = this.savePalettes.length;
    }

    const paletteObj = { name, colors, number: paletteNr };
    this.savePalettes.push(paletteObj);
    this.saveToLocal(paletteObj);
    this.saveInput.value = "";

    //library UI

    const libraryDiv = document.createElement("div");
    libraryDiv.classList.add("library-div");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const paletteDiv = document.createElement("div");
    paletteDiv.classList.add("palette-div");
    libraryDiv.appendChild(title);
    libraryDiv.appendChild(paletteDiv);
    this.libraryPopup.appendChild(libraryDiv);


    paletteObj.colors.forEach((smallColor) => {
      const littlePalette = document.createElement("div");
      littlePalette.classList.add("little-palette");
      littlePalette.style.background = smallColor;
      paletteDiv.appendChild(littlePalette);
    })

    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add(paletteObj.number);
    paletteBtn.innerText = "Select";
    libraryDiv.appendChild(paletteBtn);

    paletteBtn.addEventListener("click", (e) => {
      this.libraryContainer.classList.remove("active");
      const paletteIndex = e.target.classList[0];
      this.initalColors = [];
      this.savePalettes[paletteIndex].colors.forEach((color, index) => {
        this.initalColors.push(color);
        this.colorDivs[index].style.background = color;
        const text = this.colorDivs[index].children[0];
        const icons = this.colorDivs[index].querySelectorAll(".controls button");
        text.innerText = color;
        this.checkContast(color, text, icons);

      })
      this.resetSliders();
    })


  }
  saveToLocal(paletteObj) {
    let localPalettes;
    if (localStorage.getItem("palette") === null) {
      localPalettes = [];
    } else {
      localPalettes = JSON.parse(localStorage.getItem("palette"));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem("palette", JSON.stringify(localPalettes));

    
  }

  getLocalStorage(){
    let paletteObjects;
    if(localStorage.getItem("palette") === null){
      paletteObjects =[];
    }else{
      paletteObjects = JSON.parse(localStorage.getItem("palette"));
    }

    //copy of of paletterObjects form local storage so the savePalettes doesn't go back to being empty
    this.savePalettes=[...paletteObjects];

    paletteObjects.forEach(paletteObj =>{
      const libraryDiv = document.createElement("div");
    libraryDiv.classList.add("library-div");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const paletteDiv = document.createElement("div");
    paletteDiv.classList.add("palette-div");
    libraryDiv.appendChild(title);
    libraryDiv.appendChild(paletteDiv);
    this.libraryPopup.appendChild(libraryDiv);


    paletteObj.colors.forEach((smallColor) => {
      const littlePalette = document.createElement("div");
      littlePalette.classList.add("little-palette");
      littlePalette.style.background = smallColor;
      paletteDiv.appendChild(littlePalette);
    })

    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add(paletteObj.number);
    paletteBtn.innerText = "Select";
    libraryDiv.appendChild(paletteBtn);
    paletteBtn.addEventListener("click", (e) => {
      this.libraryContainer.classList.remove("active");
      const paletteIndex = e.target.classList[0];
      this.initalColors = [];
      paletteObjects[paletteIndex].colors.forEach((color, index) => {
        this.initalColors.push(color);
        this.colorDivs[index].style.background = color;
        const text = this.colorDivs[index].children[0];
        const icons = this.colorDivs[index].querySelectorAll(".controls button");
        text.innerText = color;
        this.checkContast(color, text, icons);

      })
      this.resetSliders();
    })

    })

  }

}


//create the new object
const colors = new Colors();




colors.hexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    colors.copyHexCode(hex);

  })
})

colors.copyContainer.addEventListener("transitionend", function () {
  colors.copyContainer.classList.remove("active");
});

colors.adjustButtons.forEach(function (adjustBtn, index) {
  adjustBtn.addEventListener("click", () => {

    colors.slidersContainer[index].classList.add("active");

  })

})

colors.sliderCross.forEach(function (cross, index) {
  cross.addEventListener("click", () => {
    colors.slidersContainer[index].classList.remove("active");
  })
})

colors.sliders.forEach(function (slider) {
  slider.addEventListener("input", function () {
    colors.hslContrast(slider);
  });
})

colors.colorDivs.forEach(function (div, index) {
  div.addEventListener("change", () =>
    colors.updateTextUI(div, index));
})

colors.lockButtons.forEach(function (lockButton, index) {
  lockButton.addEventListener("click", () => {
    colors.lockColor(lockButton, index);
  });
})

colors.generateButton.addEventListener("click", function () {
  colors.randomColor();
})

colors.saveButton.addEventListener("click", function () {
  colors.saveContainer.classList.add("active");
})
colors.saveCross.addEventListener("click", function () {
  colors.saveContainer.classList.remove("active");
})
colors.submitButton.addEventListener("click", function () {
  colors.submitColor();
  colors.saveContainer.classList.remove("active");

})

colors.libraryButton.addEventListener("click", function () {
  colors.libraryContainer.classList.add("active");
})

colors.libraryCross.addEventListener("click", function () {
  colors.libraryContainer.classList.remove("active");
})

document.addEventListener("DOMContentLoaded", function(){
  colors.randomColor();
  colors.getLocalStorage();
})

