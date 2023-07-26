// ------------------------------------------- Global Declarations ------------------------------------------

var k;
var p;
var sigChoice;
var scaleChoice;
var delayChoice;
var boxChoice;
var yValues;
var inValues;
var numberofsignals = 0;
var uniquenumberofsignals = 0;
var always;

// -------------------------------------------- Open Tabs ----------------------------------------------------

function openPart(evt, name) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
}

// ------------------------------------------ Screen Scale --------------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
    // Set the initial scale to zoom out the mobile screen
    adjustViewportScale(1.5); // You can adjust the scale value as needed
  });
  
  function adjustViewportScale(scaleValue) {
    const viewportMetaTag = document.querySelector('meta[name="viewport"]');
    if (viewportMetaTag) {
      viewportMetaTag.setAttribute('content', `width=device-width, initial-scale=${scaleValue}`);
    }
  }

// --------------------------------------- Add dynamic boxes --------------------------------------------------

function add_field()
{
    if(uniquenumberofsignals>=10)
    {
        return;
    }
    numberofsignals += 1;
    uniquenumberofsignals += 1;
  document.getElementById("field_div").innerHTML=document.getElementById("field_div").innerHTML+
  "<p id='input_num"+numberofsignals+"_wrapper'><input type='number' class='input_text' id='dyn_fundamental_"+numberofsignals+"' placeholder='Enter Fundamental'><input type='text' class='input_text' id='dyn_harmonics_"+numberofsignals+"' placeholder='Enter Harmonics'><input type='text' class='input_text' id='dyn_amps_"+numberofsignals+"' placeholder='Enter Amplitudes'><input type='number' class='input_text' id='dyn_duration_"+numberofsignals+"' placeholder='Enter Duration'><input type='button' value='Remove' onclick=remove_field('input_num"+numberofsignals+"');></p>";
}
function remove_field(id1)
{
    uniquenumberofsignals -= 1;
    const element = document.getElementById(id1+"_wrapper");
    element.remove();
}

// ------------------------------------------ Play audio ----------------------------------------------------------

function playSound(array, sampleRate) {
    // We have to start with creating AudioContext
    const audioContext = new AudioContext({sampleRate});
    // create audio buffer of the same length as our array
    const audioBuffer = audioContext.createBuffer(1, array.length, sampleRate);
    var arr = new Float32Array(array)
    // this copies our sine wave to the audio buffer
    audioBuffer.copyToChannel(arr, 0);
    const source = audioContext.createBufferSource();
    source.connect(audioContext.destination);
    source.buffer = audioBuffer;
    source.start();
  }

function sineWaveAt(sampleNumber, tone, Fs) {
  var sampleFreq = Fs/tone
  return Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2)))
}

// ---------------------------------------------- FFT --------------------------------------------------------------

function fourier(waveform){
    var N = waveform.length;
    var ft = [];
    
    for(var k=0; k<N; k++)
    {
        var sum = math.complex(0,0);
        for(var n=0; n<N; n++)
        {
            sum = math.add(sum,(math.multiply(waveform[n],math.complex(Math.cos(2*Math.PI*k*n/N),-Math.sin(2*Math.PI*k*n/N)))));
        }
        if(math.re(sum)<1e-10)
        {
            var sum1 = math.complex(0,math.im(sum));
            sum = sum1;
        }
        if(math.im(sum)<1e-10)
        {
            var sum1 = math.complex(math.re(sum),0);
            sum = sum1;
        }
        ft.push(sum);
    }
    return ft;
}

function invFourier(waveform){
    var N = waveform.length;
    var ft = [];
    
    for(var k=0; k<N; k++)
    {
        var sum = math.complex(0,0);
        for(var n=0; n<N; n++)
        {
            sum = math.add(sum,math.complex(math.re(waveform[n])*Math.cos(2*Math.PI*k*n/N)/N - math.im(waveform[n])*Math.sin(2*Math.PI*k*n/N)/N,math.re(waveform[n])*Math.sin(2*Math.PI*k*n/N)/N + math.im(waveform[n])*Math.cos(2*Math.PI*k*n/N)/N));
        }
        if(math.re(sum)<1e-10)
        {
            var sum1 = math.complex(0,math.im(sum));
            sum = sum1;
        }
        if(math.im(sum)<1e-10)
        {
            var sum1 = math.complex(math.re(sum),0);
            sum = sum1;
        }
        ft.push(sum);
    }
    return ft;
}

