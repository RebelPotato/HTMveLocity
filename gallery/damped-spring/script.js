console.log("Hello, World!");


document.addEventListener('DOMContentLoaded', function() {
    let startButton = document.getElementById('demo-button');
    let rectangle = document.getElementById('demo');
  
    startButton.addEventListener('click', function() {
      rectangle.style.animationPlayState = 'running';
      startButton.disabled = true;
    });
  });



const start = 0;
const end = 4 * Math.PI;
const step = 0.01;

function myfun(t) {
  //return Math.sin(x);     //edit the funtion here
  return (Math.pow(Math.E, -t / 2) * (15 * Math.cos((Math.pow(15, (1 / 2)) * t / 2)) + Math.pow(15, (1 / 2) * Math.sin((Math.pow(15, (1 / 2)) * t) / 2)))) / 3;
}

function myfun2(t) {
  return 2*Math.cos(3*t);     // change 5 to 2
}

function myfun3(t) {
  return 0.05*(Math.pow(Math.E,0.5*t)*(5*Math.cos(Math.sqrt(35)/2*t)-Math.sqrt(35)/7*Math.sin(Math.sqrt(35)/2*t)));
}

function myfun4(t) {
  return 0.0005*(Math.pow(Math.E,(4-Math.sqrt(7))*t)*(10*Math.sqrt(7)/7+2.5)+Math.pow(Math.E,(4+Math.sqrt(7))*t)*(-10*Math.sqrt(7)/7+2.5));
}

// const plotdata = [];
// for (let x = start; x <= end; x += step) {
//   const y = myfun(x);
//   plotdata.push({
//     X: x,
//     Y: y,
//   });
// }

function clearElement(element) {
  element.innerHTML = '';
}

function t(text) {
  return document.createTextNode(text);
}

function h(tag, attribute, children) {
  const element = document.createElement(tag);
  if (attribute) {
    Object.keys(attribute).forEach(key => {
      element.setAttribute(key, attribute[key]);
    });
  }
  if (children) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(t(child));
      } else {
        element.appendChild(child);
      }
    });
  }
  return element;
}


document.addEventListener('DOMContentLoaded', function () {

  //   var counter = 0;

  //   setInterval(updateCounter, 10);

  //   function updateCounter() {
  //     counter += 1;
  //     console.log(counter);
  //   }

  function makeAnimation(myfun, root) {
    // var rectangle = h('div', { class: 'rectangle' });
    // root.appendChild(rectangle);
    var startButton = h('button', { class: 'start-button' }, ['Play']);
    root.appendChild(startButton);
    var rectangle = startButton;
    var container = h('div', { class: 'plot-container' });
    root.appendChild(container);
    var amplitude = 200;
    var phase = 0;
    var isAnimating = false;

    // data preparation
    const plotdata = [];
    for (let x = start; x <= end; x += step) {
      const y = myfun(x);
      plotdata.push({
        X: x,
        Y: y,
      });
    }


    function drawRectangle(t) {
      // plotting
      var sin_till_now = plotdata.slice(0, phase * 100);

      // console.log("sin");
      // console.log(sin_till_now);

      const sinx = Plot.plot({
        marks: [
          Plot.ruleY([0]),
          Plot.ruleX([0]),
          Plot.lineY(sin_till_now, { x: "X", y: "Y", stroke: "red", strokeWidth: 4 })
        ]
      })
      // console.log(sinx.prototype);
      // sinx.setAttribute('id', 'sinx' + counter);
      // var parentNode = document.getElementById('plot-container');
      // var childNodes = parentNode.childNodes;
      // var lastChildIndex = childNodes.length - 1;
      // parentNode.removeChild(childNodes[lastChildIndex]);
      // document.getElementById('plot-container').removeChild(sinx);

      // console.log(document.getElementById('plot-container'));
      clearElement(container);
      container.appendChild(sinx);
      // document.getElementById('plot-container').removeChild(document.getElementById('plot-container').firstChild);

      //draw animation
      if (!isAnimating) return;
      if (phase > end) return;
      // if (phase%10 == 0) console.log(phase);

      var currentX = (1 + myfun(phase)) * amplitude;
      rectangle.style.left = currentX + 'px';
      phase += 0.01;          // change speed here!!
    }
    var drawIntervalId = null;
    function startAnimation() {
      isAnimating = true;
      drawIntervalId = setInterval(drawRectangle, 10);
    }

    //   function stopAnimation() {
    //     isAnimating = false;
    //     clearInterval(drawIntervalId);
    //   }

    startButton.addEventListener('click', function () {
      // console.log(phase);
      // if (isAnimating) {
      //   stopAnimation();
      // } else {
      //   startAnimation();
      // }
      startAnimation();
      startButton.disabled = true;
    });
  }

  const roots = document.querySelectorAll('.animation');
  console.log(roots)
  makeAnimation(myfun, roots[0]);
  makeAnimation(myfun2, roots[1]);
  makeAnimation(myfun3, roots[2]);
  makeAnimation(myfun4, roots[3]);
})

// document.addEventListener('DOMContentLoaded', function() {
//   var button = document.getElementById('start-button');
//   var Text1 = 'start';
//   var Text2 = 'stop';
//   var currentText = Text1;

//   button.addEventListener('click', function() {
//     if (currentText === 'start') {
//       currentText = 'stop';
//       button.textContent = currentText;
//     } else {
//       currentText = 'start';
//       button.textContent = currentText;
//     }
//   });
// });

