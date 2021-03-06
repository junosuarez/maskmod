let seed = parseInt(document.location.hash.substr(1), 10) || 253;

if (Number.isNaN(seed) || seed < 0 || seed > 9999) {
  alert("mask number must be between 0 and 9999");
  setup = function () {};
  draw = function () {};
}

let palette;
let g;
let current = seed;
let texture;
let f = 0;
let bg;
let drawBg = false;
let material = "classic";

function setup() {
  createCanvas(1600, 1600);
  pixelDensity(1);
  colorMode(RGB, 360, 100, 100, 100);
  angleMode(DEGREES);

  texture = createGraphics(width, height);
  texture.colorMode(RGB, 360, 100, 100, 100);
  texture.angleMode(DEGREES);

  texture.stroke(0, 0, 0, 1);
  for (let i = 0; i < (width * height * 1) / 100; i++) {
    let x = random(width);
    let y = random(height);
    let angle = 90 + random(15) * (random(100) > 50 ? -1 : 1);
    let d = width / 10;
    texture.line(
      x + cos(angle) * d,
      y + sin(angle) * d,
      x + cos(angle + 180) * d,
      y + sin(angle + 180) * d
    );
  }

  shuffleRnd(url);
}

function shuffleRnd(array) {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function draw() {
  f++;
  clear();

  if (f % 10 === 0) {
    shuffleRnd(url);
  }

  palette = shuffle(
    createPalette(material === "wood" ? woodPalette : random(url)),
    true
  );
  if (material === "black n white") {
    palette[0] =
      Math.random() > 0.5 ? color(0, 0, 0, 255) : color(255, 255, 255, 255);
  }

  randomSeed(current);
  noiseSeed(current);

  let offset = width / 10;
  let x = offset;
  let y = offset;
  let w = width - offset * 2;
  let h = height - offset * 2;

  let c = palette[0];
  bg = c;
  palette.shift();

  shuffleRnd(palette);

  push();
  fill(c);
  strokeWeight(30);
  stroke(c);

  let nScale = random(60, 200);
  drawShape(x + w / 2, y + h / 2, (w * 3) / 4, nScale);
  drawingContext.clip();
  drawGraphic(0, 0, width, height, palette, this);
  pop();

  g = get();
  bg = random(palette);
  if (drawBg) {
    background(bg);
  } else {
    clear();
  }

  let area = detectEdge(g);
  rectMode(CORNERS);
  let center = detectCenter(area);
  let v = p5.Vector.sub(
    createVector(width / 2, height / 2),
    createVector(center.x, center.y)
  );

  push();
  imageMode(CENTER);
  translate(v.x + g.width / 2, v.y + g.height / 2);
  // drawingContext.shadowColor = color(0, 0, 0, 50);
  // drawingContext.shadowBlur = max(width, height) / 20;
  // drawingContext.shadowOffsetY = max(width, height) / 40;

  switch (material) {
    case "wood":
      textureMask(g);
      break;
    case "black n white":
      bwMask(g);
      break;
  }

  image(g, 0, 0);
  pop();

  // image(texture, 0, 0);

  // frameRate(10);
  noLoop();
}

// helper for writing color to array
function writeColor(image, x, y, red, green, blue, alpha) {
  let index = (x + y * width) * 4;
  image.pixels[index] = red;
  image.pixels[index + 1] = green;
  image.pixels[index + 2] = blue;
  image.pixels[index + 3] = alpha;
}
function readColor(image, x, y, arr) {
  let index = (x + y * width) * 4;

  arr[0] = image.pixels[index];
  arr[1] = image.pixels[index + 1];
  arr[2] = image.pixels[index + 2];
  arr[3] = image.pixels[index + 3];
  return arr;
}

function multiplyColor(a, b) {
  a[0] = (a[0] / 255) * (b[0] / 255) * 255;
  a[1] = (a[1] / 255) * (b[1] / 255) * 255;
  a[2] = (a[2] / 255) * (b[2] / 255) * 255;
}

function woodgrain(base, grain) {
  var weight = Math.random() + 0.5;
  return base - weight * grain;
}

function textureMask(g) {
  g.loadPixels();
  texture.loadPixels();
  window.tx = texture;
  const tArr = [];
  const mArr = [];
  for (let j = 0; j < g.height; j++) {
    for (let i = 0; i < g.width; i++) {
      readColor(g, i, j, mArr);
      let alpha = mArr[3];
      if (alpha > 0) {
        readColor(texture, i, j, tArr);
        const txA = tArr[3];
        writeColor(
          g,
          i,
          j,
          woodgrain(mArr[0], txA),
          woodgrain(mArr[1], txA),
          woodgrain(mArr[2], txA),
          255
        );
      }
    }
  }
  g.updatePixels();
}

function bwMask(g) {
  g.loadPixels();
  window.g = g;
  const tArr = [];
  const mArr = [];
  for (let j = 0; j < g.height; j++) {
    var rowOn = Math.random() > 0.8;
    for (let i = 0; i < g.width; i++) {
      readColor(g, i, j, mArr);
      let alpha = mArr[3];
      if (alpha > 0) {
        readColor(texture, i, j, tArr);

        var brightness = (mArr[0] + mArr[1] + mArr[1] + mArr[2]) / 4;

        if (rowOn && Math.random() > 0.5) {
          brightness += Math.random() > 0.5 ? 32 : -32;
        }

        writeColor(g, i, j, brightness, brightness, brightness, 255);
      }
    }
  }
  g.updatePixels();
}

function detectCenter(area) {
  let x = lerp(area.minX, area.maxX, 0.5);
  let y = lerp(area.minY, area.maxY, 0.5);
  let w = abs(area.maxX - area.minX);
  let h = abs(area.maxY - area.minY);
  return {
    x: x,
    y: y,
    w: w,
    h: h,
  };
}

function detectEdge(g) {
  let minX, minY, maxX, maxY;
  minX = g.width;
  minY = g.height;
  maxX = 0;
  maxY = 0;
  g.loadPixels();
  for (let j = 0; j < g.height; j++) {
    for (let i = 0; i < g.width; i++) {
      let n = i * 4 + j * g.width * 4 + 3;
      let alpha = g.pixels[n];
      if (alpha > 0) {
        minX = min(minX, i);
        minY = min(minY, j);
        maxX = max(maxX, i);
        maxY = max(maxY, j);
      }
    }
  }
  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY,
  };
}

