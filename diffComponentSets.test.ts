import { diffComponentSets } from "./diffComponentSets";

// ─── Dữ liệu gốc (old) ───────────────────────────────────────────────────────

const oldJson = [
  // 1. Component không thay đổi gì → KHÔNG xuất hiện trong kết quả
  {
    id: "1",
    name: "Badge",
    componentKey: "badge-key",
    someOtherField: "ignored",
    componentProperties: {
      Label: { type: "TEXT", defaultValue: "New" },
      Color: {
        type: "VARIANT",
        defaultValue: "Red",
        variantOptions: ["Red", "Green", "Blue"],
      },
    },
  },

  // 2. Component bị đổi tên → nameChanged
  {
    id: "2",
    name: "Btn",
    componentKey: "button-key",
    componentProperties: {
      Label: { type: "TEXT", defaultValue: "Click me" },
      Size: {
        type: "VARIANT",
        defaultValue: "Medium",
        variantOptions: ["Small", "Medium", "Large"],
      },
      "Show Icon": { type: "BOOLEAN", defaultValue: false },
    },
  },

  // 3. Component có property bị xóa, thêm mới, và sửa defaultValue
  {
    id: "3",
    name: "Input",
    componentKey: "input-key",
    componentProperties: {
      Placeholder: { type: "TEXT", defaultValue: "Enter text..." },
      Disabled: { type: "BOOLEAN", defaultValue: false },
      "Leading Icon": {
        type: "INSTANCE_SWAP",
        defaultValue: "icon-search-id",
        preferredValues: [],
      },
      Size: {
        type: "VARIANT",
        defaultValue: "Medium",
        variantOptions: ["Small", "Medium"],
      },
    },
  },

  // 4. Component bị xóa hoàn toàn trong newJson
  {
    id: "4",
    name: "Tooltip",
    componentKey: "tooltip-key",
    componentProperties: {
      Content: { type: "TEXT", defaultValue: "Tooltip text" },
      Position: {
        type: "VARIANT",
        defaultValue: "Top",
        variantOptions: ["Top", "Bottom", "Left", "Right"],
      },
    },
  },
];

// ─── Dữ liệu mới (new) ───────────────────────────────────────────────────────

const newJson = [
  // 1. Không đổi → không xuất hiện trong kết quả
  {
    id: "1",
    name: "Badge",
    componentKey: "badge-key",
    someOtherField: "still-ignored",
    componentProperties: {
      Label: { type: "TEXT", defaultValue: "New" },
      Color: {
        type: "VARIANT",
        defaultValue: "Red",
        variantOptions: ["Red", "Green", "Blue"],
      },
    },
  },

  // 2. Đổi tên component + sửa defaultValue của Size
  {
    id: "2",
    name: "Button",                          // ← đổi tên từ "Btn"
    componentKey: "button-key",
    componentProperties: {
      Label: { type: "TEXT", defaultValue: "Click me" },
      Size: {
        type: "VARIANT",
        defaultValue: "Large",              // ← đổi từ "Medium"
        variantOptions: ["Small", "Medium", "Large"],
      },
      "Show Icon": { type: "BOOLEAN", defaultValue: false },
    },
  },

  // 3. Xóa "Disabled", thêm "Error", sửa variantOptions của Size, sửa preferredValues của Leading Icon
  {
    id: "3",
    name: "Input",
    componentKey: "input-key",
    componentProperties: {
      Placeholder: { type: "TEXT", defaultValue: "Enter text..." },
      // "Disabled" đã bị xóa
      "Leading Icon": {
        type: "INSTANCE_SWAP",
        defaultValue: "icon-search-id",
        preferredValues: ["icon-search-id", "icon-edit-id"], // ← thêm preferred values
      },
      Size: {
        type: "VARIANT",
        defaultValue: "Medium",
        variantOptions: ["Small", "Medium", "Large"],        // ← thêm "Large"
      },
      Error: { type: "BOOLEAN", defaultValue: false },       // ← property mới
    },
  },

  // 4. "Tooltip" (id: "4") bị xóa khỏi newJson

  // 5. Component hoàn toàn mới
  {
    id: "5",
    name: "Checkbox",
    componentKey: "checkbox-key",
    componentProperties: {
      Label: { type: "TEXT", defaultValue: "Accept terms" },
      Checked: { type: "BOOLEAN", defaultValue: false },
      Size: {
        type: "VARIANT",
        defaultValue: "Medium",
        variantOptions: ["Small", "Medium", "Large"],
      },
    },
  },
];

// ─── Chạy và in kết quả ──────────────────────────────────────────────────────

const oldPage = { pageId: "page-1", pageName: "Components", components: oldJson };
const newPage = { pageId: "page-1", pageName: "Components", components: newJson };

const result = diffComponentSets(oldPage as any, newPage as any);
console.log(JSON.stringify(result, null, 2));

/*
Kết quả mong đợi:
  - id "1" (Badge): KHÔNG xuất hiện (không có thay đổi)
  - id "2" (Button): modified — nameChanged + Size.defaultValue đổi
  - id "3" (Input): modified — "Disabled" removed, "Error" added, Size & Leading Icon modified
  - id "4" (Tooltip): removed
  - id "5" (Checkbox): added
*/
