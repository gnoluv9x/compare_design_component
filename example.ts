import { compareComponentSets, formatChangesForUI, ComponentSetJson } from "./compareComponentSets";

const oldSet: ComponentSetJson = {
  id: "123",
  name: "Example Component Set",
  componentKey: "example-component-set-key",
  componentProperties: {
    "Show Trailing Icon": { type: "BOOLEAN", defaultValue: false },
    "Show Leading Icon": { type: "BOOLEAN", defaultValue: false },
    Label: { type: "TEXT", defaultValue: "Button" },
    Size: {
      type: "VARIANT",
      variantOptions: ["Small", "Medium", "Large"],
      defaultValue: "Medium",
    },
    "Leading Icon": { type: "INSTANCE_SWAP", defaultValue: "example-leading-icon-instance-id", preferredValues: [] },
    "Trailing Icon": { type: "INSTANCE_SWAP", defaultValue: "example-trailing-icon-instance-id", preferredValues: [] },
  },
};

const newSet: ComponentSetJson = {
  id: "123",
  name: "Updated Component Set",
  componentKey: "example-component-set-key",
  componentProperties: {
    "Show Trailing Icon": { type: "BOOLEAN", defaultValue: false },
    "Show Leading Icon": { type: "TEXT", defaultValue: "icon" },
    Label: { type: "TEXT", defaultValue: "Button" },
    Size: {
      type: "VARIANT",
      variantOptions: ["Small", "Medium", "XL"],
      defaultValue: "Medium",
    },
    "Leading Icon": { type: "INSTANCE_SWAP", defaultValue: "example-leading-icon-instance-id", preferredValues: [] },
  },
};

const changes = compareComponentSets(oldSet, newSet);
const uiData = formatChangesForUI(changes);

// console.table(uiData);

console.log(changes)
