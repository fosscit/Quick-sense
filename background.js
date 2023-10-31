chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension Installed');
  const definition = "😑😑😑";
  chrome.storage.local.set({ 'meaning': definition }, function() {
    console.log('Meaning saved to storage: ' + definition);
  });
});

function setBadgeText(text) {
  chrome.action.setBadgeText({ text: text });
}

function isProperWord(word) {
  // Regular expression to match only letters
  const lettersRegex = /^[A-Za-z]+$/;
  // Check if the word consists only of letters and is not empty
  return word.match(lettersRegex) !== null && word.length > 0;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "speak") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var synth = window.speechSynthesis;
      var word = request.word;
      var toSpeak = new SpeechSynthesisUtterance(word);
      var voices = synth.getVoices();
      var selectedVoiceName = "Microsoft Zira - English (United States)";
      voices.forEach((voice) => {
        if (voice.name === selectedVoiceName) {
          toSpeak.voice = voice;
        }
      });
      synth.speak(toSpeak);
      return true;
    });
  }

  if (request.action === "lookup") {
    var word = request.word;
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => response.json())
      .then(data => {
        if (isProperWord(word) && data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
          const definition = data[0].meanings[0].definitions[0].definition;
          setBadgeText("😎"); // Set badge text here
          chrome.storage.local.set({ 'meaning': definition }, function() {
            console.log('Meaning saved to storage: ' + definition);
          });
          sendResponse({ meaning: definition });
        } else {
          setBadgeText("😵‍💫"); // Set badge text for invalid data
          sendResponse({ meaning: "Invalid word" });
        }
      })
      .catch(error => {
        setBadgeText("Error"); // Set badge text for errors
        sendResponse({ meaning: "Error fetching meaning" });
      });
    return true;
  }

  if (request.action === 'setSelectedText') {
    selectedText = request.text;
  }
});

chrome.action.onClicked.addListener(function(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: function() {
      return window.getSelection().toString().trim();
    }
  }, function(selection) {
    const selectedText = selection[0]; // Selected text is in the first element of the array
    if (selectedText) {
      chrome.runtime.sendMessage({ action: 'lookup', word: selectedText }, function(response) {
        // Handle the response if needed
      });
    }
  });
});

chrome.contextMenus.create({
  id: "quicksense2",
  title: "QuickSense",
  contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener(function(clickData) {
  if (clickData.menuItemId === "quicksense2" && clickData.selectionText) {
    const isProper = isProperWord(clickData.selectionText);
    badge(isProper, clickData.selectionText);
  }
});

function badge(isProper, word) {
  if (isProper) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
          const definition = data[0].meanings[0].definitions[0].definition;
          setBadgeText("🧐"); // Set badge text here
          chrome.storage.local.set({ 'meaning': definition }, function() {
            console.log('Meaning saved to storage: ' + definition);
          });
        } else {
          setBadgeText("😴"); // Set badge text for invalid data
          const definition = "Invalid";
          chrome.storage.local.set({ 'meaning': definition }, function() {
            console.log('Meaning saved to storage: ' + definition);
          });
        }
      })
      .catch(error => {
        setBadgeText("😴"); // Set badge text for errors
      });
  } else {
    chrome.action.setBadgeText({ text: "Invalid" });
  }
}
