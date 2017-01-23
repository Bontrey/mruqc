let starting = false;

chrome.runtime.onStartup.addListener(start);
chrome.runtime.onInstalled.addListener(start);
chrome.runtime.onSuspend.addListener(function() {
  if (window.socket) {
    window.socket.close();
    delete window.socket;
  }
});

function start() {
  if (!starting) {
    starting = true;

    window.socket = new Socket("ws://127.0.0.1:28884");
  }
}

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
  if (details.url !== 'about:blank' &&
      details.url.indexOf('chrome://') != 0) {
    window.socket.send(details.url);
  }
});

class Socket {
  constructor(url) {
    this.url = url;
    this.sock = new WebSocket(url);
    this.isReady = false;
    this.queued = [];

    this.sock.onopen = () => {
      this.onOpen();
    };

    this.sock.onclose = (e) => {
      this.onClose(e);
    };

    this.sock.onmessage = (e) => {
      this.onMessage(e);
    };
  }

  send(url) {
    if (!this.isReady) {
      this.queued.push(url);
    } else {
      this.sock.send(url); 
    }
  }

  onOpen() {
    console.log("connected to " + this.url);
    this.isReady = true;
    for (const url of this.queued) {
      this.sock.send(url);
    }
    this.queued = [];
  }

  onClose(e) {
    console.log("connection closed (" + e.code + ")");
  }

  onMessage(e) {
    console.log("message received: " + e.data);
  }
}
