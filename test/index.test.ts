import { BTree, Data } from "../src/btree";

const characters: {[name: string]: Data} = {
  "Stan": new Map([["Gender", "Male"], ["Voiced by", "Trey Parker"]]),
  "Kyle": new Map([["Gender", "Male"], ["Voiced by", "Matt Stone"]]),
  "Eric": new Map([["Gender", "Male"], ["Voiced by", "Trey Parker"]]),
  "Kenny": new Map([["Gender", "Male"], ["Voiced by", "Matt Stone"]]),
  "Butters": new Map([["Gender", "Male"], ["Voiced by", "Matt Stone"]]),
  "Wendy": new Map([["Gender", "Female"], ["Voiced by", "Eliza Schneider"]]),
  "Jimmy": new Map([["Gender", "Male"], ["Voiced by", "Trey Parker"]]),
  "Token": new Map([["Gender", "Male"], ["Voiced by", "Adrien Beard"]]),
  "Clyde": new Map([["Gender", "Male"], ["Voiced by", "Trey Parker"]]),
  "Craig": new Map([["Gender", "Male"], ["Voiced by", "Matt Stone"]]),
  "Tweak": new Map([["Gender", "Male"], ["Voiced by", "Matt Stone"]]),
  "Timmy": new Map([["Gender", "Male"], ["Voiced by", "Trey Parker"]]),
  "Scott": new Map([["Gender", "Male"], ["Voiced by", "Matt Stone"]]),
  "Heidi": new Map([["Gender", "Female"], ["Voiced by", "Jessica Makinson"]])
};



test("Scenario", () => {
  const btree = new BTree(3);
  console.log("Created a B-Tree")
    
  insert(btree, "Stan");
  insert(btree, "Kyle");
  insert(btree, "Eric");
  expect(btree.toArrays()).toEqual([["Eric", "Kyle", "Stan"]]);
  insert(btree, "Kenny");
  expect(btree.toArrays()).toEqual([["Kyle"], ["Eric", "Kenny"], ["Stan"]]);
  insert(btree, "Butters");
  insert(btree, "Wendy");
  insert(btree, "Jimmy");
  expect(btree.toArrays()).toEqual([
    ["Jimmy", "Kyle"],
    ["Butters", "Eric"], ["Kenny"], ["Stan", "Wendy"]]);
  insert(btree, "Token");
  insert(btree, "Clyde");
  insert(btree, "Craig");
  insert(btree, "Tweak");
  expect(btree.toArrays()).toEqual([
    ["Kyle"],
    ["Craig", "Jimmy"],
    ["Butters", "Clyde"], ["Eric"], ["Kenny"],
    ["Tweak"],
    ["Stan", "Token"], ["Wendy"]]);
});

function insert(btree: BTree, name: string) {
  btree.insert(name, characters[name]);
}