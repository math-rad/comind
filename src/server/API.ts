import { v7 } from "uuid"
import { readFile, writeFile } from "fs/promises"
import { loadEnvFile } from "process"


const storageHandler = new class {
    storage = {}
    convertStorage = () => JSON.stringify(this.storage)
    paths = {
            "quick": "./quickStorage.json",
    }
    StorageMODE = {
        modes: {
            "quick": {
                
            }
        },
        mode: "quick"
    }
    nodesToSave = {}
    async write() {
        switch (this.StorageMODE.mode) {
            // needs to account overwriting? or perhaps it wont because there is one process here
            case "quick": {
                await writeFile(this.paths.quick, this.convertStorage(), {
                    "encoding": "utf8"
                })
            }
        }
    }
    async read() {
        switch (this.StorageMODE.mode) {
            case "quick": {
                this.storage = JSON.parse(await readFile(this.paths.quick, {
                    "encoding": "utf8"
                }))
            }
        }
    }
}

interface edgeContainer {
    string: 
}

class NODE {
    ID: string
    type: TYPE | string
    tags: (TAG | string)[]
    constructor() {
        this.ID = v7()
    }
    tag(tag: TAG | string) {
        this.tags.push(tag)
    }
}

class ENUM extends NODE {
    members: Record<string, ENUM>
    label: string
    parent: ENUM
    constructor(label: string, members?: Array<ENUM>) {
        super()
        this.label = label
        this.members = {}
        for (var member of members || []) {
            this.members[member.label] = member
            member.parent = this
        }
    }
}

class TYPE extends ENUM {
    constructor(label: string) {
        super(label)
        this.type = "ENUM"
    }
}

let API = {
    "types": {
        "enum": new TYPE("enum"),
        "tag": new TYPE("tag")
    }
}

class TAG extends ENUM {
    constructor(label: string) {
        super(label)
        this.type = API.types.tag
    }
}

const test = new TAG("something")
const someEnum = new ENUM("classes", [
    new ENUM("math"),
    new ENUM("english")


])