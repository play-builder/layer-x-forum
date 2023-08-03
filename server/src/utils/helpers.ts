export const makeId = (length: number): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const slugify = (str: string): string => {
  // 한글 및 특수문자 처리를 위한 slugify
  let slug = str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "") // 영문, 숫자, 한글, 공백, 하이픈만 남김
    .replace(/[\s_]+/g, "-") // 공백과 언더스코어를 하이픈으로
    .replace(/^-+|-+$/g, ""); // 앞뒤 하이픈 제거

  // 결과가 비어있으면 랜덤 ID 생성
  if (!slug) {
    slug = makeId(8);
  }

  return slug;
};