function drawGraphic(x, y, w, h, colors, target) {
  let g = createGraphics(w / 2, h);
  g.angleMode(DEGREES);
  let gx = 0;
  let gy = 0;
  let gxStep, gyStep;

  if (random() > 0.5) {
    while (gy < g.height) {
      gyStep = random(g.height / 100, g.height / 5);
      if (gy + gyStep > g.height || g.height - (gy + gyStep) < g.height / 20) {
        gyStep = g.height - gy;
      }
      gx = 0;
      while (gx < g.width) {
        gxStep = gyStep;
        if (gx + gxStep > g.width || g.width - (gx + gxStep) < g.width / 10) {
          gxStep = g.width - gx;
        }
        // g.ellipse(gx+gxStep/2,gy+gyStep/2,gxStep,gyStep);
        drawPattern(g, gx, gy, gxStep, gyStep, colors);
        gx += gxStep;
      }
      gy += gyStep;
    }
  } else {
    while (gx < g.width) {
      gxStep = random(g.width / 100, g.width / 5);
      if (gx + gxStep > g.width || g.width - (gx + gxStep) < g.width / 20) {
        gxStep = g.width - gx;
      }
      gy = 0;
      while (gy < g.height) {
        gyStep = gxStep;
        if (
          gy + gyStep > g.height ||
          g.height - (gy + gyStep) < g.height / 10
        ) {
          gyStep = g.height - gy;
        }
        // g.ellipse(gx+gxStep/2,gy+gyStep/2,gxStep,gyStep);
        drawPattern(g, gx, gy, gxStep, gyStep, colors);
        gy += gyStep;
      }
      gx += gxStep;
    }
  }

  target.push();
  target.translate(x + w / 2, y + h / 2);
  target.imageMode(CENTER);
  target.scale(1, 1);
  target.image(g, -g.width / 2, 0);
  target.scale(-1, 1);
  target.image(g, -g.width / 2, 0);
  target.pop();
}

