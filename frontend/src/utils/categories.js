// 維護後端商品分類值與前端繁體中文名稱的固定對照。
export const categories = [
  {
    value: "FOOD",
    label: "食物",
  },
  {
    value: "CAR",
    label: "交通",
  },
  {
    value: "E_BOOK",
    label: "書籍",
  },
];

export function getCategoryLabel(value) {
  return categories.find((category) => category.value === value)?.label ?? value;
}
