export const generateTestObj = () => {
  const list = [
    "apple",
    "banana",
    "orange",
    "pizza",
    "mango",
    "fishburger",
    "Pepsi",
  ];
  let currListItem = list[2];
  const changeCurrListItem = (i) => {
    currListItem = list[i];
  };
  const getCurrListItem = () => {
    return currListItem;
  };
  return {
    currListItem,
    getCurrListItem,
    changeCurrListItem,
  };
};
