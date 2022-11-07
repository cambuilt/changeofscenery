function centerChanged() {    
    if (window.chrome != undefined) {
        console.log('the center has changed and posted.');
        window.chrome.webview.postMessage('center has changed');
    } else {
        console.log('no extra center change post. no chrome.');
    }
}