function shift(signal){
    var N = signal.length;
    var cut = parseInt(N/2);
    var out = [];
    for(var i=cut+1; i<N; i++)
    {
        out.push(signal[i]);
    }
    for(var i=0; i<=cut; i++)
    {
        out.push(signal[i]);
    }
    return out;
}

// ----------------------------------- Play Tones ---------------------------------------------

function playToneInit(){
    var Fs = 44100;
    var f0 = document.getElementById("fillSec12").value;
    f0 = parseInt(f0);
    var volume = document.getElementById("fillSec13").value;
    volume = parseFloat(volume);
    if(volume>1)
    {
        volume = 1;
    }
    else if(volume<0)
    {
        volume = 0;
    }

    var xValues = [];

    var arr = [],
    seconds = 1,
    tone = 10

    for (var i = 0; i < Fs * seconds; i++) {
        arr[i] = sineWaveAt(i, tone, Fs) * volume
        xValues[i] = i / (Fs)
    }
    
    var yValues = arr;
    always = arr;
    /*
    var transOr = fourier(arr);
    var trans = shift(transOr);
    var wValues = [];
    var N = arr.length;
    var ampSpec = [];
    var maxA = 0;
    wValues = makeArr(-Math.PI,Math.PI,N);
    for(var i=0; i<N; i++)
    {
        var t = math.sqrt(math.pow(math.re(trans[i]),2)+math.pow(math.im(trans[i]),2));
        if(t>maxA)
        {
            maxA = t;
        }
        ampSpec.push(t);
    }*/
    
    var trace1 = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'line'
    };
      
    var data = [trace1];

    var config = {responsive: true}
    var layout = {
        title: 'Sinusoidal Tone',
        showlegend: false,
        xaxis: {
            title: 'Time (Seconds)'
        },
        yaxis: {
            title: 'Amplitude (A)'
        }
    };
      
    Plotly.newPlot('figure1', data, layout, config);
    
    if(screen.width < 400)
    {
        var update = {
            width: 0.87*screen.width,
            height: 400
        };
    }
    else
    {
        var update = {
            width: 500,
            height: 400
        };
    }

    Plotly.relayout('figure1', update);
    
    /*
    var trace1 = {
        x: xValues,
        y: yValues,
        type: 'scatter'
    };

    var trace2 = {
        x: wValues,
        y: ampSpec,
        xaxis: 'x2',
        yaxis: 'y2',
        type: 'scatter'
    };
          
    var data = [trace1, trace2];
    
    var config = {responsive: true}
    
    var layout = {
        title: '',
        showlegend: false,
        grid: {rows: 1, columns: 2, pattern: 'independent'},
        xaxis: {
            title: 'Time (t)'
        },
        yaxis: {
            title: 'Amplitude (A)'
        },
        xaxis2: {
            title: 'Frequency (w)'
        },
        yaxis2: {
            title: 'Amplitude (A)'
        },
        annotations: [{
        text: "Time Domain",
        font: {
            size: 16,
        },
        showarrow: false,
        align: 'center',
        x: 0,
        y: volume+0.1,
        xref: 'x',
        yref: 'y',
    },
    {
        text: "Amplitude Spectrum",
        font: {
            size: 16,
        },
        showarrow: false,
        align: 'center',
        x: 0,
        y: maxA+0.1,
        xref: 'x2',
        yref: 'y2',
    }]
    };
    Plotly.newPlot('figure1', data, layout, config);
      var update = {
        width: 500,
        height: 400
    };
    Plotly.relayout('figure1', update);
    */
}

