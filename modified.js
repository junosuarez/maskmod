const $bg = document.getElementById("bgInput");
const $wood = document.getElementById("woodInput");
const $maskNum = document.getElementById("maskNum");
const $opensea = document.getElementById("opensea");

$maskNum.value = seed;
// we can't directly link unless we build up an index between the mask number in the name and the "collection id" opensea uses for their direct urls... so we build a search query
$opensea.href =
  "https://opensea.io/assets/generativemasks?search[query]=%22%23" +
  seed +
  "%20%22&search[sortAscending]=true&search[sortBy]=CREATED_DATE&search[resultModel]=ASSETS";

function updateFormVars() {
  drawBg = !$bg.checked;
  wood = $wood.checked;
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
