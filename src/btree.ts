import nodeCluster from "node:cluster";

export type Data = Map<string, string>;
class TreeNode {
  capacity: number;
  keyArray: (string | null)[];
  dataArray: (Data | null)[];
  children: (TreeNode | null)[];
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.keyArray = Array(capacity).fill(null);
    this.dataArray = Array(capacity).fill(null);
    this.children = Array(capacity+1).fill(null);
  }

  // O(k)
  numOfElements(): number {
    let lastNonNullIndex = 0;
    for (let i = 0; i < this.capacity; i++) {
      if (this.keyArray[i] !== null)
        lastNonNullIndex = i;
    }
    return lastNonNullIndex;
  }

  // O(1)
  hasChildren() {
    return this.children[0] !== null;
  }

  // O(kh)
  pathToMaxKeyNode(): TreeNode[] {
    const path: TreeNode[] = [];
    let node: TreeNode = this;
    while (node.hasChildren()) {
      path.push(node);
      node = node.children[node.numOfElements()]!;
    }
    path.push(node); // leaf node
    return path;
  }

  // O(1)
  deleteKeyAndData(index: number) {
    this.keyArray[index] = null;
    this.dataArray[index] = null;
  }

  // O(k)
  insert(key: string, data: Data) {
    let pos = 0;
    for(; pos < this.numOfElements(); pos++) {
      if (this.keyArray[pos]! > key) {
        break;
      }
    }
    this.keyArray[pos] = key;
    this.dataArray[pos] = data;
  }

  // O(k)
  split(): {centerKey: string, centerData: Data, left: TreeNode, right: TreeNode} {
    const median = Math.floor(this.capacity/2);
    const left = new TreeNode(this.capacity);
    for (let i = 0; i < median; i++) {
      left.keyArray[i] = this.keyArray[i];
      this.keyArray[i] = this.keyArray[median+i];
      this.keyArray[median+i] = null;
      left.dataArray[i] = this.dataArray[i];
      this.dataArray[i] = this.dataArray[median+i];
      this.dataArray[median+i] = null;
      left.children[i] = this.children[i];
      this.children[i] = this.children[median+i];
      this.children[median+i+1];
    }
    left.children[median] = this.children[median];
    this.children[median] = null;
    const centerKey = this.keyArray.shift() as string;
    this.keyArray.push(null);
    const centerData = this.dataArray.shift() as Data;
    this.dataArray.push(null);
    const right = this;
    return { centerKey, centerData, left, right};
  }

  // O(N)
  toArrays(): (string | null)[][] {
    const arrays: (string | null)[][] = [this.keyArray];
    for (let i = 0; i <= this.numOfElements(); i++) {
      if (this.children[i] !== null) {
        arrays.push(...this.children[i]!.toArrays());
      } else {
        break;
      }
    }
    return arrays;
  }

  /**
   * Look for the potential location of the key in the node.
   * O(k)
   * @param key for which we look for the location
   * @returns [keyIndex, childIndex], -1 if there is no applicable number
   */
  where(key: string): [number, number] {
    for (let i = 0; i < this.numOfElements(); i++) {
      if (key === this.keyArray[i]!) {
        return [i, -1];
      }
      if (key < this.keyArray[i]!) {
        return [-1, i];
      }
    }
    return [-1, this.numOfElements()];
  }
}

export class BTree {
  private nodeCapacity: number;
  private root: TreeNode;