function playTone(){
    var sel = document.getElementById("boxSec11").value;
    sel = parseInt(sel);
    var Fs = 44100;
    if(sel==1)
    {
        Fs = 8000;
    }
    else if(sel==2)
    {
        Fs = 16000;
    }
    else if(sel==3)
    {
        Fs = 32000;
    }
    else if(sel==4)
    {
        Fs = 44100;
    }
    else if(sel==5)
    {
        Fs = 48000;
    }
    else if(sel==6)
    {
        Fs = 88200;
    }
    else if(sel==7)
    {
        Fs = 96000;
    }

    if(Fs<3000)
    {
        Fs = 3000;
    }
    else if(Fs>768000)
    {
        Fs = 768000;
    }
    var f0 = document.getElementById("fillSec12").value;
    f0 = parseInt(f0);

    var volume = document.getElementById("fillSec13").value;
    volume = parseFloat(volume);
    if(volume>1)
    {
        volume = 1;
    }
    else if(volume<0)
    {
        volume = 0;
    }

    var xValues = [];

    var arr = [],
    seconds = 1,
    tone = f0

    for (var i = 0; i < Fs * seconds; i++) {
        arr[i] = sineWaveAt(i, tone, Fs) * volume
        xValues[i] = i*10 / (tone*Fs / (Math.PI * 2))
    }

    var yValues = [];

    for(var i=0; i<Fs*seconds; i++)
    {
        yValues.push(always[i]*volume*2);
    }

    var trace1 = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'line'
    };
      
    var data = [trace1];

    var config = {responsive: true}
    var layout = {
        title: 'Sinusoidal Tone',
        showlegend: false,
        xaxis: {
            title: 'Time (Seconds)'
        },
        yaxis: {
            title: 'Amplitude (A)'
        }
    };
      
    Plotly.newPlot('figure1', data, layout, config);
    
    if(screen.width < 400)
    {
        var update = {
            width: 0.87*screen.width,
            height: 400
        };
    }
    else
    {
        var update = {
            width: 500,
            height: 400
        };
    }

    Plotly.relayout('figure1', update);
    playSound(arr,Fs)
}

// -------------------------------------- Separate CSV -----------------------------------------------------------

function separate(input,select)
{
    var l = input.length;
    var temp = "";
    var final = [];
    for(var i=0; i<l; i++)
    {
        if(input[i]==',')
        {
            var h;
            if(select==1)
            {
                h = parseInt(temp);
            }
            else
            {
                h = parseFloat(temp);
            }
            final.push(h);
            temp = "";
        }
        else
        {
            temp = temp + input[i];
        }
    }
    if(select==1)
    {
        var o = parseInt(temp);
        final.push(o);
    }
    else
    {
        var o = parseFloat(temp);
        final.push(o);
    }
    return final;
}

// -------------------------------------- Windowing -------------------------------------------------

function adsr(signal)
{
    var l = signal.length;
    var l1 = parseInt(l/10);

    var attack = makeArr(0,1,l1);
    var decay = makeArr(1,0.7,l1);
    var sustain = [];
    for(var i=0; i<7*l1; i++)
    {
        sustain.push(0.7);
    }
    var release = makeArr(0.7,0,l1);
    var out1 = attack.concat(decay);
    var out2 = out1.concat(sustain);
    var window = out2.concat(release);

    return window;
}

function exponential(signal)
{
    var l = signal.length;

    var window = [];
    for(var i=0; i<l; i++)
    {
        window.push(Math.exp(-i/10000));
    }

    return window;
}

function windowingInit(){
    var f0 = document.getElementById("fillSec41").value;
    f0 = parseInt(f0);
    Fs = 44100;
    var volume = document.getElementById("fillSec13").value;
    volume = parseFloat(volume);

    var sel = document.getElementById("boxSec41").value;
    sel = parseInt(sel);

    var xValues = [];

    var arr = [],
    seconds = 1,
    tone = f0

    for (var i = 0; i < Fs * seconds; i++) {
        arr[i] = sineWaveAt(i, tone, Fs) * volume
        xValues[i] = i / (Fs)
    }

    var l = arr.length;

    var window = [];
    if(sel==1)
    {
        window = adsr(arr);
    }
    else if(sel==2)
    {
        for(var i=0; i<l; i++)
        {
            window.push(1);
        }
    }
    else
    {
        window = exponential(arr);
    }

    var final = [];
    for(var i=0; i<l; i++)
    {
        final.push(window[i]*arr[i]);
    }

    var trace1 = {
        x: xValues,
        y: window,
        type: 'scatter',
        mode: 'line'
    };
      
    var data = [trace1];

    var config = {responsive: true}
    if(sel==1)
    {
        var layout = {
            title: 'ADSR Envelope',
            showlegend: false,
            xaxis: {
                title: 'Time (Seconds)'
            },
            yaxis: {
                title: 'Amplitude (A)'
            }
        };
    }
    else if(sel==2)
    {
        var layout = {
            title: 'Rectangular Envelope',
            showlegend: false,
            xaxis: {
                title: 'Time (Seconds)'
            },
            yaxis: {
                title: 'Amplitude (A)'
            }
        };
    }
    else
    {
        var layout = {
            title: 'Exponential Decay Envelope',
            showlegend: false,
            xaxis: {
                title: 'Time (Seconds)'
            },
            yaxis: {
                title: 'Amplitude (A)'
            }
        };
    }

    Plotly.newPlot('figure3', data, layout, config);
    
    if(screen.width < 400)
    {
        var update = {
            width: 0.87*screen.width,
            height: 400
        };
    }
    else
    {
        var update = {
            width: 500,
            height: 400
        };
    }

    Plotly.relayout('figure3', update);
    
}

