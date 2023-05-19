let memoryDB = {};
export function set(key, value) {
  memoryDB[key] = JSON.stringify(value);
}

export function get(key) {
  return memoryDB[key] ? JSON.parse(memoryDB[key]) : undefined;
}
// arrrayKey_cnt => value
// arrrayKey_arrayIndex => value
// arrrayKey_0,arrrayKey_1, arrrayKey_2,arrrayKey_3

// array util functions
export function arrayPush(arrayKey, data) {
  let cnt = arrayGetCnt(arrayKey);
  if (cnt == undefined) cnt = 0;
  arraySetCnt(arrayKey, cnt + 1);
  arraySetData(arrayKey, cnt, data);
  return `${arrayKey}_${cnt}`;
}

export function arrayGetCnt(arrayKey) {
  let cnt = get(`${arrayKey}_cnt`);
  if (cnt == undefined) cnt = 0;
  return cnt;
}

export function arraySetCnt(arrayKey, value) {
  set(`${arrayKey}_cnt`, value);
}

export function arraySetData(arrayKey, index, value) {
  set(`${arrayKey}_${index}`, value);
}
export function arrayGetData(arrayKey, index) {
  return get(`${arrayKey}_${index}`);
}

export function arrayGetAll(arrayKey) {
  const cnt = arrayGetCnt(arrayKey);
  let res = [];

  for (let i = 0; i < cnt; i++) {
    res.push(arrayGetData(arrayKey, i));
  }

  return res;
}
