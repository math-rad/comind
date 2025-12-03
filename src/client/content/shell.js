const shellInput = document.getElementById("shell-input")
const shellOutputFeed = document.getElementById("shell-output-feed")
shellInput.focus
shellInput.focus()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let filteredData

function clearOutput() {
    while (shellOutputFeed.firstChild) {
        shellOutputFeed.removeChild(shellOutputFeed.firstChild)
    }
}

var WORDS

(async () => {
    WORDS = (await (await fetch("https://comind.math-rad.com/core/txt/words")).text()).split('\n')
})()

const CACHE = {}



function output(content) {
    const message = document.createElement("label")
    message.innerHTML = content
    shellOutputFeed.appendChild(message)
}

fetch("https://comind.math-rad.com/core/json/english-filtered").then(response => response.json().then(data => filteredData = data))
let ID = 0
shellInput.addEventListener("input", async (event) => {
    const ref = ++ID

    const currentInput = shellInput.value
    clearOutput()
    const hit = WORDS.filter((word) => word.includes(currentInput))
    hit.sort((a, b) => b-a)
    const max = 100
    let k = 0
    let i = 0
    while (true) {
        var meaning = ""
        if (hit[i]) {
            const X = filteredData[hit[i].toUpperCase()]
            if (X) {
                const Y = X.MEANINGS
                if (Y) {
                    if (Y[0]) {
                        output("<br>" + hit[i].replaceAll(currentInput, `<b><u>${currentInput}</u></b>`))
                        Y.forEach(element => {
                            output(`[${element[0]}]: ${element[1]}`)
                        });
                    }
                    //output(`${hit[i]}${(Y[0] && Y[1] && `[${Y[0]}]: ${Y[1]}`) || ""}`)
                }
            }
        }
        await sleep(1)
        if (ID != ref) {
            return;
        }
       
        //output(`${hit[i]}${meaning != null && `[${meaning[0]}]: ` + meaning[1]}`)

        i++
    }

})