function windowing(){
    var f0 = document.getElementById("fillSec41").value;
    f0 = parseInt(f0);
    Fs = 44100;
    var volume = document.getElementById("fillSec13").value;
    volume = parseFloat(volume);

    var sel = document.getElementById("boxSec41").value;
    sel = parseInt(sel);

    var xValues = [];

    var arr = [],
    seconds = 1,
    tone = f0

    for (var i = 0; i < Fs * seconds; i++) {
        arr[i] = sineWaveAt(i, tone, Fs) * volume
        xValues[i] = i / (Fs)
    }

    var l = arr.length;

    var window = [];
    if(sel==1)
    {
        window = adsr(arr);
    }
    else if(sel==2)
    {
        for(var i=0; i<l; i++)
        {
            window.push(1);
        }
    }
    else
    {
        window = exponential(arr);
    }

    var final = [];
    for(var i=0; i<l; i++)
    {
        final.push(window[i]*arr[i]);
    }

    var trace1 = {
        x: xValues,
        y: window,
        type: 'scatter',
        mode: 'line'
    };
      
    var data = [trace1];

    var config = {responsive: true}
    if(sel==1)
    {
        var layout = {
            title: 'ADSR Envelope',
            showlegend: false,
            xaxis: {
                title: 'Time (Seconds)'
            },
            yaxis: {
                title: 'Amplitude (A)'
            }
        };
    }
    else if(sel==2)
    {
        var layout = {
            title: 'Rectangular Envelope',
            showlegend: false,
            xaxis: {
                title: 'Time (Seconds)'
            },
            yaxis: {
                title: 'Amplitude (A)'
            }
        };
    }
    else
    {
        var layout = {
            title: 'Exponential Decay Envelope',
            showlegend: false,
            xaxis: {
                title: 'Time (Seconds)'
            },
            yaxis: {
                title: 'Amplitude (A)'
            }
        };
    }
      
    Plotly.newPlot('figure3', data, layout, config);
    
    if(screen.width < 400)
    {
        var update = {
            width: 0.87*screen.width,
            height: 400
        };
    }
    else
    {
        var update = {
            width: 500,
            height: 400
        };
    }

    Plotly.relayout('figure3', update);
    

    playSound(final,Fs);
}

// ------------------------------------------ Harmonics ----------------------------------------------------------

function shortHarmonics(f0, ks, as, sel)
{
    var n = ks.length;
    var volume = 0.2,
    seconds = 0.5*100/f0;
    var arr = [];

    for(var i=0; i<Fs*seconds; i++)
    {
        arr.push(0);
    }

    var tone;
    for(var i = 0; i < Fs * seconds; i++)
    {
        for(var j=0; j<n; j++)
        {
            tone = f0*ks[j];
            arr[i] = arr[i] + sineWaveAt(i, tone, Fs) * as[j];
        }
    }
    var xValues = [];

    for (var i = 0; i < Fs * seconds; i++) {
        xValues[i] = i / (Fs / (Math.PI * 2))
    }

    var maxA = 0;
    for(var i=0; i<Fs*seconds; i++){
        var t = arr[i];
        if(t>maxA)
        {
            maxA = t;
        }
    }

    var arrr = [];
    
    for(var i=0; i<Fs*seconds; i++){
        arrr[i] = arr[i]/maxA;
    }

    var l = arrr.length;

    var window = [];
    if(sel==1)
    {
        window = adsr(arrr);
    }
    else if(sel==2)
    {
        for(var i=0; i<l; i++)
        {
            window.push(1);
        }
    }
    else
    {
        window = exponential(arrr);
    }

    var final = [];
    for(var i=0; i<l; i++)
    {
        final.push(window[i]*arrr[i]);
    }

    return final;
}

