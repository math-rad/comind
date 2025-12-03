const express = require("express")
const path = require("path")

const port = 5578

const fileServer = express()

fileServer.get("/", async function(req, response) {
    response.redirect("/shell")
})

fileServer.get("/core/:type/:file", async function(request, response) {
    response.sendFile(path.join(__dirname, '..', 'client', 'content', `${request.params.file}.${request.params.type}`)) 
})

fileServer.get("/shell", async function(request, response) {
    response.sendFile(path.join(__dirname, '..', 'client', 'content', 'shell.html'))
})

fileServer.listen(port, () => {
    console.log("active")
})