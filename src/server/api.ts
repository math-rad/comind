import { v7 } from "uuid"
import { readFile, writeFile } from "fs/promises"
import fixedIds from "./fixed-ids.json" with {type: "json"}

export class API {
    public static nodes: Record<string, InstanceType<typeof API.Node>> = {}

    public static fetchNode(NodeId: string): InstanceType<typeof API.Node> {
        return API.nodes[NodeId]
    }

    private static getNode(node: InstanceType<typeof API.Node> | string) {
        return (typeof (node) === "string" ? API.fetchNode(node) : node)
    }

    public static Node = class {
        public ID: string
        public label?: string
        public modified?: string
        public edges: Record<string, string | InstanceType<typeof API.Node>> | Record<string, string | Array<InstanceType<typeof API.Node>>> = {}

        constructor(label?: string, edges: {}, ID?: string) {
            this.ID = ID || v7() // should I consider v7 parameters?
            this.label = label
            API.nodes[this.ID] = this
        }

        public attachNode(node: InstanceType<typeof API.Node> | string, label: string) {
            this.edges[label] = API.getNode(node).ID
        }

        private prepareBranch(branch: string) {
            if (!this.edges[branch]) {
                this.edges[branch] = []
            }
        }

        public attachNodeToBranch(branch: string, node: InstanceType<typeof API.Node> | string) {
            this.prepareBranch(branch)
            this.edges[branch].push(API.getNode(node).ID)
        }

    }

    public static Node_sys_layer = class extends API.Node {
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, undefined, ID)
        }

        tag(tag: InstanceType<typeof API.Node> | string) {
            this.attachNodeToBranch(API.getNode(tag).ID, "tags")
        }

        setType(type: InstanceType<typeof API.Node> | string) {
            this.attachNode(API.getNode(type).ID, "type")
        }
    }

    public static Container = class extends API.Node_sys_layer {
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, undefined, ID)
            this.setType(fixedIds.types.container)

            if (members) {
                for (var member of members) {
                    this.addMember(API.getNode(member))
                }
            }
        }

        addMember(node: InstanceType<typeof API.Node> | string) {
            node = API.getNode(node)
            this.attachNodeToBranch("members", node.ID)
            node.attachNodeToBranch("memberships", this.ID)
        }

        addMembers(...nodes: (InstanceType<typeof API.Node> | string)[]) {
            for (let node of nodes) {
                this.addMember(node)
            }
        }
    }

    public static Enum = class extends API.Container {
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, members, ID)
            this.setType(fixedIds.types.enum)
        }
    }

    public static Type = class Type extends API.Enum {
        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, members, ID)
            this.setType(fixedIds.types.type)
        }
    }

    public static Tag = class Tag extends API.Enum {

        constructor(label: string, members?: Array<InstanceType<typeof API.Node> | string>, ID?: string) {
            super(label, members, ID)
            this.edges.type = fixedIds.types.tag
        }

        tagNode(node) {

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