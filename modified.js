const $bg = document.getElementById("bg");
const $maskNum = document.getElementById("maskNum");

$maskNum.value = seed;

function updateFormVars() {
  drawBg = !$bg.checked;
}

function changePalette() {
  updateFormVars();
  shuffleRnd(url);
  draw();
}

function shuffleColors() {
  updateFormVars();
  draw();
}

function changeMask() {
  if ($maskNum.value != seed) {
    history.pushState(null, "mask #" + $maskNum.value, "#" + $maskNum.value);
    document.location.reload();
  }
}
