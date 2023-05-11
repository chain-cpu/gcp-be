
let allData = {};
exports.set = (key, value) => {
    allData[key] = value;
}

exports.get = (key) => {
    return allData[key] ? allData[key] : 'empty';
}