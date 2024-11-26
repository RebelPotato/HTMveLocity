function h(tag, attrs, children) {
  const element = document.createElement(tag);
  if (attrs) {
    for (let key in attrs) {
      if (key.startsWith("on")) {
        element.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
      } else if (key === "style") {
        for (let styleKey in attrs[key]) {
          element.style[styleKey] = attrs[key][styleKey];
        }
      } else {
        element.setAttribute(key, attrs[key]);
      }
    }
  }
  if (children) {
    if (typeof children === "string") {
      element.innerHTML = children;
    } else {
      children.forEach((child) => {
        const el =
          typeof child === "string" ? document.createTextNode(child) : child;
        element.appendChild(el);
      });
    }
  }
  return element;
}

function fillIfEmpty(element) {
  const emojis = ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊"];
  if (element.innerHTML === "") {
    element.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
  }
}

function hasParent(element, parent) {
  if (element === parent) return true;
  if (element.parentElement) {
    return hasParent(element.parentElement, parent);
  }
  return false;
}

function blob() {
  const b = h(
    "span",
    {
      style: {
        "font-family": "'Courier New', Courier, monospace",
      },
    },
    [
      "a",
      h(
        "input",
        {
          type: "text",
          onkeydown: (ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              const text = ev.target.value;
              const newEl = h(text, {}, [text]);
              b.replaceWith(newEl);
              hv.deselect();
              hv.leave();
              hv.enter(newEl);
              hv.select(newEl);
              newEl.focus();
              const range = document.createRange();
              range.selectNodeContents(newEl);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            }
          },
        },
        []
      ),
      "please",
    ]
  );
  return b;
}

function prependTo(ref, el) {
  ref.parentElement.insertBefore(el, ref);
}
function appendTo(ref, el) {
  if (ref.nextSibling) {
    ref.parentElement.insertBefore(el, ref.nextSibling);
  } else {
    ref.parentElement.appendChild(el);
  }
}

const space = h("div", { class: "hv-space" }, []);
const buttons = [
  h(
    "button",
    {
      onclick: () => {
        const b = blob();
        appendTo(hv.over, b);
        hv.deselect();
        b.querySelector("input").focus();
      },
    },
    "append"
  ),
  h(
    "button",
    {
      onclick: () => {
        const b = blob();
        prependTo(hv.over, b);
        hv.deselect();
        b.querySelector("input").focus();
      },
    },
    "prepend"
  ),
  h(
    "button",
    {
      onclick: () => {
        hv.over.remove();
        hv.deselect();
        hv.leave();
      },
    },
    "remove"
  ),
];
const control = h("div", { class: "hv-control" }, [...buttons]);
const editor = h("pre", { class: "hv-editor" }, []);
const attributes = h("div", { class: "hv-attrs" }, [editor]);

const lane = (...els) => h("div", { class: "hv-lane" }, els);
const title = (name) => h("h1", { class: "hv-title" }, [name]);
const panel = h("div", { class: "hv-panel" }, [
  lane(title("HTMveLocity"), control),
  lane(title("Attributes"), attributes),
]);

function showOnPanel(el) {
  const acc = [`<${el.tagName.toLowerCase()}>`];
  const attrs = el.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    acc.push(`${attr.name} = ${attr.value}`);
  }
  editor.textContent = acc.join("\n");
}

function parseAttr(text) {
  const attrs = text
    .trim()
    .split("\n")
    .map((line) => line.split("=").map((part) => part.trim()));
  const acc = {};
  for (const [key, value] of attrs) {
    acc[key] = value;
  }
  return acc;
}

function onInput() {
  const last = editor.lastEdit;
  const now = editor.textContent;
  editor.lastEdit = now;

  const lastAttrs = parseAttr(last);
  const nowAttrs = parseAttr(now);

  for (const key in lastAttrs) {
    if (nowAttrs[key] === undefined) {
      hv.over.removeAttribute(key);
    } else if (nowAttrs[key] !== lastAttrs[key]) {
      hv.over.setAttribute(key, nowAttrs[key]);
    }
  }
  for (const key in nowAttrs) {
    if (lastAttrs[key] === undefined) {
      hv.over.setAttribute(key, nowAttrs[key]);
    }
  }
}

