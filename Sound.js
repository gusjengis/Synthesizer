var graph = document.getElementById("graph");
graph.width = document.documentElement.clientWidth - 20;
graph.height = 300;
var draw = graph.getContext("2d");
drawGrid();
var type;
var frequency;
var type;
var x;
var y;
var formulaArray = [];
var formula = "";
var noiseArray = [];
var scale = 200;
var started = false;
var timeOffset = 0;
var framerate = 144;
var pause = false;
var clear = document.getElementById("clearButton");
var oscilloscope = document.getElementById("oscilloscopeButton");
oscilloscope.style.visibility = "hidden";
var oscilloscopeMode = true;
toggleOscilloscope();

function drawGrid(){
    draw.strokeStyle = "#ffffff";
    draw.clearRect(0, 0, graph.width, graph.height);
    if(oscilloscopeMode == false){
        draw.beginPath();
        draw.moveTo(0,graph.height/2);
        draw.lineTo(graph.width,graph.height/2);
        draw.stroke();
        draw.stroke();
    } else if(oscilloscopeMode == true){
        draw.beginPath();
        draw.moveTo(graph.width/2,graph.height/2);
        draw.lineTo(graph.width,graph.height/2);
        draw.stroke();
        draw.stroke();
    }
    draw.strokeStyle = "#ff0000";
}
function drawCartesian(){
    for(l=timeOffset;l<graph.width+timeOffset;l++){
        x = (l)/scale;
        draw.lineTo(l-timeOffset,(graph.height/2)-eval(formula)*100);
    }
}
function drawOscilloscope(){
    for(l=0; l<110; l=l+pi/500){
        x=l;
        m=(2+eval(formula))*scale;
        polToCart(m,(l-(pi*timeOffset/180))*scale);
        draw.lineTo(graph.width/2+x,graph.height/2-y);
    }
}
function drawGraph(){
    drawGrid();
    formula = "";
    for(q=0;q<formulaArray.length;q++){
        formula = formula + " + " + formulaArray[q];
    }
    formula = "(" + formula + ")/" + formulaArray.length;
    draw.beginPath();
    if(oscilloscopeMode == false){
        drawCartesian();
    } else {
        drawOscilloscope();
    }
    draw.stroke();
    draw.stroke();
}
function keypress(e) {
    if (e.keyCode == 13){
        playSound();
        started = true;
    }
    if (e.keyCode == 32){
        if(pause == true){
            pause = false;
            for(q=0;q<noiseArray.length;q++){
                noiseArray[q].o.start(0);
            }
        } else {
            pause = true;
            for(q=0;q<noiseArray.length;q++){
                noiseArray[q].o.stop();
            }
        }
    }
}
document.onkeypress = keypress;
clear.onclick = function(){
    for(q=0;q<noiseArray.length;q++){
        noiseArray[q].o.stop();
    }
    noiseArray.length = 0;
    formulaArray.length = 0;
    started = false;
    timeOffset = 0
    drawGrid();
}
function toggleOscilloscope(){
    if(oscilloscopeMode == false){
        oscilloscopeMode = true;
        graph.height = document.documentElement.clientHeight - 65;
    } else {
        oscilloscopeMode = false;
        graph.height = 300;
    }
    graph.width = document.documentElement.clientWidth - 20;
    drawGrid();

}
oscilloscope.onclick = function() {
    toggleOscilloscope();
}

function sound(){
    this.context = new AudioContext()
    this.o = this.context.createOscillator()
    this.g = this.context.createGain()
    this.o.connect(this.g)
    this.g.connect(this.context.destination)
}

function playSound(){
    type = document.getElementById("type");
    if(type.value == ""){
        type.value = "sine";
    }
    frequency = document.getElementById("formula");
    if(type.value == "sine"){
        formulaArray.push("sin("+frequency.value+"*x*2*pi)");
    }
    if(type.value == "square"){
        formulaArray.push("2*floor(sin("+frequency.value+"*x*2*pi)/2)+1");
    }
    if(type.value == "sawtooth"){
        formulaArray.push("2*(x*"+frequency.value+"/60-floor(x*"+frequency.value+"/60+0.5))");
    }
    if(type.value == "triangle"){
        formulaArray.push("-1**(floor(2*x*"+frequency.value+"))*x-(x-1)");
    }
    this.noise = new sound();
    this.noise.o.type = type.value;
    this.noise.o.frequency.value = frequency.value;
    noiseArray.push(this.noise);
    noiseArray[noiseArray.length - 1].o.start(0);
    //this.noise.g.gain.exponentialRampToValueAtTime(0.00001, this.noise.context.currentTime + 5);
}
setInterval(function(){
    if(started == true){
        drawGraph();
        if(pause == false){
            timeOffset = timeOffset + scale/(2*framerate/100);
        }
    }
}, 1000/framerate);