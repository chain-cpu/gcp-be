
let allData = {};
exports.set = (key, value) => {
    allData[key] = JSON.stringify(value);
}

exports.get = (key) => {
    return allData[key] ? JSON.parse(allData[key]) : undefined;
}