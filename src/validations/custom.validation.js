const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid id');
  }
  return new mongoose.Types.ObjectId(value);
};
  
module.exports = {
  objectId
}
