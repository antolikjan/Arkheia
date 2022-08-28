module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    await db
      .collection("submissions")
      .updateMany({}, { $set: { from_parameter_search: true } });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    await db
      .collection("submissions")
      .updateMany({}, { $unset: { from_parameter_search: null } });
  },
};
