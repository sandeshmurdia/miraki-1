import { miraki } from "@/miraki";
import { action, computed, makeObservable, observable } from "mobx";

interface TreeNodeOptions extends miraki.TreeNode.TreeLeaf {
    children?: miraki.TreeNode.TreeNode['children'];
    collapsibleState?: miraki.TreeNode.TreeLeafCollapsibleState;
    action?: miraki.TreeNode.TreeNode['action'];

}




export class TreeNodeAction implements miraki.TreeNode.TreeNodeAction {
    command: miraki.TreeNode.Command;
    title: string;
    group?: 'navigation' | 'inline';
    icon?: string | undefined;
    id: string;


    constructor(options: miraki.TreeNode.TreeNodeAction) {
        this.command = options.command;
        this.title = options.title;
        this.group = options.group;
        this.icon = options.icon;
        this.id = options.id;
    }
}

export class BaseTreeNode implements miraki.TreeNode.TreeNode {
    collapsibleState?: miraki.TreeNode.TreeLeafCollapsibleState;
    _children: miraki.TreeNode.TreeNode['children'];
    command?: miraki.TreeNode.Command;
    description?: string;
    icon?: string;
    id: string;
    label?: string;
    tooltip?: string;
    name: string;
    action: miraki.TreeNode.TreeNode['action'];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentNode?: BaseTreeNode;

    constructor(options: TreeNodeOptions) {
        this.command = options.command;
        this.description = options.description;
        this.icon = options.icon;
        this.id = options.id;
        this.label = options.label;
        this.tooltip = options.tooltip;
        this.name = options.name;
        this.collapsibleState = options.collapsibleState;
        this._children = options.children || [];
        this.action = options.action;
    }


    attach(node: BaseTreeNode): void {
        this.parentNode = node;
    }

    getParent(): miraki.TreeNode.TreeNode | undefined {
        return this.parentNode;
    }

    addChild(child: miraki.TreeNode.TreeLeaf) {
        this._children.push(child);
    }


    removeChild(child: BaseTreeNode) {
        this._children = this._children.filter((c) => c !== child);
    }

    setChild(index: number, child: miraki.TreeNode.TreeNode | miraki.TreeNode.TreeLeaf): void {
        this._children[index] = child;
    }

    setCollapsibleState(state: miraki.TreeNode.TreeLeafCollapsibleState): void {
        this.collapsibleState = state;
    }


    get children() {
        return this._children;
    }
}

export class TreeLeaf extends BaseTreeNode {
    constructor(options: miraki.TreeNode.TreeLeaf) {
        super(options);
    }
}

export class TreeNode extends BaseTreeNode {

    showInputBox = false;

    constructor(options: TreeNodeOptions) {
        super(options);
        this._children = this.__castChildren(options.children || []);
        if (this.action) {
            if (this.action.title) {
                this.action.title = this.__castActions(this.action.title);
            }
            if (this.action.item_context) {
                this.action.item_context = this.__castActions(this.action.item_context);
            }
        }
        makeObservable(this,{
            addChild: action,
            collapsibleState: observable,
            setCollapsibleState: action,
            removeChild: action,
            setChild: action,
            children: computed,
            showInputBox: observable,
        });
    }

    __castActions(actions: miraki.TreeNode.TreeNodeAction[]): TreeNodeAction[] {
        return actions.map(action => {
            if (action instanceof TreeNodeAction) {
                return action;
            }
            return new TreeNodeAction(action);
        })
    }

    __castChildren(children: miraki.TreeNode.TreeNode['children']): (TreeNode | TreeLeaf)[] {
        return children.map(child => {
            if (child instanceof BaseTreeNode) {
                return child;
            }
            if ((child as miraki.TreeNode.TreeNode).children !== undefined) {
                return new TreeNode(child as TreeNodeOptions);
            }
            return new TreeLeaf(child);
        })
    }

    addChild(child: TreeLeaf | TreeNode): void {
        const [_child] = this.__castChildren([child]);
        this._children.push(_child);
    }

    get children(): (TreeNode | TreeLeaf)[] {
        return this.__castChildren(this._children);
    }

    getTreeLeafById(id: string): TreeLeaf | TreeNode | undefined {
        if (this.id === id) {
            return this;
        }
        for (const child of this.children) {
            if (child.id === id) {
                return child;
            }
        }
    }


}