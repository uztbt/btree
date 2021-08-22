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

  // O(k)
  deleteKeyDataShift(index: number) {
    for (let i = index; i-1 < this.numOfElements(); i++) {
      this.keyArray[i] = this.keyArray[i+1];
      this.dataArray[i] = this.dataArray[i+1];
    }
    this.keyArray[this.keyArray.length-1] = null;
    this.dataArray[this.dataArray.length-1] = null;
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

  rotateLeft(index: number) {
    const [lChild, rChild] = [this.children[index]!, this.children[index+1]!];
    // Set an element and a child for the left child.
    lChild.insert(this.keyArray[index]!, this.dataArray[index]);
    lChild.children[this.numOfElements()+1] = rChild.children[0];
    // Set an element for the parent
    this.keyArray[index] = rChild.keyArray[0];
    this.dataArray[index] = rChild.dataArray[0];
    console.log(this.toArrays())
    // Shift the elements and children in the right child
    for (let i = 0; i < rChild.capacity-1; i++) {
      rChild.keyArray[i] = rChild.keyArray[i+1];
      rChild.dataArray[i] = rChild.dataArray[i+1];
      rChild.children[i] = rChild.children[i+1];
    }
    rChild.children[this.capacity-1] = rChild.children[this.capacity];
    rChild.keyArray[this.capacity-1] = null;
    rChild.dataArray[this.capacity-1] = null;
    rChild.children[this.capacity] = null;
  }

  rotateRight(index: number) {
    const [lChild, rChild] = [this.children[index]!, this.children[index+1]!];
    // Set an element and a child for the right child.
    rChild.keyArray.unshift(this.keyArray[index]);
    rChild.keyArray.pop(); // always a null value pops out
    rChild.dataArray.unshift(this.dataArray[index]);
    rChild.dataArray.pop(); // always a null value pops out
    rChild.children.unshift(lChild.children[lChild.numOfElements()]);
    rChild.children.pop();
    // Set an element for the parent
    this.keyArray[index] = lChild.keyArray[lChild.numOfElements()-1]!;
    this.dataArray[index] = lChild.dataArray[lChild.numOfElements()-1];
    // Delete the item from the left child
    const lChildElems = lChild.numOfElements();
    lChild.keyArray[lChildElems-1] = null;
    lChild.dataArray[lChildElems-1] = null;
  }

  merge(index: number) {
    const [lChild, rChild] = [this.children[index]!, this.children[index+1]!];
    // Move an element from the parent to the left child
    lChild.insert(this.keyArray[index]!, this.dataArray[index]);
    this.deleteKeyDataShift(index);
    // Shift the children of the parent
    for (let i = index + 1; i < this.capacity; i++) {
      this.children[i] = this.children[i+1];
    }
    this.children[this.capacity] = null;
    // Move the elements and children from the right to left
    const lnum = lChild.numOfElements();
    for (let i = 0; i < rChild.numOfElements(); i++) {
      lChild.keyArray[lnum+i] = rChild.keyArray[i];
      lChild.dataArray[lnum+i] = rChild.dataArray[i];
      lChild.children[lnum+i] = rChild.children[i];
    }
    lChild.children[lChild.numOfElements()] = rChild.children[rChild.numOfElements()];
  }

    /**
   * @summary The time complexity is O(log N).
   * @param key 
   * @returns data if there is a corresponding entry in the tree, or null otherwise.
   */
     search(key: Key): Data | null {
      let node: TreeNode = this;
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
        break;
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
        const [_, childIndex] = parent.where(centerKey);
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
      node = parent!;
    }
  }

  /**
   * 
   * @param key key of the item to delete
   */
  delete(key: Key): boolean {
    // Find the deleting item in the tree
    let parents: TreeNode[] = [];
    let node = this.root;

    while(node.hasChildren()) {
      let index = 0;
      for (; index <= node.numOfElements(); index++) {
        if (index === node.numOfElements() || key < node.keyArray[index]!) {
          // a. A node with the key might reside in the rightmost subtree.
          // b. A node with the key might reside in the left subtree.
          parents.push(node);
          node = node.children[index]!;
          index = -1;
          break;
        }
        if (key === node.keyArray[index]) {
          // Found the deleting element at node[index]
          // 1. Find the immediate smaller key
          // 2. Replace the deleting key/value with the item found in step 1.
          // 3. Rebalance the tree from the leaf node
          const [targetNode, targetIndex] = [node, index];
          // 1
          const lChild = node.children[index]!; // always exists
          const path = lChild.pathToMaxKeyNode();
          parents.push(node, ...path);
          node = parents.pop()!;
          // 2
          const num = node.numOfElements();
          targetNode.keyArray[targetIndex] = node.keyArray[num-1];
          node.keyArray[num-1] = null;
          targetNode.dataArray[targetIndex] = node.dataArray[num-1];
          node.dataArray[num-1] = null;
          console.log(targetNode.toArrays());
          // 3
          this.rebalance(parents, node);
          return true;
        }
      }
    }

    // node: leaf, parents: path to it (w/o node).
    for (let index = 0; index < node.numOfElements() && key >= node.keyArray[index]!; index++) {
      if (key === node.keyArray[index]!) {
        node.deleteKeyDataShift(index);
        this.rebalance(parents, node);
        return true;
      }
    }
    return false; // Deleting key not found in the tree.
  }


  rebalance(parents: TreeNode[], node: TreeNode) {
    // No need to rebalance
    if (!this.deficient(node) || parents.length === 0) {
      // 1. node is sufficient
      // 2. node is root
      return;
    }
    // Need to rebalance from the node
    const parent = parents.pop()!;
    const [_, pIndex] = parent.where(node.keyArray[0]!);
    if (pIndex > 0) {
      const lSibling = parent.children[pIndex-1]!;
      if (lSibling.numOfElements() > Math.floor(lSibling.capacity/2)) {
        // The left sibling has more than necessary
        parent.rotateRight(pIndex-1);
        return; // rotation terminates rebalancing
      }
    }
    if (pIndex < parent.numOfElements()) {
      const rSibling = parent.children[pIndex+1]!;
      if (rSibling.numOfElements() > Math.floor(rSibling.capacity/2)) {
        // The right sibling has more than necessary
        parent.rotateLeft(pIndex);
        return; // rotation terminates rebalancing
      }
    }
    // Both of the neighboring siblings have just an enough number of elements.
    parent.merge(Math.max(pIndex-1, 0));
    this.rebalance(parents, parent);
  }

  toArrays(): [(Key | null), (Data | null)][][] {
    return this.root.toArrays();
  }

  deficient(node: TreeNode): boolean {
    return node.numOfElements() < Math.floor(this.nodeCapacity/2);
  }
}