function drawPattern(g, x, y, w, h, colors) {
  let rotate_num = (int(random(4)) * 360) / 4;
  g.push();
  g.translate(x + w / 2, y + h / 2);
  g.rotate(rotate_num);
  if (rotate_num % 180 == 90) {
    let tmp = w;
    w = h;
    h = tmp;
  }
  g.translate(-w / 2, -h / 2);
  g.drawingContext.shadowColor = color(0, 0, 0, 33);
  g.drawingContext.shadowBlur = max(w, h) / 5;
  let sep = int(random(1, 6));

  let c = -1,
    pc = -1;
  g.stroke(0, (20 / 100) * 255);

  switch (int(random(8))) {
    case 0:
      for (let i = 1; i > 0; i -= 1 / sep) {
        while (pc == c) {
          c = random(colors);
        }
        pc = c;
        g.push();
        g.scale(i);
        g.strokeWeight(1 / i);
        g.fill(c);
        g.arc(0, 0, w * 2, h * 2, 0, 90);
        g.pop();
      }
      break;
    case 1:
      for (let i = 1; i > 0; i -= 1 / sep) {
        while (pc == c) {
          c = random(colors);
        }
        pc = c;
        g.push();
        g.fill(c);

        g.push();
        g.translate(w / 2, 0);
        g.scale(i);
        g.strokeWeight(1 / i);
        g.arc(0, 0, w, h, 0, 180);
        g.pop();

        g.push();
        g.translate(w / 2, h);
        g.scale(i);
        g.strokeWeight(1 / i);
        g.arc(0, 0, w, h, 0 + 180, 180 + 180);
        g.pop();
        g.pop();
      }
      break;
    case 2:
      for (let i = 1; i > 0; i -= 1 / sep) {
        while (pc == c) {
          c = random(colors);
        }
        pc = c;
        g.push();
        g.fill(c);

        g.push();
        g.scale(i);
        g.strokeWeight(1 / i);
        g.arc(0, 0, w * sqrt(2), h * sqrt(2), 0, 90);
        g.pop();

        g.push();
        g.translate(w, h);
        g.scale(i);
        g.strokeWeight(1 / i);
        g.arc(0, 0, w * sqrt(2), h * sqrt(2), 0 + 180, 90 + 180);
        g.pop();

        g.pop();
      }
      break;
    case 3:
      for (let i = 1; i > 0; i -= 1 / sep) {
        while (pc == c) {
          c = random(colors);
        }
        pc = c;
        g.push();
        g.translate(w / 2, h / 2);
        g.scale(i);
        g.strokeWeight(1 / i);
        g.fill(c);
        g.ellipse(0, 0, w, h);
        g.pop();
      }
      break;
    case 4:
      for (let i = 1; i > 0; i -= 1 / sep) {
        while (pc == c) {
          c = random(colors);
        }
        pc = c;
        g.push();
        g.scale(i);
        g.strokeWeight(1 / i);
        g.fill(c);
        g.triangle(0, 0, w, 0, 0, h);
        g.pop();
      }
      break;
    case 5:
      for (let i = 1; i > 0; i -= 1 / sep) {
        while (pc == c) {
          c = random(colors);
        }
        pc = c;
        g.push();
        g.fill(c);

        g.push();
        g.translate(w / 2, 0);
        g.scale(i);
        g.strokeWeight(1 / i);
        g.triangle(-w / 2, 0, w / 2, 0, 0, h / 2);
        g.pop();

        g.push();
        g.translate(w / 2, h);
        g.scale(i);
        g.strokeWeight(1 / i);
        g.triangle(-w / 2, 0, w / 2, 0, 0, -h / 2);
        g.pop();
        g.pop();
      }
      break;
    case 6:
      for (let i = 1; i > 0; i -= 1 / sep) {
        while (pc == c) {
          c = random(colors);
        }
        pc = c;
        g.push();
        g.fill(c);

        g.push();
        g.scale(i);
        g.strokeWeight(1 / i);
        g.triangle(0, 0, w * sqrt(2), 0, 0, h * sqrt(2));
        g.pop();

        g.push();
        g.translate(w, h);
        g.scale(i);
        g.strokeWeight(1 / i);
        g.arc(0, 0, -w * sqrt(2), 0, 0, -h * sqrt(2));
        g.pop();

        g.pop();
      }
      break;
    case 7:
      for (let i = 1; i > 0; i -= 1 / sep) {
        while (pc == c) {
          c = random(colors);
        }
        pc = c;
        g.push();
        g.translate(w / 2, h / 2);
        g.rotate(45);
        g.scale(i);
        g.strokeWeight(1 / i);
        g.fill(c);
        g.rectMode(CENTER);
        g.square(0, 0, sqrt(sq(w) + sq(h)));
        g.pop();
      }
      break;
  }
  g.pop();
}

