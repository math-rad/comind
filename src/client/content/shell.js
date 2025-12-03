const shellInput = document.getElementById("shell-input")
const shellOutputFeed = document.getElementById("shell-output-feed")
shellInput.focus
shellInput.focus()

let filteredData

function clearOutput() {
    while (shellOutputFeed.firstChild) {
        shellOutputFeed.removeChild(shellOutputFeed.firstChild)
    }
}

var WORDS

(async () => {
    WORDS = (await (await fetch("/core/txt/words")).text()).split('\n')
})()

const CACHE = {}



function output(content) {
    const message = document.createElement("label")
    message.textContent = content
    shellOutputFeed.appendChild(message)
}

fetch("/core/json/english-filtered").then(response => response.json().then(data => filteredData = data))

shellInput.addEventListener("input", (event) => {
    const currentInput = shellInput.value

    clearOutput()
    const hit = WORDS.filter((word) => word.startsWith(currentInput))
    let x = 100
    while (x > 0) {
        x--
        output(hit[x])
        var meaning = ""
        if (hit[x]) {
            const X = filteredData[hit[x].toUpperCase()]
            if (X) {
                const Y = X.MEANINGS
                if (Y) {
                    meaning = Y[0]
    
                }
            }
        }
        output(`${hit[x]}${meaning != null && `[${meaning[0]}]: ` + meaning[1]}`)


    }

})