function edit(el) {
  buttons.forEach((button) => control.appendChild(button));
  editor.setAttribute("contenteditable", "true");
  editor.lastEdit = editor.textContent;
  editor.addEventListener("input", onInput);
}

function unedit() {
  buttons.forEach((button) => button.remove());
  editor.removeAttribute("contenteditable");
  editor.removeEventListener("input", onInput);
}

function unshow() {
  control.innerHTML = "";
  editor.textContent = "";
}
unshow();

const hv = {
  over: undefined,
  selected: false,
  on() {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("long-press", onPress);
    window.addEventListener("keydown", onKey);
    document.body.appendChild(panel);
    document.body.appendChild(space);
  },
  off() {
    hv.deselect();
    hv.leave();
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("long-press", onPress);
    window.addEventListener("keydown", onKey);
    document.body.removeChild(panel);
    document.body.removeChild(space);
  },
  select() {
    console.assert(hv.over !== undefined, hv);
    console.assert(hv.selected === false, hv);
    hv.over.classList.add("hv-selected");
    hv.over.setAttribute("contenteditable", "true");
    hv.over.setAttribute("tabindex", "0");
    hv.over.focus();
    hv.selected = true;
    edit(hv.over);
  },
  deselect() {
    console.assert(hv.over !== undefined, hv);
    hv.over.classList.remove("hv-selected");
    hv.over.removeAttribute("contenteditable");
    hv.over.removeAttribute("tabindex");
    hv.selected = false;
    unedit();
  },
  enter(el) {
    console.assert(hv.over === undefined, hv);
    hv.over = el;
    el.classList.add("hv-over");
    showOnPanel(el);
    fillIfEmpty(el);
  },
  leave() {
    console.assert(hv.selected === false, hv);
    if (hv.over) {
      hv.over.classList.remove("hv-over");
      fillIfEmpty(hv.over);
      hv.over = undefined;
      unshow();
    }
  },
};

function enterAt(x, y) {
  const element = document.elementFromPoint(x, y);
  if (
    element &&
    ![hv.over, space, panel, document.body].includes(element) &&
    !hasParent(element, panel) &&
    hasParent(element, document.body)
  ) {
    if (hv.selected) hv.deselect();
    hv.leave();
    hv.enter(element);
  }
}

function onMove(event) {
  if (hv.selected) return;
  enterAt(event.clientX, event.clientY);
}

function onPress(event) {
  if (!hv.over) return;
  fillIfEmpty(hv.over);
  event.preventDefault();
  hv.selected ? hv.deselect() : hv.select();
}

function insertElAtCaret(el) {
  const sel = window.getSelection();
  if (sel.getRangeAt && sel.rangeCount) {
    let range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(el);
  }
}

function onKey(event) {
  if (!hv.over) return;
  if (event.key === "Enter" && event.shiftKey) {
    event.preventDefault();
    hv.selected ? hv.deselect() : hv.select();
  } else if (event.key === "Enter" && event.ctrlKey) {
    const b = blob();
    appendTo(hv.over, b);
    hv.deselect();
    b.querySelector("input").focus();
  } else if (event.key === " " && event.shiftKey) {
    event.preventDefault();
    const b = blob();
    insertElAtCaret(b);
    hv.deselect();
    b.querySelector("input").focus();
  }
}

function unindentScript(text) {
  const lines = text.split("\n").slice(1);
  const spaces = lines.map((line) => line.match(/^\s*/)[0].length);
  const indent = Math.min(...spaces);
  return "\n" + lines.map((line) => line.slice(indent)).join("\n");
}

document.querySelectorAll(".hv-echo").forEach((script) => {
  script.textContent = unindentScript(script.textContent);
});

hv.on();

/*********************************************************/

