import { v7 } from "uuid"

import express, { response } from "express"

import fixedIds from "./fixed-ids.json" with {type: "json"}
import { execPath } from "process"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import http from "http"
import WebSocket, { WebSocketServer } from "ws"
import { assert } from "console"

type Predicate<T> = (item: T) => boolean

export interface API {
    nodes: Record<string, NODE>
    prevID: string

    fetchNode(NodeId: string): NODE
    getNode(node: NODE | string): NODE
    getNodeID(node: NODE | string): string
}

export const API = {
    nodes: {},

    fetchNode(NodeId) {
        return API.nodes[NodeId]
    },

    getNode(node) {
        return (typeof (node) === "string" ? API.fetchNode(node) : node)
    },

    getNodeID(node) {
        return typeof (node) == "string" ? node : this.getNode(node).ID
    },
} as API

export class NODE {
    public ID: string
    public label?: string
    public neoj4Labels: string[]
    public modified?: string
    public edges: Record<string, (string | string[])> = {}

    constructor(label?: string, ID?: string) {
        this.ID = ID || v7() // should I consider v7 parameters?
        this.label = label
        API.nodes[this.ID] = this

        this.neoj4Labels = []
        this.neoj4Label('node')

        this.edges.prevID = API.prevID
        if (API.getNode(API.prevID)) {
            API.getNode(API.prevID).edges.nextID = this.ID
        }

        API.prevID = this.ID
    }

    public attachNode(node: NODE | string, label: string) {
        this.edges[label] = API.getNodeID(node)
    }

    public prepareBranch(branch: string) {
        if (!this.edges[branch]) {
            this.edges[branch] = []
        }
    }

    public attachNodeToBranch(branch: string, node: NODE | string) {
        this.prepareBranch(branch)
        this.edges[branch].push(API.getNodeID(node))
    }

    public getNodesFromBranch(branch: string, predicate: Predicate<NODE | string>) {
        this.prepareBranch(branch)
        return (this.edges[branch] as Array<string | NODE>).filter(predicate)
    }

    public neoj4Label(label: string) {
        this.neoj4Labels.push(label)
    }
}

export class Node_sys_layer extends NODE {
    constructor(label?: string, ID?: string) {
        super(label, ID)
    }

    tag(...tags: (NODE | string)[]) {
        for (var tag in tags) {
            this.attachNodeToBranch("tags", API.getNodeID(tag))
        }
    }

    setType(type: NODE | string) {
        this.attachNode(API.getNodeID(type), "type")
    }
}

export class Container extends Node_sys_layer {
    constructor(label: string, members?: (NODE | string)[], ID?: string) {
        super(label, ID)
        this.setType(fixedIds.types.container)
        if (members) {
            for (var member of members) {
                this.addMember(API.getNode(member))
            }
        }
    }

    addMember(node: NODE | string) {
        node = API.getNode(node)
        this.attachNodeToBranch("members", node.ID)
        node.attachNodeToBranch("memberships", this.ID)
    }

    addMembers(...nodes: (NODE | string)[]) {
        for (let node of nodes) {
            this.addMember(node)
        }
    }
}

export class Enum extends Container {
    constructor(label: string, members?: (NODE | string)[], ID?: string) {
        super(label, members, ID)
        this.setType(fixedIds.types.enum)
    }
}

export class Type extends Enum {
    constructor(label: string, members?: (NODE | string)[], ID?: string) {
        super(label, members, ID)
        this.setType(fixedIds.types.type)
    }
}

export class Tag extends Enum {
    constructor(label: string, members?: (NODE | string)[], ID?: string) {
        super(label, members, ID)
        this.setType(fixedIds.types.tag)
    }
}

export class File extends Node_sys_layer {
    path: string
    constructor(path: string, label: string, ID?: string) {
        super(label, ID)
        this.path = path
        this.setType(fixedIds.types.file)
        this.tag(fixedIds.tags.internal.document, fixedIds.tags.internal.organizational)
    }
}

class UIElement extends Node_sys_layer {
    constructor(ID?: string) {
        super(undefined, ID)
    }
}

class UIRoot extends UIElement {
    constructor(ID?: string,) {
        super(ID)
    }
}

class UIText extends UIElement {
    text: string
    constructor(text: string, ID?: string) {
        super(ID)
        this.text = text
    }
}

class UIContainer extends UIElement {

}

class UIDiv extends UIContainer {

}

class UISpan extends UIContainer {

}

class UIInput extends UIElement {

}

class InputField extends UIElement {
    public placeholderText?: string
    constructor(placeholderText?: string, ID?: string) {
        super(ID)
        this.placeholderText = placeholderText
    }
}

const Display = {
    block: new Enum("block"),
    inline: new Enum("inline"),
    none: new Enum("none"),
    flex: new Enum("flex"),
    grid: new Enum("grid")
}


