var getSubmitButton=function(){
  return document.getElementsByName("submitSync")[0];
}

var getInitialFileTextArea=function(){
  return document.getElementsByName("subtitleFile")[0];
}

var getResultFileTextArea=function(){
  return document.getElementsByName("syncedFile")[0];
}
var getHoursToSync=function(){
  return document.getElementsByName("hoursToSync")[0].value;
}

var getMinToSync=function(){
  return document.getElementsByName("minToSync")[0].value;
}

var getSecToSync=function(){
  return document.getElementsByName("secToSync")[0].value;
}

var getMsToSync=function(){
  return document.getElementsByName("msToSync")[0].value;
}

getDirectionToSync=function(){
  return document.getElementsByName("directionToSync")[0].value;
}

var getInputFilenameElement=function(){
  return document.getElementsByClassName('import-filename')[0];
}

var getInputFileElement=function(){
  return document.getElementsByClassName('import-file')[0];
}

var listenBlurInputNumber=function(){
  var inputsNumber=document.querySelectorAll('input[type="number"]');
  for (var i = 0; i < inputsNumber.length; i++) {
    var maxValue=inputsNumber[i].max;
    inputsNumber[i].addEventListener("blur",controlValue);
  }
}

var controlValue=function(event) {
  var intValue=parseInt(event.target.value);
  if(intValue>event.target.max){
    event.target.value=event.target.max;
  }else if(event.target.value[0]=="0" && event.target.value.length>0){
    event.target.value=intValue;
  }else if(!event.target.value){
    event.target.value=0;
  }
}


var listenSubmit=function(){
  var button = getSubmitButton();
  button.addEventListener("click",syncFile);
}

var syncFile=function(event){
    var initialText=getInitialFileTextArea();
    var resultTextArea=getResultFileTextArea();
    try{
      resultTextArea.value=shiftDateSrtFile(initialText.value);
    }catch(error){
      alert(error.message);
    }
    event.preventDefault();
    return false;   //event.stopPropagation();
}

var shiftDateSrtFile=function(inputFile){

  try{

    var outputfile="";
    if(inputFile.length==0){
      throw new Error("emptyFile");
    }

    var subtitles=inputFile.split("\n\n");
    for (var i = 0; i < subtitles.length; i++) {
      var subSrtFormat=subtitles[i].split("\n");
      if(subSrtFormat.length<3 || subSrtFormat.length>4){
        throw new Error("errorFormatSrt");
      }
      var subtitleTime = subSrtFormat[1];
      subSrtFormat[1]=shiftSubtitleTimeSrt(subtitleTime);
      subtitles[i]=subSrtFormat.join("\n");
    }
    outputfile=subtitles.join("\n\n");
    return outputfile;
  }catch(error){
    throw error;
  }
}

var shiftSubtitleTimeSrt=function(subtitleTime){
  try{
    var times=subtitleTime.split(" --> ");
    for (var i = 0; i < times.length; i++) {
      times[i]=shiftTimeSrt(times[i]);
    }
    subtitleTime=times.join(" --> ");
  return subtitleTime;
  }catch(error){
    throw error;
  }
}

var shiftTimeSrt=function(time){
  var direction=getDirectionToSync();
  var hoursToSync=getHoursToSync();
  var minsToSync=getMinToSync();
  var secToSync=getSecToSync();
  var msToSync=getMsToSync();
  // time=01:58:25,230
  var msToSync = convertTimeToMs(hoursToSync,minsToSync,secToSync,msToSync);

  var timeInfo=time.split(",")[0].split(":");
  var timeHours=timeInfo[0];
  var timeMin=timeInfo[1];
  var timeSec=timeInfo[2];
  var timeMs=time.split(",")[1];

  var timeInMs = convertTimeToMs(timeHours,timeMin,timeSec,timeMs);

  if(direction==="+"){
    timeInMs+=msToSync;
  }else{
    timeInMs-=msToSync;
  }

  if(timeInMs<0){
    throw new Error("negative time");
  }

  return newTime= convertMsToTime(timeInMs);
}

var convertTimeToMs=function(hours,min,sec,ms){
  var ms = Number(hours) * 60 * 60 * 1000 + Number(min) * 60 * 1000+ Number(sec) * 1000+Number(ms);
  return ms;
}

var convertMsToTime=function(duration) {
  var milliseconds = parseInt(duration % 1000),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "," + milliseconds;
}

var listenDownloadButton=function(){
  document.getElementsByName("downloadButton")[0].addEventListener("click", function(){
      var content =getResultFileTextArea().value;
      var filename = "generatedSubtitle.srt";

      download(filename, content);
  }, false);
}

function download(filename, content) {
    var element = document.createElement('a');

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('downloadButton', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    if (document.createEvent) {
          var event = document.createEvent('MouseEvents');
          event.initEvent('click', true, true);
          element.dispatchEvent(event);
      }
      else {
          element.click();
      }
    document.body.removeChild(element);
}

var listenButtonImport= function(){
  inputFile=getInputFileElement();
  inputFile.addEventListener('change', function (event) {

    var reader = new FileReader();
    reader.onload = (function(file){
         return function(event)
         {
             getInputFilenameElement().textContent=file.name;
             getInitialFileTextArea().value= event.target.result;
         }
     })(event.target.files[0]);
     reader.readAsText(event.target.files[0], 'ISO-8859-1');

  });
};

listenSubmit();
listenBlurInputNumber();
listenDownloadButton();
listenButtonImport();
