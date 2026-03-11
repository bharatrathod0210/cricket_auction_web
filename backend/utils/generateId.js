const generateId = () => {
    return require('crypto').randomUUID();
};

module.exports = generateId;