function shortharmonics(f0, ks, as, sel)
{
    var n = ks.length;
    var volume = 0.2,
    seconds = 0.5*100/f0;
    var arr = [];

    for(var i=0; i<Fs*seconds; i++)
    {
        arr.push(0);
    }

    var tone;
    for(var i = 0; i < Fs * seconds; i++)
    {
        for(var j=0; j<n; j++)
        {
            tone = f0*ks[j];
            arr[i] = arr[i] + sineWaveAt(i, tone, Fs) * as[j];
        }
    }
    var xValues = [];

    for (var i = 0; i < Fs * seconds; i++) {
        xValues[i] = i / (Fs)
    }

    var maxA = 0;
    for(var i=0; i<Fs*seconds; i++){
        var t = arr[i];
        if(t>maxA)
        {
            maxA = t;
        }
    }

    var arrr = [];
    
    for(var i=0; i<Fs*seconds; i++){
        arrr[i] = arr[i]/maxA;
    }

    var l = arrr.length;

    var window = [];
    if(sel==1)
    {
        window = adsr(arrr);
    }
    else if(sel==2)
    {
        for(var i=0; i<l; i++)
        {
            window.push(1);
        }
    }
    else
    {
        window = exponential(arrr);
    }

    var final = [];
    for(var i=0; i<l; i++)
    {
        final.push(window[i]*arrr[i]);
    }

    return xValues;
}

function harmonicsInit(){
    var f0 = document.getElementById("fillSec21").value;
    f0 = parseInt(f0);
    Fs = 44100;

    var sel = document.getElementById("boxSec21").value;
    sel = parseInt(sel);

    var hars = document.getElementById("fillSec22").value;
    //hars = parseString(hars);
    var amps = document.getElementById("fillSec23").value;
    //amps = parseString(amps);

    var ks = separate(hars,1);
    var as = separate(amps,2);

    var n = ks.length;
    var volume = 0.2,
    seconds = 0.5;
    var arr = [];

    for(var i=0; i<Fs*seconds; i++)
    {
        arr.push(0);
    }

    var tone;
    for(var i = 0; i < Fs * seconds; i++)
    {
        for(var j=0; j<n; j++)
        {
            tone = f0*ks[j];
            arr[i] = arr[i] + sineWaveAt(i, tone, Fs) * as[j];
        }
    }
    var xValues = [];

    for (var i = 0; i < Fs * seconds; i++) {
        xValues[i] = i / (Fs / (Math.PI * 2))
    }

    var maxA = 0;
    for(var i=0; i<Fs*seconds; i++){
        var t = arr[i];
        if(t>maxA)
        {
            maxA = t;
        }
    }

    var arrr = [];
    
    for(var i=0; i<Fs*seconds; i++){
        arrr[i] = arr[i]/maxA;
    }

    var l = arrr.length;

    var window = [];
    if(sel==1)
    {
        window = adsr(arrr);
    }
    else if(sel==2)
    {
        for(var i=0; i<l; i++)
        {
            window.push(1);
        }
    }
    else
    {
        window = exponential(arrr);
    }

    var final = [];
    for(var i=0; i<l; i++)
    {
        final.push(window[i]*arrr[i]);
    }

    var yValues = shortHarmonics(f0, as, ks,sel);
    var xValues = shortharmonics(f0,as,ks,sel);

    var trace1 = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'line'
    };
      
    var data = [trace1];

    var config = {responsive: true}
    var layout = {
        title: 'Harmonics',
        showlegend: false,
        xaxis: {
            title: 'Time (Seconds)'
        },
        yaxis: {
            title: 'Amplitude (A)'
        }
    };
      
    Plotly.newPlot('figure2', data, layout, config);
    console.log(screen.width)
    if(screen.width < 400)
    {
        var update = {
            width: 0.87*screen.width,
            height: 400
        };
    }
    else
    {
        var update = {
            width: 500,
            height: 400
        };
    }

    Plotly.relayout('figure2', update);
}

