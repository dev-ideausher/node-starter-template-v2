const paginate = (schema) => {
  schema.statics.paginate = async function (
    filter,
    options,
    geoFilters = null
  ) {
    const sortOrder = options.sortOrder === "desc" ? -1 : 1;
    const sortField = options.sortBy ? options.sortBy : "createdAt";
    const limit =
      options.limit && parseInt(options.limit, 10) > 0
        ? parseInt(options.limit, 10)
        : 10;
    const page =
      options.page && parseInt(options.page, 10) > 0
        ? parseInt(options.page, 10)
        : 1;
    const skip = (page - 1) * limit;
    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    if (geoFilters) {
      docsPromise = docsPromise.where(geoFilters);
    }
    if (options.populate) {
      const populateOptions = Array.isArray(options.populate)
        ? options.populate
        : [options.populate];
      const populateStore = {};
      populateOptions.forEach((populateOption) => {
        const [path, select] = populateOption.split(":");
        populateStore[path] = populateStore[path]
          ? `${populateStore[path]} ${select}`
          : select;
      });
      Object.keys(populateStore).forEach((key) => {
        docsPromise = docsPromise.populate({
          path: key,
          select: populateStore[key],
        });
      });
    }
    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        page,
        limit,
        results,
        totalPages,
        totalResults,
      };
      return result;
    });
  };
};

module.exports = { paginate };
