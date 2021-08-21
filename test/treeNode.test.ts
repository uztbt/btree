import { TreeNode } from "../src/btree";

test("NumOfElements", () => {
  const node = new TreeNode(4);
  expect(node.numOfElements()).toBe(0);
  node.insert(85, 85);
  expect(node.numOfElements()).toBe(1);
  node.insert(200, 200);
  expect(node.numOfElements()).toBe(2);
  node.insert(230, 230);
  expect(node.numOfElements()).toBe(3);
  node.insert(260, 260);
  expect(node.numOfElements()).toBe(4);
  node.insert(290, 290);
  expect(node.numOfElements()).toBe(5); // Exceeds the capacity
});

test("hasChildren - false", () => {
  const node = new TreeNode(4);
  node.insert(85, null);
  node.insert(200, null);
  expect(node.hasChildren()).toBe(false);
});

test("hasChildren - true", () => {
  const node = new TreeNode(4);
  const l = new TreeNode(4);
  const r = new TreeNode(4);
  node.insert(85, 85);
  node.insert(200, 200);
  node.children[0] = l;
  node.children[1] = r;
  expect(node.hasChildren()).toBe(true);
});

test("pathToMaxKeyNode", () => {
  const root = defaultTree();
  const largestNode = new TreeNode(4);
  largestNode.insert(265, 265);
  largestNode.insert(275, 275);
  expect(root.pathToMaxKeyNode().pop()).toEqual(largestNode);
  const a = new TreeNode(4);
  a.insert(65, 65);
  a.insert(75, 75);
  expect(root.children[0]!.pathToMaxKeyNode().pop()).toEqual(a);
});

test("deleteKeyAndData", () => {
  const largest = defaultTree().pathToMaxKeyNode().pop()!;
  largest.deleteKeyAndData(0);
  const expected = new TreeNode(4);
  expected.keyArray[1] = 275;
  expected.dataArray[1] = 275;
  expect(largest).toEqual(expected);
});

test("split - leaf", () => {
  const fullNode = defaultTree().children[1]?.children[0]!;
  fullNode.insert(110, 110);
  const {centerKey, centerData, left, right} = fullNode.split();
  expect(centerKey).toBe(115);
  expect(centerData).toBe(115);
  const expectedL = new TreeNode(4);
  expectedL.insert(105, 105);
  expectedL.insert(110, 110);
  expect(left).toEqual(expectedL);
  const expectedR = new TreeNode(4);
  expectedR.insert(120, 120);
  expectedR.insert(125, 125);
  expect(right).toEqual(expectedR);
});

test("search", () => {
  const root = defaultTree();
  expect(root.where(20)).toEqual([-1, 0]);
  expect(root.where(85)).toEqual([0, -1]);
  expect(root.where(150)).toEqual([-1, 1]);
  expect(root.where(200)).toEqual([1, -1]);
  expect(root.where(250)).toEqual([-1, 2]);
});

function defaultTree(): TreeNode {
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
  return root;
}