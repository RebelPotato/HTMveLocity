export class KatexBlock extends HTMLElement {
  constructor() {
    super();
    this.expr = this.dataset.expr;
  }
  connectedCallback() {
    this.render();
  }
  render() {
    katex.render(this.expr, this, {
      displayMode: true,
    });
  }
}

export class KatexInline extends HTMLElement {
  constructor() {
    super();
    this.expr = this.dataset.expr;
  }
  connectedCallback() {
    this.render();
  }
  render() {
    katex.render(this.expr, this);
  }
}

export function fromBitmap(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const pixelArray = [];
  const sideLen = Math.round(
    Math.SQRT2 * Math.max(canvas.width, canvas.height)
  );
  const corner = {
    x: Math.round((sideLen - canvas.width) / 2),
    y: Math.round((sideLen - canvas.height) / 2),
  };

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const color = {
        x: x + corner.x,
        y: y + corner.y,
        r: pixels[index],
        g: pixels[index + 1],
        b: pixels[index + 2],
        a: pixels[index + 3],
      };
      // remove black pixels from image
      if (color.r == 0 && color.g == 0 && color.b == 0) continue;
      pixelArray.push(color);
    }
  }

  return {
    pixels: pixelArray,
    width: sideLen,
    height: sideLen,
  };
}

export function loadBitmap(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(fromBitmap(image));
    image.onerror = reject;
    image.src = src;
  });
}

export function svg(tag, obj) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(obj)) {
    element.setAttribute(key, value);
  }
  return element;
}

export function arrayToBase64(data) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = data.width;
  canvas.height = data.height;
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  data.pixels.forEach(pixel => {
    const index = (pixel.y * canvas.width + pixel.x) * 4;
    imageData.data[index] = pixel.r;
    imageData.data[index + 1] = pixel.g;
    imageData.data[index + 2] = pixel.b;
    imageData.data[index + 3] = pixel.a * 255;
  })
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function toSvg(data) {
  const viewBoxWidth = data.width;
  const viewBoxHeight = data.height;
  const result = svg("svg", {
    width: viewBoxWidth*10,
    height: viewBoxHeight*10,
    viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    style: "background-color: black;"
  });

  const image = svg("image", {
    href: arrayToBase64(data),
    width: viewBoxWidth, height: viewBoxHeight,
    style: "image-rendering: pixelated;"
  })
  result.appendChild(image)
  return result
}

// a clock that loops and alerts its phase
export class Clock {
  #on;
  constructor(toAlert) {
    this.start = Date.now();
    this.toAlert = toAlert;
    this.#on = false;
  }
  get isOn() {
    return this.#on;
  }
  set(fn) {
    this.toAlert = fn;
  }
  get now() {
    return Date.now() - this.start;
  }
  tick() {
    this.toAlert(this.now);
  }
  loop() {
    if(!this.#on) return;
    this.tick();
    requestAnimationFrame(() => this.loop());
  }
  on() {
    this.#on = true;
    this.loop();
  }
  off() {
    this.#on = false;
  }
}

export function shearX(data, x) {
  const {width, height} = data
  const midHeight = (height-1) / 2
  const newPixels = data.pixels.map(pixel => ({
    ...pixel,
    x: pixel.x + Math.round(x*(midHeight - pixel.y))
  }))
  return {width, height, pixels: newPixels}
}

export function shearY(data, y) {
  const {width, height} = data
  const midWidth = (width-1) / 2
  const newPixels = data.pixels.map(pixel => ({
    ...pixel,
    y: pixel.y + Math.round(y*(midWidth - pixel.x))
  }))
  return {width, height, pixels: newPixels}
}

function flipXY(data) {
  return {
    ...data, 
    pixels: data.pixels.map(pixel => ({
      ...pixel, 
      x: data.width - 1 - pixel.x, 
      y: data.height - 1 - pixel.y
  }))}
}

export function rotate(data, theta) {
  // put theta into 0 - 2PI range
  const TAU = Math.PI * 2
  theta = (theta % TAU + TAU) % TAU
  if(theta >= Math.PI * 3 / 2) theta = theta - TAU
  else if(theta > Math.PI / 2) data = flipXY(data), theta = theta - Math.PI
  const data1 = shearX(data, -Math.tan(theta/2))
  const data2 = shearY(data1, Math.sin(theta))
  const data3 = shearX(data2, -Math.tan(theta/2))
  return data3
}