export class NodeQueryField extends InputField {
    constructor(placeholderText?: string, ID?: string) {
        super(placeholderText, ID)
    }
}

export class Label extends UIElement {
    text: string
    constructor(text: string, ID: string) {
        super(ID)
        this.text = text
    }
}

export const interfaceEnums = {
    textual: new Enum("textual", [], fixedIds.enums.interface.textual),
    semitextual: new Enum("semitextual", [], fixedIds.enums.interface.semitextual),
    canvas: new Enum("canvas", [], fixedIds.enums.interface.canvas),
    custom: new Enum("custom", [], fixedIds.enums.interface.custom)
}

export class Interface extends Node_sys_layer {
    mode: (typeof interfaceEnums)[keyof typeof interfaceEnums]
    root: UIRoot
    constructor(mode: (typeof interfaceEnums)[keyof typeof interfaceEnums], root: UIRoot, label?: string, ID: string) {
        super(label, ID)
        this.setType(fixedIds.types.interface)
        this.tag(fixedIds.tags.internal.functional)
        this.mode = mode
        this.root = root
    }

}

const internal_tags = new Tag("internal", [
    new Tag("organizational", [], fixedIds.tags.internal.organizational),
    new Tag("functional", [], fixedIds.tags.internal.functional),
    new Tag("primitive", [], fixedIds.tags.internal.primitive)
], fixedIds.tags.internal.internal)
const types = new Container("types", [
    new Type("container", [], fixedIds.types.container),
    new Type("enum", [], fixedIds.types.enum),
    new Type("tag", [], fixedIds.types.tag),
    new Type("module", [], fixedIds.types.module),
    new Type("module", [], fixedIds.types.file),
    new Type("module", [], fixedIds.types.script)
])


const renderFileServer = express()
renderFileServer.use(express.static("public"))
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


const server = http.createServer(renderFileServer)

const wss = new WebSocketServer({
    port: 3001,
})


const stuff = {}


type responseType = "response" | "output" | "error" | "directive"

class WSProtocolObject {
    type: responseType
    payload: string | Object
}

class WSProtocolError extends WSProtocolObject {
    error: string
    constructor(err: string) {
        super()
        this.type = "error"
        this.error = err
    }
}

class WSProtocolResponse extends WSProtocolObject {
    constructor(response: string) {
        super()
        this.type = "response"
        this.payload = response
    }
}

type ProtocolDirective = {
        "type": string,
        update?: string,
        interface?: string,
        callback: string,
        implements: string[]
    }

class WSProtocolDirective extends WSProtocolObject {
    directive: ProtocolDirective
    constructor(directive: ProtocolDirective, payload: string) {
        super()
        this.type = "directive"
        this.directive = directive
        this.payload = payload
    }
}



class WSProtocol {
    socket: WebSocket
    constructor(websocket: WebSocket) {
        this.socket = websocket
    }

    send(response: WSProtocolObject) {
        this.socket.send(JSON.stringify(response))
    }
}

wss.on("connection", (ws) => {
    const protocol = new WSProtocol(ws)


    ws.on("message", (Data) => {
        const data = JSON.parse(Data.toString())
        switch (data.type) {
            case "command": {
                const payload = data.payload
                const command = data.command
                const cmdFormat = RegExp('^:\\S+(\\s+\\S)*')
                if (cmdFormat.test(command)) {
                    const tokens = (command as string).substring(1).split(/\s+/)
                    switch(tokens.shift()) {
                        case "list": {

                            return  protocol.send(new WSProtocolDirective({
                                        "type": "UI",
                                        "update": "interface",
                                        "interface": "",
                                        "callback": "loadContent",
                                        "implements": ["payload"]
                                    }, Object.keys(stuff).map(str => `\\text{${str}}`).join("\\text{ }")))
                        }
                        case "saveas": {
                            const key = tokens.shift()
                            if (!key) {
                                return protocol.send(
                                    new WSProtocolError("saveas command requires second parameter \"key\"")
                                )
                            } else {
                                stuff[key] = payload
                                return protocol.send(
                                    new WSProtocolResponse(`set ${key}`)
                                )
                            }
                        }
                        case "load": {
                            const key = tokens.shift()
                            if (!key) {
                                return protocol.send(
                                    new WSProtocolError("load command requires second parameter \"key\"")
                                )
                            } else {
                                return protocol.send(
                                    new WSProtocolDirective({
                                        "type": "UI",
                                        "update": "interface",
                                        "interface": "",
                                        "callback": "loadContent",
                                        "implements": ["payload"]
                                    }, stuff[key])
                                )
                            }
                        }
                    }
                }
            }
        }
    })
})


renderFileServer.get("/", (request, response) => {
    response.sendFile(path.join(dirname(__filename), "draft.html"))
})


renderFileServer.get("/test", (request, response) => {
    response.sendFile(path.join(dirname(__filename), "thing.html"))
})

server.listen(3000)