const bcrypt = require("bcryptjs");

// Reusable plugin: hashes `password` on save and adds a comparePassword method.
module.exports = function passwordHash(schema) {
  schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

  schema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
  };
};