function harmonics(){
    var f0 = document.getElementById("fillSec21").value;
    f0 = parseInt(f0);
    Fs = 44100;

    var sel = document.getElementById("boxSec21").value;
    sel = parseInt(sel);

    var hars = document.getElementById("fillSec22").value;
    //hars = parseString(hars);
    var amps = document.getElementById("fillSec23").value;
    //amps = parseString(amps);

    var ks = separate(hars,1);
    var as = separate(amps,2);

    var n = ks.length;
    var volume = 0.2,
    seconds = 0.5;
    var arr = [];

    for(var i=0; i<Fs*seconds; i++)
    {
        arr.push(0);
    }

    var tone;
    for(var i = 0; i < Fs * seconds; i++)
    {
        for(var j=0; j<n; j++)
        {
            tone = f0*ks[j];
            arr[i] = arr[i] + sineWaveAt(i, tone, Fs) * as[j];
        }
    }
    var xValues = [];

    for (var i = 0; i < Fs * seconds; i++) {
        xValues[i] = i / (Fs / (Math.PI * 2))
    }

    var maxA = 0;
    for(var i=0; i<Fs*seconds; i++){
        var t = arr[i];
        if(t>maxA)
        {
            maxA = t;
        }
    }

    var arrr = [];
    
    for(var i=0; i<Fs*seconds; i++){
        arrr[i] = arr[i]/maxA;
    }

    var l = arrr.length;

    var window = [];
    if(sel==1)
    {
        window = adsr(arrr);
    }
    else if(sel==2)
    {
        for(var i=0; i<l; i++)
        {
            window.push(1);
        }
    }
    else
    {
        window = exponential(arrr);
    }

    var final = [];
    for(var i=0; i<l; i++)
    {
        final.push(window[i]*arrr[i]);
    }

    playSound(final,Fs);

    var yValues = shortHarmonics(f0, as, ks,sel);
    var xValues = shortharmonics(f0,as,ks,sel);

    var trace1 = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'line'
    };
      
    var data = [trace1];

    var config = {responsive: true}
    var layout = {
        title: 'Harmonics',
        showlegend: false,
        xaxis: {
            title: 'Time (Seconds)'
        },
        yaxis: {
            title: 'Amplitude (A)'
        }
    };
      
    Plotly.newPlot('figure2', data, layout, config);
    
    if(screen.width < 400)
    {
        var update = {
            width: 0.87*screen.width,
            height: 400
        };
    }
    else
    {
        var update = {
            width: 500,
            height: 400
        };
    }

    Plotly.relayout('figure2', update);
}

// ----------------------------------- Play dynamic tones --------------------------------------------

function dynTones(){
    var i = 1;
    var numNow = 0;

    var sel = document.getElementById("boxSec31").value;
    sel = parseInt(sel);

    var Fs = 44100;

    var FINAL = [];

    while(numNow<uniquenumberofsignals)
    {
        var ele = document.getElementById("input_num"+i+"_wrapper");
        if(ele)
        {
            var fundamental = document.getElementById("dyn_fundamental_"+i+"").value;
            var harmonics = document.getElementById("dyn_harmonics_"+i+"").value;
            var amplitudes = document.getElementById("dyn_amps_"+i+"").value;
            var duration = document.getElementById("dyn_duration_"+i+"").value;
            fundamental = parseInt(fundamental);
            duration = parseFloat(duration);
            var ks = separate(harmonics,1);
            var as = separate(amplitudes,2);
            var n = ks.length;
            var seconds = duration;
            var arr = [];
            for(var j=0; j<Fs*seconds; j++)
            {
                arr.push(0);
            }

            var tone;
            for(var k = 0; k < Fs * seconds; k++)
            {
                for(var j=0; j<n; j++)
                {
                    tone = fundamental*ks[j];
                    arr[k] = arr[k] + sineWaveAt(k, tone, Fs) * as[j];
                }
            }
            var xValues = [];

            for (var j = 0; j < Fs * seconds; j++) {
                xValues[j] = j / (Fs / (Math.PI * 2))
            }

            var maxA = 0;
            for(var j=0; j<Fs*seconds; j++){
                var t = arr[j];
                if(t>maxA)
                {
                    maxA = t;
                }
            }

            var arrr = [];
    
            for(var j=0; j<Fs*seconds; j++){
                arrr[j] = arr[j]/maxA;
            }

            var l = arrr.length;

            var window = [];
            if(sel==1)
            {
                window = adsr(arrr);
            }
            else if(sel==2)
            {
                for(var j=0; j<l; j++)
                {
                    window.push(1);
                }
            }
            else
            {
                window = exponential(arrr);
            }

            for(var j=0; j<l; j++)
            {
                FINAL.push(window[j]*arrr[j]);
            }
            numNow += 1;
        }
        i += 1;
    }
    
    playSound(FINAL,Fs)
}

/* ---------------------------- LinSpace -------------------------------------- */

function makeArr(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
}

// ------------------------------------------ On startup ----------------------------------------------------------

function startup()
{
    playToneInit();
    windowingInit();
    harmonicsInit();
    document.getElementById("default").click();
    document.getElementById("buttonSec31").click();
}

window.onload = startup;