export type Key = number;
export type Data = number;
export class TreeNode {
  capacity: number;
  keyArray: (Key | null)[];
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
    for (let i = this.keyArray.length; 0 <= i; i--) {
      if (this.keyArray[i] != null) {
        return i+1;
      }        
    }
    return 0;
  }

  // O(k)
  hasChildren() {
    return this.children.some(child => child != null)
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

  /**
   * Overwites data when the key already exists in the tree.
   * @param key 
   * @param data 
   * @returns 
   */
  insert(key: Key, data: Data | null) {
    let pos = 0;
    for(; pos < this.numOfElements(); pos++) {
      if (this.keyArray[pos]! === key) {
        this.dataArray[pos] = data;
        return;
      }
      if (this.keyArray[pos]! > key) {
        break;
      }
    }
    let [pk, pd] = [key, data] as [Key | null, Data | null];
    for (; pos < this.numOfElements(); pos++) {
      const [tmpKey, tmpData] = [this.keyArray[pos], this.dataArray[pos]];
      this.keyArray[pos] = pk;
      this.dataArray[pos] = pd;
      [pk, pd] = [tmpKey, tmpData];
    }
    this.keyArray[pos] = pk;
    this.dataArray[pos] = pd;
    if (this.keyArray.length === this.children.length) {
      this.children.push(null);
    }
  }

  // O(k)
  split(): {centerKey: Key, centerData: Data, left: TreeNode, right: TreeNode} {
    const median = Math.ceil(this.capacity/2);
    const left = new TreeNode(this.capacity);
    for (let i = 0; i < median; i++) {
      left.keyArray[i] = this.keyArray[i];
      left.dataArray[i] = this.dataArray[i];
      left.children[i] = this.children[i];
    }
    left.children[median] = this.children[median];
    
    const centerKey = this.keyArray[median]!;
    const centerData = this.dataArray[median]!;

    const right = new TreeNode(this.capacity);
    for (let i = median + 1; i <= this.capacity; i++) {
      right.keyArray[i-(median+1)] = this.keyArray[i];
      right.dataArray[i-(median+1)] = this.dataArray[i];
      right.children[i-(median+1)] = this.children[i];
    }
    right.children[this.capacity-median] = this.children[this.capacity+1];
    return { centerKey, centerData, left, right};
  }

  // O(N)
  toArrays(): [(Key | null), (Data | null)][][] {
    const zipped: [(Key | null), (Data | null)][] = [];
    for (let i = 0; i < this.keyArray.length; i++) {
      zipped.push([this.keyArray[i], this.dataArray[i]]);
    }
    const arrays: [(Key | null), (Data | null)][][] = [zipped]
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
  where(key: Key): [number, number] {
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
  root: TreeNode;

  constructor(nodeCapacity: number) {
    this.nodeCapacity = nodeCapacity;
    this.root = new TreeNode(nodeCapacity);
  }

  /**
   * @summary The time complexity is O(log N).
   * @param key 
   * @param data 
   */
  insert(key: Key, data: Data) {
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
        return;
      } else {
        // Find the child index at the parent
        const [keyIndex, childIndex] = parent.where(centerKey);
        if (keyIndex !== -1) {
          parent.dataArray[keyIndex] = centerData;
        } else {
          parent.insert(centerKey, centerData);
          parent.children[childIndex] = left;
          let prev = right;
          for (let i = childIndex+1; i <= parent.numOfElements(); i++) {
            const temp = parent.children[i];
            parent.children[i] = prev;
            if (temp === null) {
              break;
            } else {
              prev = temp;
            }
          }
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
  search(key: Key): Data | null {
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
  // delete(key: string): boolean {
  //   // Find the deleting item in the tree
  //   let parents: TreeNode[] = [];
  //   let node = this.root;

  //   while(node.hasChildren()) {
  //     let index = 0;
  //     for (; index <= node.size(); index++) {
  //       if (index === node.size() || key < node.getKey(index)) {
  //         // a. A node with the key might reside in the rightmost subtree.
  //         // b. A node with the key might reside in the left subtree.
  //         parents.push(node);
  //         node = node.getChild(index);
  //         index = -1;
  //         break;
  //       }
  //       if (key === node.getKey(index)) {
  //         // Found the deleting element at node[index]
  //         // 1. Find the immediate smaller key
  //         // 2. Replace the deleting key/value with the item found in step 1.
  //         // 3. Rebalance the tree from the leaf node
  //         const [targetNode, targetIndex] = [node, index];
  //         // 1
  //         const lChild = node.getChild(index); // always exists
  //         const path = lChild.pathToMaxKeyNode();
  //         parents.push(node, ...path);
  //         node = parents.pop()!;
  //         // 2
  //         targetNode.keyArray[targetIndex] = node.keyArray.pop()!;
  //         targetNode.dataArray[targetIndex] = node.dataArray.pop()!;
  //         break;
  //         // 3
  //         rebalance(parents, node);
  //         return true;
  //       }
  //     }
  //   }

  //   // node: leaf, parents: path to it (w/o node).
  //   for (let index = 0; index < node.size() && key >= node.getKey(index); index++) {
  //     if (key === node.getKey(index)) {
  //       node.deleteKeyData(index);
  //       rebalance(parents, node);
  //       return true;
  //     }
  //   }
  //   return false; // Deleting key not found in the tree.
  // }


  // rebalance(parents: TreeNode[], node: TreeNode) {
  //   if (!this.deficient(node))
  //     return; // no need to rebalance anymore
  //   // need to rebalance from the node
  //   const parent = parents.pop()!;
  //   const pIndex = parent.whichSubtree(node.getKey(0));
  //   if (pIndex > 0) {
  //     const lSibling = parent.getChild(pIndex-1);
  //     if (lSibling.size() > Math.floor(this.maxElems/2)) {
  //       // The left sibling has more than necessary
  //       // Rotate right.
  //       node.keyArray.unshift(parent.getKey(pIndex-1));
  //       node.dataArray.unshift(parent.getData(pIndex-1));
  //       parent.keyArray[pIndex-1] = lSibling.keyArray.pop()!;
  //       parent.dataArray[pIndex-1] = lSibling.dataArray.pop()!;
  //       if (lSibling.children.length > 0) {
  //         const lChild = lSibling.getChild(lSibling.size()-1);
  //         const rChild = lSibling.getChild(lSibling.size());
  //         lChild.keyArray.push(...rChild.keyArray);
  //         lChild.keyArray.push(...rChild.keyArray);
  //       }
  //       return; // rotation ends rebalancing
  //     }
  //   }
  //   if (pIndex < parent.size()) {
  //     const rSibling = parent.getChild(pIndex+1);
  //     if (rSibling.size() > Math.floor(this.maxElems/2)) {
  //       // The right sibling has more than necessary
  //       // Rotate left.
  //       node.keyArray.push(parent.getKey(pIndex));
  //       node.dataArray.push(parent.getData(pIndex));
  //       parent.keyArray[pIndex] = rSibling.keyArray.shift()!;
  //       parent.dataArray[pIndex] = rSibling.dataArray.shift()!;
  //       return; // rotation ends rebalancing
  //     }
  //   }
  // }

  toArrays(): [(Key | null), (Data | null)][][] {
    return this.root.toArrays();
  }

  deficient(node: TreeNode): boolean {
    return node.numOfElements() <= Math.floor(this.nodeCapacity/2);
  }
}
