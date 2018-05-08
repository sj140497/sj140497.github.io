        var t1Ctx = new (window.AudioContext || window.webkitAudioContext)();
        var t2Ctx = new (window.AudioContext || window.webkitAudioContext)();
        var source;
        var stream; 
        var t1GainNode;
        var t1Analyser;
        var t1Distortion;
        var t1LowshelfFilter;
        var t2GainNode;
        var t2Analyser;
        var t2Distortion;
        var t2LowshelfFilter;
        var stream1 = t1Ctx.createMediaStreamDestination();
        var recorder1 = new MediaRecorder(stream1.stream);
        
        t1DefaultRequest = new XMLHttpRequest();
        t1DefaultRequest.open('GET', 'https://raw.githubusercontent.com/sj140497/FinalYearDAW/master/Misc/rhcpVocal.mp3', true);
        t1DefaultRequest.responseType = 'arraybuffer';
        t1DefaultRequest.onload = function() {
            console.log("load");
            var data = t1DefaultRequest.response;
            t1InitAudio(data);
        };
        
        t2DefaultRequest = new XMLHttpRequest();
        t2DefaultRequest.open('GET', 'https://raw.githubusercontent.com/sj140497/FinalYearDAW/master/Misc/rhcpGuitar.mp3', true);
        t2DefaultRequest.responseType = 'arraybuffer';
        t2DefaultRequest.onload = function() {
            console.log("load");
            var data = t2DefaultRequest.response;
            t2InitAudio(data);
        };
        
        t1DefaultRequest.send();
        t2DefaultRequest.send();
        
        function makeDistortionCurve( amount ) {
        var k = typeof amount === 'number' ? amount : 50,
          n_samples = 44100,
          curve = new Float32Array(n_samples),
          deg = Math.PI / 180,
          i = 0,
          x;
        for ( ; i < n_samples; ++i ) {
          x = i * 2 / n_samples - 1;
          curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
      };
         
        var intendedWidth = document.querySelector('.wrapper').clientWidth;
        
        var t1Canvas = document.querySelector('.visualTrack1');
        var t1CanvasCtx = t1Canvas.getContext("2d");
        t1Canvas.setAttribute('width',intendedWidth);
        var t1DrawVisual;
        
        var t2Canvas = document.querySelector('.visualTrack2');
        var t2CanvasCtx = t2Canvas.getContext("2d");
        t2Canvas.setAttribute('width',intendedWidth);
        var t2DrawVisual;
        var t1DropArea = document.getElementById('t1DropArea');
        t1DropArea.addEventListener('drop', t1Drop, false);
        t1DropArea.addEventListener('dragover', dragOver, false);
        
        var t2DropArea = document.getElementById('t2DropArea');
        t2DropArea.addEventListener('drop', t2Drop, false);
        t2DropArea.addEventListener('dragover', dragOver, false);
        
        function t1InitAudio(data) {
        if(t1Ctx.state === 'running') {
               t1Ctx.close();
           }
        t1Ctx = new (window.AudioContext || window.webkitAudioContext)();
        source = t1Ctx.createBufferSource();
        stream1 = t1Ctx.createMediaStreamDestination();
        recorder1 = new MediaRecorder(stream1.stream);
        document.getElementById("t1Play").src='https://raw.githubusercontent.com/sj140497/FinalYearDAW/master/Misc/playButton.png';
        
        //Setting up nodes for track 1----------------------------
        t1GainNode = t1Ctx.createGain();
        t1GainNode.gain.value = 0.5;
        
        t1Analyser = t1Ctx.createAnalyser();
        t1Analyser.minDecibels = -90;
        t1Analyser.maxDecibels = -10;
        t1Analyser.smoothingTimeConstant = 0.85;
        
        t1Distortion = t1Ctx.createWaveShaper();
        
        t1LowshelfFilter = t1Ctx.createBiquadFilter();
        t1LowshelfFilter.type = "lowshelf";
        t1LowshelfFilter.frequency.value = 0;
        t1LowshelfFilter.gain.value = 25;
        //Finish setting up nodes for track 1------------------
        //Connecting nodes together for track 1
        t1GainNode.connect(t1LowshelfFilter);
        t1LowshelfFilter.connect(t1Distortion);
        t1Distortion.connect(t1Analyser);
        t1Analyser.connect(t1Ctx.destination);
        t1Analyser.connect(stream1);
        //Finish connecting nodes together for track 1
        
        if(t1Ctx.decodeAudioData) {
            t1Ctx.decodeAudioData(data, function(buffer) {
              t1Buffer = buffer;
              t1Source = t1Ctx.createBufferSource();
              t1Source.buffer = t1Buffer;
              t1Source.connect(t1GainNode);
              t1Source.loop = true;
              t1Source.start();             
              visualize(t1Canvas, t1CanvasCtx, t1Analyser, t1DrawVisual);
              t1Ctx.suspend();
            }, function(e){ console.log("Error with decoding audio data" + e.err);});
        };
        }
        
        function t2InitAudio(data) {
        if(t2Ctx.state === 'running') {
               t2Ctx.close();
           }
        t2Ctx = new (window.AudioContext || window.webkitAudioContext)();
        source = t2Ctx.createBufferSource();
        document.getElementById("t2Play").src='https://raw.githubusercontent.com/sj140497/FinalYearDAW/master/Misc/playButton.png';
        
        //Setting up nodes for track 2-----------------------
        t2GainNode = t2Ctx.createGain();
        t2GainNode.gain.value = 0.5;
        
        t2Analyser = t2Ctx.createAnalyser();
        t2Analyser.minDecibels = -90;
        t2Analyser.maxDecibels = -10;
        t2Analyser.smoothingTimeConstant = 0.85;
        
        t2Distortion = t2Ctx.createWaveShaper();
        
        t2LowshelfFilter = t2Ctx.createBiquadFilter();
        t2LowshelfFilter.type = "lowshelf";
        t2LowshelfFilter.frequency.value = 0;
        t2LowshelfFilter.gain.value = 25;
        //Finish setting up nodes for track 2--------------
        //Connecting nodes together for track 2
        t2GainNode.connect(t2LowshelfFilter);
        t2LowshelfFilter.connect(t2Distortion);
        t2Distortion.connect(t2Analyser);
        t2Analyser.connect(t2Ctx.destination);
        t2Ctx.suspend();
        //Finish connecting nodes together for track 2
        
        if(t2Ctx.decodeAudioData) {
            t2Ctx.decodeAudioData(data, function(buffer) {
              t2Buffer = buffer;
              t2Source = t2Ctx.createBufferSource();
              t2Source.buffer = t2Buffer;
              t2Source.connect(t2GainNode);
              t2Source.loop = true;
              t2Source.start();
              visualize(t2Canvas, t2CanvasCtx, t2Analyser, t2DrawVisual);
              
            }, function(e){ console.log("Error with decoding audio data" + e.err);});
        };
        }

        function t1Drop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var droppedFiles = evt.dataTransfer.files;
        var reader = new FileReader();
        reader.onload = function(fileEvent) {
            var data = fileEvent.target.result;
            t1InitAudio(data);
        };
        reader.readAsArrayBuffer(droppedFiles[0]);
        }
        
        function t2Drop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var droppedFiles = evt.dataTransfer.files;
        var reader = new FileReader();
        reader.onload = function(fileEvent) {
            var data = fileEvent.target.result;
            t2InitAudio(data);
        };
        reader.readAsArrayBuffer(droppedFiles[0]);
        }
    
        function dragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        return false;
        }
   
        function visualize(canvas, canvasCtx, analyser, drawVisual) {
        WIDTH = canvas.width;
        HEIGHT = canvas.height;
      
        analyser.fftSize = 256;
        var bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);
        var dataArray = new Uint8Array(bufferLength);
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        var draw = function() {
          //console.log("draw call");
          drawVisual = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          canvasCtx.fillStyle = 'rgb(0, 0, 0)';
          canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
          var barWidth = (WIDTH / bufferLength) * 2.5;
          var barHeight;
          var x = 0;
          
          for(var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i]/2;
            canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
            canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight);
            x += barWidth + 1;
          }
        };
        draw();
    }
    
    var record = document.getElementById('recordButton');
    var stop = document.getElementById('stopRecButton');
    
    record.addEventListener("click", function(e) {
        recorder1.start();
        console.log(recorder1.state);
    });
    
    var chunks = [];
    
    recorder1.ondataavailable = function(e) {
        console.log("push");
        chunks.push(e.data);
    };
    
    stop.addEventListener("click", function(e) {
        recorder1.stop();
        console.log(recorder1.state);
        
        console.log("recorder stopped");
        recorderStop();
    });

    function recorderStop() {
        console.log("onstop");
        var audio = document.createElement('audio');
        audio.controls = true;
        var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        audio.src = URL.createObjectURL(blob);
      };
    
        
        //Function to pause and resume current song onclick of button        
        function t1Play() {
            if(t1Ctx.state === 'running') {
                t1Ctx.suspend().then(function() {
                    document.getElementById("t1Play").src='https://raw.githubusercontent.com/sj140497/FinalYearDAW/master/Misc/playButton.png';
                });
            } else if(t1Ctx.state === 'suspended') {
                t1Ctx.resume().then(function() {
                    document.getElementById("t1Play").src='https://raw.githubusercontent.com/sj140497/FinalYearDAW/master/Misc/pauseButton.png';
                });
            }
        }
        
        function t2Play() {
            if(t2Ctx.state === 'running') {
                t2Ctx.suspend().then(function() {
                    document.getElementById("t2Play").src='https://raw.githubusercontent.com/sj140497/FinalYearDAW/master/Misc/playButton.png';
                });
            } else if(t2Ctx.state === 'suspended') {
                t2Ctx.resume().then(function() {
                    document.getElementById("t2Play").src='https://raw.githubusercontent.com/sj140497/FinalYearDAW/master/Misc/pauseButton.png';
                });
            }
        }
        //Pause and resume function end
              
        //functions to update values of volume/effects based on change in slider
        function t1ChangeVolume(val) {           
            t1GainNode.gain.value = val;
            document.getElementById('vc1Value').innerHTML = val;
        }
        
        function t1ChangeLow(val) {
            t1LowshelfFilter.frequency.value = val;
            document.getElementById('bc1Value').innerHTML = (val / 2);
        }
        
        function t1ChangeDistortion(val) {
            t1Distortion.curve = makeDistortionCurve(val * 5);
            document.getElementById('d1Value').innerHTML = (val);
        }
        
        function t2ChangeVolume(val) {           
            t2GainNode.gain.value = val;
            document.getElementById('vc2Value').innerHTML = val;
        }
        
        function t2ChangeLow(val) {
            t2LowshelfFilter.frequency.value = val;
            document.getElementById('bc2Value').innerHTML = (val / 2);
        }
        
        function t2ChangeDistortion(val) {
            t2Distortion.curve = makeDistortionCurve(val * 5);
            document.getElementById('d2Value').innerHTML = (val);
        }
     