function createPalette(_url) {
  let slash_index = _url.lastIndexOf("/");
  let pallate_str = _url.slice(slash_index + 1);
  let arr = pallate_str.split("-");
  for (let i = 0; i < arr.length; i++) {
    arr[i] = color("#" + arr[i]);
  }
  return arr;
}

function drawShape(cx, cy, r, nPhase) {
  push();
  translate(cx, cy, r);
  rotate(-90);
  let arr = [];
  beginShape();
  for (let angle = 0; angle < 180; angle += 1) {
    let nr = map(noise(cx, cy, angle / nPhase, r), 0, 1, (r * 1) / 8, r);
    nr = constrain(nr, 0, width / 2);
    arr.push(nr);
    let x = cos(angle) * nr;
    let y = sin(angle) * nr;
    vertex(x, y);
  }
  arr.reverse();
  for (let angle = 180; angle < 180 + 180; angle += 1) {
    let nr = arr[0];
    arr.shift();
    let x = cos(angle) * nr;
    let y = sin(angle) * nr;
    vertex(x, y);
  }
  endShape(CLOSE);

  pop();
}

let woodPalette = "6b3e2e-c38452-e3c099-a1785c-ccb494";

let url = [
  "202c39-283845-b8b08d-f2d492-f29559",
  "1f2041-4b3f72-ffc857-119da4-19647e",
  "2f4858-33658a-86bbd8-f6ae2d-f26419",
  "ffac81-ff928b-fec3a6-efe9ae-cdeac0",
  "f79256-fbd1a2-7dcfb6-00b2ca-1d4e89",
  "e27396-ea9ab2-efcfe3-eaf2d7-b3dee2",
  "966b9d-c98686-f2b880-fff4ec-e7cfbc",
  "50514f-f25f5c-ffe066-247ba0-70c1b3",
  "177e89-084c61-db3a34-ffc857-323031",
  "390099-9e0059-ff0054-ff5400-ffbd00",
  "0d3b66-faf0ca-f4d35e-ee964b-f95738",
  "177e89-084c61-db3a34-ffc857-323031",
  "780000-c1121f-fdf0d5-003049-669bbc",
  "eae4e9-fff1e6-fde2e4-fad2e1-e2ece9-bee1e6-f0efeb-dfe7fd-cddafd",
  "f94144-f3722c-f8961e-f9c74f-90be6d-43aa8b-577590",
  "555b6e-89b0ae-bee3db-faf9f9-ffd6ba",
  "9b5de5-f15bb5-fee440-00bbf9-00f5d4",
  "ef476f-ffd166-06d6a0-118ab2-073b4c",
  "006466-065a60-0b525b-144552-1b3a4b-212f45-272640-312244-3e1f47-4d194d",
  "f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1",
  "f6bd60-f7ede2-f5cac3-84a59d-f28482",
  "0081a7-00afb9-fdfcdc-fed9b7-f07167",
  "f4f1de-e07a5f-3d405b-81b29a-f2cc8f",
  "50514f-f25f5c-ffe066-247ba0-70c1b3",
  "001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226",
  "ef476f-ffd166-06d6a0-118ab2-073b4c",
  "fec5bb-fcd5ce-fae1dd-f8edeb-e8e8e4-d8e2dc-ece4db-ffe5d9-ffd7ba-fec89a",
  "e63946-f1faee-a8dadc-457b9d-1d3557",
  "264653-2a9d8f-e9c46a-f4a261-e76f51",
];