  constructor(nodeCapacity: number) {
    this.nodeCapacity = nodeCapacity;
    this.root = new TreeNode(nodeCapacity);
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
      const [keyIndex, childIndex] = node.where(key);
      if (keyIndex !== -1) {
        // duplicate key. New element will be inserted in the left subtree.
        node = node.children[keyIndex]!;
      } else {
        node = node.children[childIndex]!;
      }
    }
    node.insert(key, data);
    while(node.numOfElements() > this.nodeCapacity) {
      const {centerKey, centerData, left, right} = node.split();
      const parent = parents.pop();
      if (typeof parent === "undefined") {
        const newRoot = new TreeNode(this.nodeCapacity);
        newRoot.insert(centerKey, centerData);
        newRoot.children[0] = left;
        newRoot.children[1] = right;
        this.root = newRoot;
      } else {
        // Find the child index at the parent
        const [keyIndex, childIndex] = parent.where(centerKey);
        if (keyIndex !== -1) {
          parent.keyArray.splice(keyIndex+1, 0, centerKey);
          parent.dataArray.splice(keyIndex+1, 0, centerData);
          parent.children[keyIndex+1] = left;
          parent.children.splice(keyIndex+2, 0, right);
        } else {
          parent.keyArray.splice(childIndex, 0, centerKey);
          parent.dataArray.splice(childIndex, 0, centerData);
          parent.children[childIndex] = left;
          parent.children.splice(childIndex+1, 0, right);
        }
      }
      node = parent!;
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
      const [keyIndex, childIndex] = node.where(key);
      if (keyIndex !== -1) {
        return node.dataArray[keyIndex];
      } else {
        node = node.children[childIndex]!;
      }
    }
    // node is a leaf
    const [keyIndex, _] = node.where(key);
    if (keyIndex !== -1) {
      return node.dataArray[keyIndex];
    } else {
      return null;
    }
  }

  /**
   * 
   * @param key key of the item to delete
   */
  delete(key: string): boolean {
    // Find the deleting item in the tree
    let parents: TreeNode[] = [];
    let node = this.root;

    while(node.hasChildren()) {
      let index = 0;
      for (; index <= node.size(); index++) {
        if (index === node.size() || key < node.getKey(index)) {
          // a. A node with the key might reside in the rightmost subtree.
          // b. A node with the key might reside in the left subtree.
          parents.push(node);
          node = node.getChild(index);
          index = -1;
          break;
        }
        if (key === node.getKey(index)) {
          // Found the deleting element at node[index]
          // 1. Find the immediate smaller key
          // 2. Replace the deleting key/value with the item found in step 1.
          // 3. Rebalance the tree from the leaf node
          const [targetNode, targetIndex] = [node, index];
          // 1
          const lChild = node.getChild(index); // always exists
          const path = lChild.pathToMaxKeyNode();
          parents.push(node, ...path);
          node = parents.pop()!;
          // 2
          targetNode.keyArray[targetIndex] = node.keyArray.pop()!;
          targetNode.dataArray[targetIndex] = node.dataArray.pop()!;
          break;
          // 3
          rebalance(parents, node);
          return true;
        }
      }
    }

    // node: leaf, parents: path to it (w/o node).
    for (let index = 0; index < node.size() && key >= node.getKey(index); index++) {
      if (key === node.getKey(index)) {
        node.deleteKeyData(index);
        rebalance(parents, node);
        return true;
      }
    }
    return false; // Deleting key not found in the tree.
  }


  rebalance(parents: TreeNode[], node: TreeNode) {
    if (!this.deficient(node))
      return; // no need to rebalance anymore
    // need to rebalance from the node
    const parent = parents.pop()!;
    const pIndex = parent.whichSubtree(node.getKey(0));
    if (pIndex > 0) {
      const lSibling = parent.getChild(pIndex-1);
      if (lSibling.size() > Math.floor(this.maxElems/2)) {
        // The left sibling has more than necessary
        // Rotate right.
        node.keyArray.unshift(parent.getKey(pIndex-1));
        node.dataArray.unshift(parent.getData(pIndex-1));
        parent.keyArray[pIndex-1] = lSibling.keyArray.pop()!;
        parent.dataArray[pIndex-1] = lSibling.dataArray.pop()!;
        if (lSibling.children.length > 0) {
          const lChild = lSibling.getChild(lSibling.size()-1);
          const rChild = lSibling.getChild(lSibling.size());
          lChild.keyArray.push(...rChild.keyArray);
          lChild.keyArray.push(...rChild.keyArray);
        }
        return; // rotation ends rebalancing
      }
    }
    if (pIndex < parent.size()) {
      const rSibling = parent.getChild(pIndex+1);
      if (rSibling.size() > Math.floor(this.maxElems/2)) {
        // The right sibling has more than necessary
        // Rotate left.
        node.keyArray.push(parent.getKey(pIndex));
        node.dataArray.push(parent.getData(pIndex));
        parent.keyArray[pIndex] = rSibling.keyArray.shift()!;
        parent.dataArray[pIndex] = rSibling.dataArray.shift()!;
        return; // rotation ends rebalancing
      }
    }
  }

  toArrays(): (string|null)[][] {
    return this.root.toArrays();
  }

  deficient(node: TreeNode): boolean {
    return node.numOfElements() <= Math.floor(this.nodeCapacity/2);
  }
}
