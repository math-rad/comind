// base parent 
// do add methods to "storage" such that changes propagate updates to file reference
// do set up a system to occasionally write to node files instead of instantly
// do make sure that nodes are all saved when process is terminated
// do take note of unsaved storages in nodes 




const fs = require("fs")
const UUID = require("uuid")


const storageVersion = "v1"

const API = {}

const META = {}
const toStore: Array<NODE> = []

async function markForStorage(targetNode: NODE) {
    toStore.push(targetNode)
}

const storageDirectory = path

function writeNode(targetNode: NODE) {

}
interface NODE {
    id: string,
    storage: Record<string, any>,
    meta: {
        tags?: Array<string>,
        type?: string
        references: {
            moment?: string
            connections?: String[]
        }

    }
}


const TAG_SET = {
    type: {
        script: "SCRIPT",
        moment: "MOMENT"
    },
    internal: {
        organizational: "INTERNAL_ORGANIZATIONAL",
        functional: "INTERNAL_FUNCTIONAL"
    },
    hide: "HIDDEN",
    time: {
        moment: "TIME_MOMENT",
        second: "TIME_SECOND",
        minute: "TIME_MINUTE",
        hour: "TIME_HOUR",
        day: "TIME_DAY",
        week: "TIME_WEEK",
        month: "TIME_MONTH",
        year: "TIME_YEAR",
        decade: "TIME_DECADE"
    }
}


class NODE {
    constructor() {
        this.id = UUID.v7()
        this.storage = {}
        this.meta = {
            references: {

            }
        }
    }
    tag(...tags: Array<string>) {
        if (!this.meta.tags) {
            this.meta.tags = tags
        } else {
            this.meta.tags.concat(tags)
        }
    }
}

class timeNode extends NODE {
    constructor() {
        super()
        this.storage.moment = Date.now()
        this.tag(TAG_SET.time.moment, TAG_SET.internal.organizational)
    }
}


class node extends NODE {
    constructor() {
        super()
        const momentNode = new timeNode()
        this.meta.references.moment = momentNode.id

    }
}

class scriptNode extends node {
    constructor(src: string) {
        super()
        this.storage.src = src
        this.tag(TAG_SET.internal.functional)
    }
}

console.log(1)