chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
  if (details.url !== 'about:blank') {
    onNav(details.url);
  }
});

function onNav(url) {
  console.log(url);
}