/*!
 * long-press-event - v2.5.0
 * Pure JavaScript long-press-event
 * https://github.com/john-doherty/long-press-event
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */
!(function (e, t) {
  "use strict";
  var n = null,
    a =
      "PointerEvent" in e || (e.navigator && "msPointerEnabled" in e.navigator),
    i =
      "ontouchstart" in e ||
      navigator.MaxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0,
    o = a ? "pointerdown" : i ? "touchstart" : "mousedown",
    r = a ? "pointerup" : i ? "touchend" : "mouseup",
    m = a ? "pointermove" : i ? "touchmove" : "mousemove",
    u = a ? "pointerleave" : i ? "touchleave" : "mouseleave",
    s = 0,
    c = 0,
    l = 10,
    v = 10;
  function f(e) {
    p(),
      (e = (function (e) {
        if (void 0 !== e.changedTouches) return e.changedTouches[0];
        return e;
      })(e)),
      this.dispatchEvent(
        new CustomEvent("long-press", {
          bubbles: !0,
          cancelable: !0,
          detail: {
            clientX: e.clientX,
            clientY: e.clientY,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            pageX: e.pageX,
            pageY: e.pageY,
          },
          clientX: e.clientX,
          clientY: e.clientY,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          pageX: e.pageX,
          pageY: e.pageY,
          screenX: e.screenX,
          screenY: e.screenY,
        })
      ) ||
        t.addEventListener(
          "click",
          function e(n) {
            t.removeEventListener("click", e, !0),
              (function (e) {
                e.stopImmediatePropagation(),
                  e.preventDefault(),
                  e.stopPropagation();
              })(n);
          },
          !0
        );
  }
  function d(a) {
    p(a);
    var i = a.target,
      o = parseInt(
        (function (e, n, a) {
          for (; e && e !== t.documentElement; ) {
            var i = e.getAttribute(n);
            if (i) return i;
            e = e.parentNode;
          }
          return a;
        })(i, "data-long-press-delay", "500"),
        10
      );
    n = (function (t, n) {
      if (
        !(
          e.requestAnimationFrame ||
          e.webkitRequestAnimationFrame ||
          (e.mozRequestAnimationFrame && e.mozCancelRequestAnimationFrame) ||
          e.oRequestAnimationFrame ||
          e.msRequestAnimationFrame
        )
      )
        return e.setTimeout(t, n);
      var a = new Date().getTime(),
        i = {},
        o = function () {
          new Date().getTime() - a >= n
            ? t.call()
            : (i.value = requestAnimFrame(o));
        };
      return (i.value = requestAnimFrame(o)), i;
    })(f.bind(i, a), o);
  }
  function p(t) {
    var a;
    (a = n) &&
      (e.cancelAnimationFrame
        ? e.cancelAnimationFrame(a.value)
        : e.webkitCancelAnimationFrame
        ? e.webkitCancelAnimationFrame(a.value)
        : e.webkitCancelRequestAnimationFrame
        ? e.webkitCancelRequestAnimationFrame(a.value)
        : e.mozCancelRequestAnimationFrame
        ? e.mozCancelRequestAnimationFrame(a.value)
        : e.oCancelRequestAnimationFrame
        ? e.oCancelRequestAnimationFrame(a.value)
        : e.msCancelRequestAnimationFrame
        ? e.msCancelRequestAnimationFrame(a.value)
        : clearTimeout(a)),
      (n = null);
  }
  "function" != typeof e.CustomEvent &&
    ((e.CustomEvent = function (e, n) {
      n = n || { bubbles: !1, cancelable: !1, detail: void 0 };
      var a = t.createEvent("CustomEvent");
      return a.initCustomEvent(e, n.bubbles, n.cancelable, n.detail), a;
    }),
    (e.CustomEvent.prototype = e.Event.prototype)),
    (e.requestAnimFrame =
      e.requestAnimationFrame ||
      e.webkitRequestAnimationFrame ||
      e.mozRequestAnimationFrame ||
      e.oRequestAnimationFrame ||
      e.msRequestAnimationFrame ||
      function (t) {
        e.setTimeout(t, 1e3 / 60);
      }),
    t.addEventListener(r, p, !0),
    t.addEventListener(u, p, !0),
    t.addEventListener(
      m,
      function (e) {
        var t = Math.abs(s - e.clientX),
          n = Math.abs(c - e.clientY);
        (t >= l || n >= v) && p();
      },
      !0
    ),
    t.addEventListener("wheel", p, !0),
    t.addEventListener("scroll", p, !0),
    t.addEventListener("contextmenu", p, !0),
    t.addEventListener(
      o,
      function (e) {
        (s = e.clientX), (c = e.clientY), d(e);
      },
      !0
    );
})(window, document);
