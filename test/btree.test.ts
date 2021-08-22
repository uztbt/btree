import {TreeNode, BTree } from "../src/btree";

test("insert - Simple", () => {
    const tree = new BTree(4);
    tree.insert(200, 200);
    expect(tree.toArrays()).toEqual([
        [[200, 200], [null, null], [null, null], [null, null]]
    ]);
    tree.insert(85, 85);
    expect(tree.toArrays()).toEqual([
      [[85, 85], [200, 200], [null, null], [null, null]]
    ]);
    tree.insert(100, 100);
    expect(tree.toArrays()).toEqual([
      [[85, 85], [100, 100], [200, 200], [null, null]]
    ]);
    tree.insert(100, 100);
    expect(tree.toArrays()).toEqual([
      [[85, 85], [100, 100], [200, 200], [null, null]]
    ]);
    tree.insert(110, 110);
    expect(tree.toArrays()).toEqual([
      [[85, 85], [100, 100], [110, 110], [200, 200]]
    ]);
    tree.insert(120, 120);
    expect(tree.toArrays()).toEqual([
        [[110, 110], [null, null], [null, null], [null, null]],
        [[85, 85], [100, 100], [null, null], [null, null]],
        [[120, 120], [200, 200], [null, null], [null, null]]
    ]);
});

test("insert - 1 step", () => {
    const tree = defaultBTree();
    tree.insert(150, 150);
    const expected1 = new TreeNode(4);
    expected1.keyArray = [130, 150, 175, null];
    expected1.dataArray = [130, 150, 175, null];
    expected1.keyArray = [130, 150, 175, null];
    const expected10 = new TreeNode(4);
    expected10.keyArray = [105, 115, 120, 125];
    expected10.dataArray = [105, 115, 120, 125];
    expected1.children[0] = expected10;
    const expected11 = new TreeNode(4);
    expected11.keyArray = [135, 145, null, null];
    expected11.dataArray = [135, 145, null, null];
    expected1.children[1] = expected11;
    const expected12 = new TreeNode(4);
    expected12.keyArray = [160, 165, null, null];
    expected12.dataArray = [160, 165, null, null];
    expected1.children[2] = expected12;
    const expected13 = new TreeNode(4);
    expected13.keyArray = [193, 196, null, null];
    expected13.dataArray = [193, 196, null, null];
    expected1.children[3] = expected13;
    expect(tree.root.children[1]).toEqual(expected1);
});

function defaultBTree(): BTree {
    const root = new TreeNode(4);
    const n00 = new TreeNode(4);
    const n01 = new TreeNode(4);
    const n02 = new TreeNode(4);
    root.insert(85, 85);
    root.insert(200, 200);
    root.children[0] = n00;
    root.children[1] = n01;
    root.children[2] = n02;
    const n000 = new TreeNode(4);
    const n001 = new TreeNode(4);
    const n002 = new TreeNode(4);
    n00.insert(30, 30);
    n00.insert(55, 55);
    n00.children[0] = n000;
    n00.children[1] = n001;
    n00.children[2] = n002;
    n000.insert(5, 5);
    n000.insert(15, 15);
    n000.insert(25, 25);
    n001.insert(35, 35);
    n001.insert(45, 45);
    n002.insert(65, 65);
    n002.insert(75, 75);
    const n010 = new TreeNode(4);
    const n011 = new TreeNode(4);
    const n012 = new TreeNode(4);
    n01.insert(130, 130);
    n01.insert(175, 175);
    n01.children[0] = n010;
    n01.children[1] = n011;
    n01.children[2] = n012;
    n010.insert(105, 105);
    n010.insert(115, 115);
    n010.insert(120, 120);
    n010.insert(125, 125);
    n011.insert(135, 135);
    n011.insert(145, 145);
    n011.insert(160, 160);
    n011.insert(165, 165);
    n012.insert(193, 193);
    n012.insert(196, 196);
    const n020 = new TreeNode(4);
    const n021 = new TreeNode(4);
    const n022 = new TreeNode(4);
    n02.insert(230, 230);
    n02.insert(260, 260);
    n02.children[0] = n020;
    n02.children[1] = n021;
    n02.children[2] = n022;
    n020.insert(205, 205);
    n020.insert(215, 215);
    n020.insert(225, 225);
    n021.insert(235, 235);
    n021.insert(245, 245);
    n021.insert(255, 255);
    n022.insert(265, 265);
    n022.insert(275, 275);
    const btree = new BTree(4);
    btree.root = root;
    return btree;
  }