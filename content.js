// content.js

// Listen for messages from the background script or other extensions
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  // Handle messages here if necessary
});

document.addEventListener('selectionchange', function() {
  var selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    chrome.runtime.sendMessage({ action: 'setSelectedText', text: selectedText });
  }
});

var container = document.createElement('div');
container.style.marginTop = "10px";
container.style.position = "fixed";
container.style.height = "50px";
container.style.width = "200px";
container.style.top = "0px";
container.style.right = "0px";
container.style.border = "1px solid blue";
container.style.backgroundColor = "white";
document.body.appendChild(container);
