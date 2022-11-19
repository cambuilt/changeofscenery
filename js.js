function centerChanged() {    
    if (window.chrome != undefined) {
        console.log('the center has changed and posted.');
        console.log('the chrome.', window.chrome);
        console.log('the webview.', window.chrome.webview);
        // window.chrome.webview.postMessage('center has changed');
    } else {
        console.log('no extra center change post. no chrome.');
    }
}