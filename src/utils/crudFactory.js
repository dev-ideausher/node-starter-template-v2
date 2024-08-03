const httpStatus = require('http-status');

const ApiError = require('./ApiError');

/**
 * A factory class for CRUD operations on a Mongoose model.
 * @template T
 */
class CrudFactory {
  /**
   * Creates an instance of CrudFactory.
   * @param {import('mongoose').Model<T>} mongooseModel - The Mongoose model.
   * @param {string} entityName - The name of the entity.
   */
  constructor(mongooseModel, entityName) {
    this.Model = mongooseModel;
    this.entityName = entityName;
  }

  async getManyPaginated(filters, options) {
    return this.Model.paginate(filters, options);
  }

  /**
   * Creates a new document.
   * @param {Partial<T>} data - The data to create the document with.
   * @returns {Promise<T>} The created document.
   */
  async create(data) {
    const doc = await this.Model.create(data);
    return doc;
  }

  /**
   * Gets a document by its ID.
   * @param {import('mongoose').Types.ObjectId} id - The document ID.
   * @param {import('mongoose').PopulateOptions | import('mongoose').PopulateOptions[] | null} [populateOptions=null] - The populate options.
   * @returns {Promise<T>} The found document.
   * @throws {ApiError} If the document is not found.
   */
  async getOneById(id, populateOptions = null) {
    const query = this.Model.findById(id);
    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `Could not find ${this.entityName} with id ${id}`);

    return doc;
  }

  /**
   * Gets a document by filters.
   * @param {import('mongoose').FilterQuery<T>} filters - The filters to apply.
   * @param {import('mongoose').PopulateOptions | import('mongoose').PopulateOptions[] | null} [populateOptions=null] - The populate options.
   * @returns {Promise<T>} The found document.
   * @throws {ApiError} If the document is not found.
   */
  async getOne(filters, populateOptions = null) {
    const query = this.Model.findOne(filters);
    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `Could not find ${this.entityName} with the given filters`);

    return doc;
  }

  /**
   * Updates a document by its ID.
   * @param {import('mongoose').Types.ObjectId} id - The document ID.
   * @param {import('mongoose').UpdateQuery<T>} data - The update data.
   * @returns {Promise<T>} The updated document.
   * @throws {ApiError} If the document is not found.
   */
  async updateOneById(id, data) {
    const doc = await this.Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `Could not find ${this.entityName} with id ${id}`);
    return doc;
  }

  /**
   * Updates a document by filters.
   * @param {import('mongoose').FilterQuery<T>} filters - The filters to apply.
   * @param {import('mongoose').UpdateQuery<T>} data - The update data.
   * @returns {Promise<T>} The updated document.
   * @throws {ApiError} If the document is not found.
   */
  async updateOne(filters, data) {
    const doc = await this.Model.findOneAndUpdate(filters, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `Could not find ${this.entityName} with the given filters`);
    return doc;
  }

  /**
   * Upserts a document by filters.
   * @param {import('mongoose').FilterQuery<T>} filters - The filters to apply.
   * @param {import('mongoose').UpdateQuery<T>} data - The update data.
   * @returns {Promise<T>} The upserted document.
   * @throws {ApiError} If the document is not found.
   */
  async upsertOne(filters, data) {
    const doc = await this.Model.findOneAndUpdate(filters, data, {
      new: true,
      runValidators: true,
      upsert: true,
    });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `Could not find ${this.entityName} with the given filters`);
    return doc;
  }

  /**
   * Updates multiple documents by filters.
   * @param {import('mongoose').FilterQuery<T>} filters - The filters to apply.
   * @param {import('mongoose').UpdateQuery<T>} data - The update data.
   * @returns {Promise<import('mongoose').UpdateWriteOpResult>} The update result.
   */
  async updateMany(filters, data) {
    return this.Model.updateMany(filters, data);
  }

  /**
   * Deletes a document by its ID.
   * @param {import('mongoose').Types.ObjectId} id - The document ID.
   * @returns {Promise<T>} The deleted document.
   * @throws {ApiError} If the document is not found.
   */
  async deleteOneById(id) {
    const doc = await this.Model.findByIdAndDelete(id);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `Could not find ${this.entityName} with id ${id}`);
    return doc;
  }

  /**
   * Deletes a document by filters.
   * @param {import('mongoose').FilterQuery<T>} filters - The filters to apply.
   * @returns {Promise<T>} The deleted document.
   * @throws {ApiError} If the document is not found.
   */
  async deleteOne(filters) {
    const doc = await this.Model.findOneAndDelete(filters);
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `Could not find ${this.entityName} with the given filters`);
    return doc;
  }

  /**
   * Deletes multiple documents by filters.
   * @param {import('mongoose').FilterQuery<T>} filters - The filters to apply.
   * @returns {Promise<import('mongoose').DeleteResult>} The delete result.
   */
  async deleteMany(filters) {
    return this.Model.deleteMany(filters);
  }
}

module.exports = CrudFactory;
