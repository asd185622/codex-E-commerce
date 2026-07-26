// 維護後端商品分類值與前端繁體中文名稱的固定對照。
export const categories = [
  {
    value: "FOOD",
    label: "食味",
  },
  {
    value: "CAR",
    label: "行旅",
  },
  {
    value: "E_BOOK",
    label: "閱讀",
  },
];

export function getCategoryLabel(value) {
  return categories.find((category) => category.value === value)?.label ?? value;
}
