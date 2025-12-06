import { v7 } from "uuid"
import { readFile, writeFile } from "fs/promises"
import fixedIds from "./fixed-ids.json" with {type: "json"}
import { types } from "util"

export class API {
    public static nodes: Record<string, InstanceType<typeof API.Node>> = {}

    public static fetchNode(NodeId: string): InstanceType<typeof API.Node> {
        return API.nodes[NodeId]
    }

    private static getNode(node: InstanceType<typeof API.Node> | string) {
        return (typeof(node) === "string"? API.fetchNode(node) : node)
    }

    public static Node = class {
        public ID: string
        public label?: string
        public modified?: string
        public edges: Record<string, InstanceType<typeof API.Node> | string>

        constructor(label?: string, edges: {}, ID?: string) {
            this.ID = ID || v7() // should I consider v7 parameters?
            this.label = label
            this.edges = {}
            API.nodes[this.ID] = this

        }

        public attach(node: InstanceType<typeof API.Node>, label: string) {
            this.edges[label] = node
        }
    }
    public static Container = class extends API.Node {
        public members: (InstanceType<typeof API.Node> | string)[]
        public type = fixedIds.types.container
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, ID)
            this.members = []
            if (members) {
                for (var member of members) {
                    switch (typeof (member)) {
                        case "string": {
                            this.addMember(API.fetchNode(member))
                            break
                        };
                        default: {
                            this.addMember(member)
                        }
                    }
                }
            }

            
        }

        addMember(node: InstanceType<typeof API.Node> | string) {
            node = API.getNode(node)
            this.members.push(node)
            node.attach(this, this.label)
            
        }
    }

    public static Enum = class extends API.Container {
        public edges = {
            type: fixedIds.types.type
        }
    }

    public static Type = class Type extends API.Enum {
        public edges = {
            type: fixedIds.types.type
        }
    }

    public static Tag = class Tag extends API.Enum {
        public edges = {
            type: fixedIds.types.tag
        }
    }

    public static indexers = {
        //tag = (node: InstanceType<typeof API.Node> | string) => API.getNode(node).edges
    }

    constructor() {
        const types = new API.Container("types", [
            new API.Type("container", [], fixedIds.types.container).ID,
            new API.Type("enum", [], fixedIds.types.enum).ID,
            new API.Type("tag", [], fixedIds.types.tag).ID,
            new API.Type("module", [], fixedIds.types.module).ID,
        ])
    }
}