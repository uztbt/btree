export type Data = Map<string, string>;
class TreeNode {
  private keyArray: string[];
  private dataArray: Data[];
  private children: TreeNode[];
  
  constructor() {
    this.keyArray = [];
    this.dataArray = [];
    this.children = [];
  }

  size() {
    return this.keyArray.length;
  }

  hasChildren() {
    return this.children.length > 0;
  }

  getKey(index: number): string {
    return this.keyArray[index];
  }

  getKeys(): string[] {
    return this.keyArray;
  }

  getData(index: number): Data {
    return this.dataArray[index];
  }

  getChild(index: number): TreeNode {
    return this.children[index];
  }

  getChildren(): TreeNode[] {
    return this.children;
  }

  addChildren(children: TreeNode[]) {
    this.children.push(...children);
  }

  insert(key: string, data: Data) {
    let pos = 0;
    for(; pos < this.size(); pos++) {
      if (this.keyArray[pos] > key) {
        break;
      }
    }
    this.keyArray.splice(pos, 0, key);
    this.dataArray.splice(pos, 0, data);
  }

  split(): {centerKey: string, centerData: Data, left: TreeNode, right: TreeNode} {
    const median = Math.floor(this.size()/2);
    const left = new TreeNode();
    left.keyArray = this.keyArray.splice(0, median);
    left.dataArray = this.dataArray.splice(0, median);
    left.children = this.children.splice(0, median + 1);
    const centerKey = this.keyArray.shift() as string;
    const centerData = this.dataArray.shift() as Data;
    const right = this;
    return { centerKey, centerData, left, right};
  }

  toArrays(): string[][] {
    const arrays: string[][] = [this.keyArray];
    this.children.forEach(child => arrays.push(...child.toArrays()));
    return arrays;
  }
}

export class BTree {
  private root: TreeNode;
  private maxElems: number;

  constructor(maxElems: number) {
    this.root = new TreeNode();
    this.maxElems = maxElems;
  }

  /**
   * @summary The time complexity is O(log N). Always insert a new element to a leaf node.
   * @param key 
   * @param data 
   */
  insert(key: string, data: Data) {
    let node = this.root;
    const parents: TreeNode[] = [];
    
    while(node.hasChildren()) {
      parents.push(node);
      let i = 0;
      for (; i < node.size(); i++) {
        if (node.getKey(i) > key) break;
      }
      node = node.getChild(i);
    }
    node.insert(key, data);
    while(node.size() > this.maxElems) {
      const {centerKey, centerData, left, right} = node.split();
      const parent = parents.pop();
      if (typeof parent === "undefined") {
        const newRoot = new TreeNode();
        newRoot.insert(centerKey, centerData);
        newRoot.addChildren([left, right]);
        this.root = newRoot;
      } else {
        // Find the child index at the parent
        let index = parent.getKeys().findIndex(k => k > key);
        index = index !== -1 ? index : parent.size();
        parent.getChildren().splice(index, 1, left, right);
        parent.insert(centerKey, centerData);
        node = parent;
      }
    }
  }

  /**
   * @summary The time complexity is O(log N).
   * @param key 
   * @returns data if there is a corresponding entry in the tree, or null otherwise.
   */
  search(key: string): Data | null {
    let node = this.root;
    while (node.hasChildren()) {
      // node is not a leaf
      let index = 0;
      for (; index < node.size(); index++) {
        const k = node.getKey(index);
        if (k === key)
          return node.getData(index);
        if (k > key) {
          node = node.getChild(index);
          break;
        }
      }
      if (index === node.size()) {
        node = node.getChild(index);
      }
    }
    // node is a leaf
    for (let index = 0; index < node.size(); index++) {
      const k = node.getKey(index);
      if (k === key) {
        return node.getData(index);
      }
      if (k > key) {
        break;
      }
    }
    return null;
  }

  toArrays(): string[][] {
    return this.root.toArrays();
  }
}