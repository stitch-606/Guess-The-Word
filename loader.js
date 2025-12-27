(function () {
  // Lightweight loader wrapper for the spiral animation.
  var running = false;
  var timerId = null;
  var createdCanvas = false;
  var canvas = null;
  var ctx = null;

  var defaults = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio || 1
  };

  function ensureCanvas() {
    canvas = document.getElementById('scene');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'scene';
      canvas.className = 'loader-canvas';
      document.body.appendChild(canvas);
      createdCanvas = true;
    }

    var w = defaults.width;
    var h = defaults.height;
    var dpr = defaults.dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx = canvas.getContext('2d');
    if (dpr !== 1) ctx.scale(dpr, dpr);

    // center and scale based on canvas size (so animation appears in the true center)
    xScreenOffset = w / 2;
    yScreenOffset = h / 2;
    xScreenScale = w * 0.72; // maintain same relative scale as original
    yScreenScale = h * 0.72;
  }

  // --- The animation code ---
  var thetaMin = 0;
  var thetaMax = 6 * Math.PI;
  var period = 5;
  var lineSpacing = 1 / 30;
  var lineLength = lineSpacing / 2;
  var yScreenOffset = 300;
  var xScreenOffset = 260;
  var xScreenScale = 360;
  var yScreenScale = 360;
  var yCamera = 2;
  var zCamera = -3;

  var rate = 1 / (2 * Math.PI);
  var factor = rate / 3;

  var spirals;

  function Spiral(config) {
    var offset = 0;
    var lineSegments = computeLineSegments();

    this.render = function () {
      offset -= 1;
      if (offset <= -period) offset += period;
      lineSegments[offset].forEach(drawLineSegment);
    };

    function drawLineSegment(segment) {
      stroke(config.foreground, segment.start.alpha);
      ctx.moveTo(segment.start.x, segment.start.y);
      ctx.lineTo(segment.end.x, segment.end.y);
    }

    function computeLineSegments() {
      var lineSegments = {};
      var f = config.factor;
      var thetaNew, thetaOld;
      for (var offset = 0; offset > -period; offset--) {
        lineSegments[offset] = (lines = []);
        for (var theta = thetaMin + getThetaChangeRate(thetaMin, offset * lineSpacing / period, rate, f); theta < thetaMax; theta += getThetaChangeRate(theta, lineSpacing, rate, f)) {
          thetaOld = theta >= thetaMin ? theta : thetaMin;
          thetaNew = theta + getThetaChangeRate(theta, lineLength, rate, f);
          if (thetaNew <= thetaMin) continue;
          lines.push({
            start: getPointByAngle(thetaOld, f, config.angleOffset, rate),
            end: getPointByAngle(thetaNew, f, config.angleOffset, rate)
          });
        }
      }
      return lineSegments;
    }
  }

  function initSpirals() {
    spirals = [
      new Spiral({ foreground: '#f7f4f4ff', angleOffset: Math.PI * 0.92, factor: 0.90 * factor }),
      new Spiral({ foreground: '#0aeb7aff', angleOffset: -Math.PI * 0.08, factor: 0.90 * factor }),
      new Spiral({ foreground: '#fa0b0bff', angleOffset: Math.PI * 0.95, factor: 0.93 * factor }),
      new Spiral({ foreground: '#003322', angleOffset: -Math.PI * 0.05, factor: 0.93 * factor }),
      new Spiral({ foreground: '#0ca018ff', angleOffset: Math.PI, factor: factor }),
      new Spiral({ foreground: '#09ff00ff', angleOffset: 0, factor: factor })
    ];
  }

  function renderFrame() {
    if (!running) return;
    timerId = setTimeout(renderFrame, 1000 / 24);
    if (!ctx) return;
    ctx.clearRect(0, 0, defaults.width, defaults.height);
    ctx.beginPath();
    spirals.forEach(function (s) { s.render(); });
    ctx.globalAlpha = 1;
    ctx.stroke();
  }

  function stroke(color, alpha) {
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
  }

  function getPointByAngle(theta, factor, angleOffset, rate) {
    var x = theta * factor * Math.cos(theta + angleOffset);
    var z = -theta * factor * Math.sin(theta + angleOffset);
    var y = rate * theta;
    var point = projectTo2d(x, y, z);
    point.alpha = Math.atan((y * factor / rate * 0.1 + 0.02 - z) * 40) * 0.35 + 0.65;
    return point;
  }

  function getThetaChangeRate(theta, lineLength, rate, factor) {
    return lineLength / Math.sqrt(rate * rate + factor * factor * theta * theta);
  }

  function projectTo2d(x, y, z) {
    return {
      x: xScreenOffset + xScreenScale * x / (z - zCamera),
      y: yScreenOffset + yScreenScale * ((y - yCamera) / (z - zCamera))
    };
  }

  function start() {
    if (running) return;
    ensureCanvas();
    initSpirals();
    running = true;
    renderFrame();
  }

  function stop() {
    running = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (createdCanvas && canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
      createdCanvas = false;
    }
  }

  window.Loader = { start: start, stop: stop };
})();