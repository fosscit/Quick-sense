document.addEventListener('DOMContentLoaded', function() {
  var findMeaningButton = document.getElementById('findMeaningButton');
  var wordInput = document.getElementById('wordInput');
  var meaningDiv = document.getElementById('meaning');
  var SpeakButton = document.getElementById('SpeakButton');

  // Initially hide the meaning div
  meaningDiv.style.display = 'none';

  chrome.storage.local.get(['meaning'], function(result) {
    if (result.meaning) {
      meaningDiv.textContent = result.meaning;
      meaningDiv.style.display = 'block';

    }
  });

  // Event listener for the Find Meaning button
  findMeaningButton.addEventListener('click', function() {
    var word = wordInput.value;
    chrome.runtime.sendMessage({ action: 'lookup', word: word }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Error details:', chrome.runtime.lastError);
      } else if (response && response.meaning) {
        meaningDiv.textContent = response.meaning;
        meaningDiv.style.display = 'block'; // Show the div when meaning is displayed
      } else {
        console.error('Invalid or missing response:', response);
      }
    });
  });

  SpeakButton.addEventListener('click', function() {
    var word = wordInput.value;

    var synth = window.speechSynthesis;
    var toSpeak = new SpeechSynthesisUtterance(word);
    var voices = synth.getVoices();
    var selectedVoiceName = "Microsoft Zira - English (United States)";
    voices.forEach((voice) => {
      if (voice.name === selectedVoiceName) {
        toSpeak.voice = voice;
      }
    });
    synth.speak(toSpeak);
  });
});
